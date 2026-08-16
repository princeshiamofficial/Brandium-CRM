-- Supabase PostgreSQL Migration for Module 14: Billing & Payments
-- Purpose: Invoices & separate Payments storage with atomic server-side financial transaction logic

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  prospect_name TEXT,
  description TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  due_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
  transaction_reference TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recorded_by_name TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Users
CREATE POLICY "Authenticated users can read invoices"
  ON public.invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON public.invoices FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete invoices"
  ON public.invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read invoice_payments"
  ON public.invoice_payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoice_payments"
  ON public.invoice_payments FOR INSERT TO authenticated WITH CHECK (true);

-- Performance Indexes
CREATE INDEX idx_invoices_prospect ON public.invoices(prospect_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);

-- Atomic Server-Side Financial Transaction Function for Payment Updates:
-- Calculation: Due = Total Amount - Sum(valid payments)
-- Never trusts frontend calculations; enforces strict financial status rules.
CREATE OR REPLACE FUNCTION public.record_invoice_payment(
  p_invoice_id UUID,
  p_amount NUMERIC(12, 2),
  p_payment_method TEXT DEFAULT 'Bank Transfer',
  p_transaction_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_recorded_by UUID DEFAULT NULL,
  p_recorded_by_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_amount NUMERIC(12, 2);
  v_current_status TEXT;
  v_sum_paid NUMERIC(12, 2);
  v_due NUMERIC(12, 2);
  v_new_status TEXT;
  v_payment_id UUID;
BEGIN
  -- Lock target invoice FOR UPDATE to prevent race conditions
  SELECT total_amount, status INTO v_total_amount, v_current_status
  FROM public.invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF v_total_amount IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  IF v_current_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Cannot record payment for a cancelled invoice';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  -- 1. Insert Payment Record
  INSERT INTO public.invoice_payments (
    invoice_id, amount, payment_method, transaction_reference, notes, recorded_by, recorded_by_name
  )
  VALUES (
    p_invoice_id, p_amount, p_payment_method, p_transaction_reference, p_notes, p_recorded_by, p_recorded_by_name
  )
  RETURNING id INTO v_payment_id;

  -- 2. Recalculate Sum(valid payments)
  SELECT COALESCE(SUM(amount), 0.00) INTO v_sum_paid
  FROM public.invoice_payments
  WHERE invoice_id = p_invoice_id AND is_valid = true;

  -- 3. Calculate Due = Total Amount - Sum(valid payments)
  v_due := GREATEST(0.00, v_total_amount - v_sum_paid);

  -- 4. Determine financial status
  IF v_due <= 0.00 THEN
    v_new_status := 'Paid';
  ELSIF v_sum_paid > 0.00 THEN
    v_new_status := 'Partially Paid';
  ELSE
    v_new_status := 'Pending';
  END IF;

  -- 5. Update Invoice Record
  UPDATE public.invoices
  SET paid_amount = LEAST(v_total_amount, v_sum_paid),
      due_amount = v_due,
      status = v_new_status,
      updated_at = now()
  WHERE id = p_invoice_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'invoice_id', p_invoice_id,
    'total_amount', v_total_amount,
    'paid_amount', LEAST(v_total_amount, v_sum_paid),
    'due_amount', v_due,
    'status', v_new_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated;
