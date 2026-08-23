-- Supabase PostgreSQL Migration for Module 12: SMS Logs
-- Purpose: Track every single and bulk SMS sending attempt with provider credentials

CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  prospect_name TEXT,
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Sent',
  mode TEXT NOT NULL DEFAULT 'Single',
  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_by_name TEXT,
  provider TEXT DEFAULT 'BulksmsBD',
  api_response_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Authenticated users can read sms_logs"
  ON public.sms_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sms_logs"
  ON public.sms_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Performance Indexes
CREATE INDEX idx_sms_logs_prospect ON public.sms_logs(prospect_id);
CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at DESC);
