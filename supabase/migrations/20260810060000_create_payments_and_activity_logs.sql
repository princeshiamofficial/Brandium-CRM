-- Supabase PostgreSQL Migration for Module 15: Reusable Payments System
-- Purpose: Independent payments table with 7-step atomic transaction processing, financial status rules, activity logging, and restoration control

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT NOT NULL DEFAULT 'Bank Transfer',
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure Activities table exists for Step 6 Activity Logging
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'payment_recorded',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read payments"
  ON public.payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read activities"
  ON public.activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- Performance Indexes
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);

-- 7-Step Atomic Payment Transaction Processing Procedure:
-- Step 1. Validate amount (amount > 0, check not cancelled unless restored)
-- Step 2. Insert payment into payments table
-- Step 3. Calculate total paid (Sum of all payments for invoice)
-- Step 4. Calculate due = Total Amount - Total Paid
-- Step 5. Update invoice status (0 -> Pending, >0 & due>0 -> Partially Paid, due<=0 -> Paid)
-- Step 6. Create activity log in activities table
-- Step 7. Commit transaction atomically
CREATE OR REPLACE FUNCTION public.process_invoice_payment_transaction(
  p_invoice_id UUID,
  p_amount NUMERIC(12, 2),
  p_method TEXT DEFAULT 'Bank Transfer',
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_created_by_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_amount NUMERIC(12, 2);
  v_current_status TEXT;
  v_invoice_number TEXT;
  v_prospect_id UUID;
  v_prospect_name TEXT;
  v_total_paid NUMERIC(12, 2);
  v_due NUMERIC(12, 2);
  v_new_status TEXT;
  v_payment_id UUID;
  v_log_msg TEXT;
BEGIN
  -- Step 1. Lock invoice for UPDATE & Validate
  SELECT total_amount, status, invoice_number, prospect_id, prospect_name
  INTO v_total_amount, v_current_status, v_invoice_number, v_prospect_id, v_prospect_name
  FROM public.invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF v_total_amount IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  -- Prevent invalid zero or negative payments
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid payment amount. Amount must be greater than zero.';
  END IF;

  -- Do not allow cancelled invoice payments unless explicitly restored
  IF v_current_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Cannot record payment for a cancelled invoice unless explicitly restored.';
  END IF;

  -- Step 2. Insert Payment Record
  INSERT INTO public.payments (
    invoice_id, amount, payment_date, method, reference, notes, created_by, created_by_name
  )
  VALUES (
    p_invoice_id, p_amount, now(), p_method, p_reference, p_notes, p_created_by, p_created_by_name
  )
  RETURNING id INTO v_payment_id;

  -- Step 3. Calculate Total Paid
  SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
  FROM public.payments
  WHERE invoice_id = p_invoice_id;

  -- Step 4. Calculate Due
  v_due := GREATEST(0.00, v_total_amount - v_total_paid);

  -- Step 5. Update Invoice Status based on financial rules:
  -- - paid = 0 → Pending
  -- - paid > 0 and due > 0 → Partially Paid
  -- - due <= 0 → Paid
  IF v_total_paid = 0.00 THEN
    v_new_status := 'Pending';
  ELSIF v_total_paid > 0.00 AND v_due > 0.00 THEN
    v_new_status := 'Partially Paid';
  ELSE
    v_new_status := 'Paid';
  END IF;

  UPDATE public.invoices
  SET paid_amount = LEAST(v_total_amount, v_total_paid),
      due_amount = v_due,
      status = v_new_status,
      updated_at = now()
  WHERE id = p_invoice_id;

  -- Step 6. Create Activity Log
  v_log_msg := 'Payment of ৳' || p_amount || ' recorded for Invoice ' || COALESCE(v_invoice_number, 'N/A') ||
               ' via ' || p_method || COALESCE(' (Ref: ' || p_reference || ')', '');

  INSERT INTO public.activities (
    actor_id, prospect_id, activity_type, message, created_at
  )
  VALUES (
    p_created_by, v_prospect_id, 'payment_recorded', v_log_msg, now()
  );

  -- Step 7. Commit and return transaction result summary
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'invoice_id', p_invoice_id,
    'invoice_number', v_invoice_number,
    'total_amount', v_total_amount,
    'total_paid', v_total_paid,
    'due', v_due,
    'status', v_new_status,
    'activity_message', v_log_msg
  );
END;
$$;

-- Function to explicitly restore a cancelled invoice so payments can be accepted
CREATE OR REPLACE FUNCTION public.restore_cancelled_invoice(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_amount NUMERIC(12, 2);
  v_total_paid NUMERIC(12, 2);
  v_due NUMERIC(12, 2);
  v_restored_status TEXT;
BEGIN
  SELECT total_amount INTO v_total_amount
  FROM public.invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF v_total_amount IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
  FROM public.payments
  WHERE invoice_id = p_invoice_id;

  v_due := GREATEST(0.00, v_total_amount - v_total_paid);

  IF v_total_paid = 0.00 THEN
    v_restored_status := 'Pending';
  ELSIF v_total_paid > 0.00 AND v_due > 0.00 THEN
    v_restored_status := 'Partially Paid';
  ELSE
    v_restored_status := 'Paid';
  END IF;

  UPDATE public.invoices
  SET status = v_restored_status,
      due_amount = v_due,
      paid_amount = LEAST(v_total_amount, v_total_paid),
      updated_at = now()
  WHERE id = p_invoice_id;

  RETURN jsonb_build_object(
    'success', true,
    'invoice_id', p_invoice_id,
    'status', v_restored_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_invoice_payment_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_cancelled_invoice TO authenticated;
