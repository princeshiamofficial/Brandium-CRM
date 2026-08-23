-- Supabase PostgreSQL Migration for Module 23: Reusable Activity/Audit Logs System
-- Purpose: activity_logs table tracking 9 lifecycle event categories with strict RLS prohibiting edit/delete by normal agents

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT 'Agent',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can read and insert logs
CREATE POLICY "Authenticated users can read activity_logs"
  ON public.activity_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activity_logs"
  ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- STRICT AUDIT SECURITY: Normal agents MUST NOT edit or delete audit records!
-- Prohibit UPDATE and DELETE for non-admins via strict policy (USING false for general authenticated)
CREATE POLICY "Prohibit UPDATE on activity_logs"
  ON public.activity_logs FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Prohibit DELETE on activity_logs"
  ON public.activity_logs FOR DELETE TO authenticated USING (false);

-- Performance Indexes
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- Trigger to enforce immutable audit log entries
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. Editing or deleting audit records is strictly prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_tampering ON public.activity_logs;
CREATE TRIGGER trg_prevent_audit_tampering
BEFORE UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_tampering();

-- Function to record reusable activity log entries
CREATE OR REPLACE FUNCTION public.log_crm_activity(
  p_user_id UUID,
  p_user_name TEXT,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id, user_name, action, entity_type, entity_id, metadata_json, created_at
  )
  VALUES (
    p_user_id, COALESCE(p_user_name, 'Agent'), p_action, p_entity_type, p_entity_id, COALESCE(p_metadata, '{}'::jsonb), now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_crm_activity TO authenticated;
