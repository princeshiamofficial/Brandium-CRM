-- Supabase PostgreSQL Migration for Module 11: Won Sales
-- Purpose: Relational tracking of won sales connected to Prospects, Opportunities, Agents, and Billing

CREATE TABLE IF NOT EXISTS public.won_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sale_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  client_designation TEXT DEFAULT 'Managing Director',
  billing_invoice_id TEXT DEFAULT 'INV-2026-001',
  notes TEXT,
  won_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.won_sales ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated CRM users
CREATE POLICY "Authenticated users can read won_sales"
  ON public.won_sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert won_sales"
  ON public.won_sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update won_sales"
  ON public.won_sales FOR UPDATE
  TO authenticated
  USING (true);

-- Performance Indexes
CREATE INDEX idx_won_sales_prospect ON public.won_sales(prospect_id);
CREATE INDEX idx_won_sales_opportunity ON public.won_sales(opportunity_id);
CREATE INDEX idx_won_sales_agent ON public.won_sales(assigned_agent_id);
