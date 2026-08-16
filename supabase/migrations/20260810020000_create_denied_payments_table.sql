-- Supabase PostgreSQL Migration for Module 10: Denied Payments
-- Purpose: Track clients who denied payment after sales completion

CREATE TABLE IF NOT EXISTS public.denied_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  agent_name TEXT,
  phone TEXT,
  service TEXT NOT NULL,
  denial_reason TEXT NOT NULL,
  denied_by TEXT NOT NULL,
  denied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount NUMERIC(12, 2) DEFAULT 0.00,
  current_stage TEXT NOT NULL DEFAULT 'Denied Payment',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.denied_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Authenticated CRM Users
CREATE POLICY "Authenticated users can read denied_payments"
  ON public.denied_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert denied_payments"
  ON public.denied_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update denied_payments"
  ON public.denied_payments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete denied_payments"
  ON public.denied_payments FOR DELETE
  TO authenticated
  USING (true);

-- Performance Indexes
CREATE INDEX idx_denied_payments_prospect ON public.denied_payments(prospect_id);
CREATE INDEX idx_denied_payments_agent ON public.denied_payments(agent_id);
