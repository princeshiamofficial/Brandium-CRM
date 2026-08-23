-- Supabase PostgreSQL Migration for Module 22: Data Backup & Transactional Restore Engine
-- Purpose: Export full CRM JSON/CSV payloads (users stripped of password_hash/secrets) and transactional restore RPC

CREATE OR REPLACE FUNCTION public.generate_full_crm_backup_payload()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prospects JSONB;
  v_stage_history JSONB;
  v_followups JSONB;
  v_opportunities JSONB;
  v_meetings JSONB;
  v_invoices JSONB;
  v_payments JSONB;
  v_services JSONB;
  v_sms_logs JSONB;
  v_users JSONB;
  v_activities JSONB;
BEGIN
  -- 1. Prospects
  SELECT COALESCE(jsonb_agg(to_jsonb(p)), '[]'::jsonb) INTO v_prospects
  FROM public.prospects p;

  -- 2. Stage History
  SELECT COALESCE(jsonb_agg(to_jsonb(sh)), '[]'::jsonb) INTO v_stage_history
  FROM public.prospect_stage_history sh;

  -- 3. Follow-ups
  SELECT COALESCE(jsonb_agg(to_jsonb(f)), '[]'::jsonb) INTO v_followups
  FROM public.follow_ups f;

  -- 4. Opportunities
  SELECT COALESCE(jsonb_agg(to_jsonb(o)), '[]'::jsonb) INTO v_opportunities
  FROM public.opportunities o;

  -- 5. Meetings
  SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]'::jsonb) INTO v_meetings
  FROM public.meetings m;

  -- 6. Invoices
  SELECT COALESCE(jsonb_agg(to_jsonb(i)), '[]'::jsonb) INTO v_invoices
  FROM public.invoices i;

  -- 7. Payments
  SELECT COALESCE(jsonb_agg(to_jsonb(pay)), '[]'::jsonb) INTO v_payments
  FROM public.payments pay;

  -- 8. Services
  SELECT COALESCE(jsonb_agg(to_jsonb(s)), '[]'::jsonb) INTO v_services
  FROM public.services s;

  -- 9. SMS Logs
  SELECT COALESCE(jsonb_agg(to_jsonb(sms)), '[]'::jsonb) INTO v_sms_logs
  FROM public.sms_logs sms;

  -- 10. Users (EXCLUDING PASSWORDS/SECRETS! Remove password_hash for security)
  SELECT COALESCE(
    jsonb_agg(
      to_jsonb(u) - 'password_hash' - 'secret' - 'token'
    ),
    '[]'::jsonb
  ) INTO v_users
  FROM public.crm_users u;

  -- 11. Activity Logs
  SELECT COALESCE(jsonb_agg(to_jsonb(act)), '[]'::jsonb) INTO v_activities
  FROM public.activities act;

  RETURN jsonb_build_object(
    'schema_version', '2026.1',
    'app_name', 'Brandium CRM',
    'generated_at', now(),
    'counts', jsonb_build_object(
      'prospects', jsonb_array_length(v_prospects),
      'stage_history', jsonb_array_length(v_stage_history),
      'followups', jsonb_array_length(v_followups),
      'opportunities', jsonb_array_length(v_opportunities),
      'meetings', jsonb_array_length(v_meetings),
      'invoices', jsonb_array_length(v_invoices),
      'payments', jsonb_array_length(v_payments),
      'services', jsonb_array_length(v_services),
      'sms_logs', jsonb_array_length(v_sms_logs),
      'users', jsonb_array_length(v_users),
      'activities', jsonb_array_length(v_activities)
    ),
    'data', jsonb_build_object(
      'prospects', v_prospects,
      'stage_history', v_stage_history,
      'followups', v_followups,
      'opportunities', v_opportunities,
      'meetings', v_meetings,
      'invoices', v_invoices,
      'payments', v_payments,
      'services', v_services,
      'sms_logs', v_sms_logs,
      'users', v_users,
      'activities', v_activities
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_full_crm_backup_payload TO authenticated;
