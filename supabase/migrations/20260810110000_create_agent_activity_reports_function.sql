-- Supabase PostgreSQL Migration for Module 21: Agent Activity Reports SQL Pre-Aggregation
-- Purpose: Pre-aggregated SQL procedure for agent activity reports, overall metrics, and agent-level detailed performance
-- Rule: Do not rank performance solely by stage changes; rank by holistic won value & conversion rate.

CREATE OR REPLACE FUNCTION public.get_agent_activity_reports(
  p_period TEXT DEFAULT 'overview'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_date TIMESTAMPTZ;
  v_overall_won_value NUMERIC(12, 2);
  v_overall_pipeline_value NUMERIC(12, 2);
  v_overall_lost_value NUMERIC(12, 2);
  v_agents_report JSONB;
BEGIN
  -- Determine date range filter based on period
  IF p_period = 'weekly' THEN
    v_from_date := now() - INTERVAL '7 days';
  ELSIF p_period = 'monthly' THEN
    v_from_date := now() - INTERVAL '30 days';
  ELSE
    v_from_date := NULL;
  END IF;

  -- 1. Overall Financial Summary Metrics
  SELECT COALESCE(SUM(estimated_value), 0.00) INTO v_overall_won_value
  FROM public.opportunities
  WHERE status = 'Sales Won'
    AND (v_from_date IS NULL OR created_at >= v_from_date);

  SELECT COALESCE(SUM(estimated_value), 0.00) INTO v_overall_pipeline_value
  FROM public.opportunities
  WHERE status IN ('Follow-up', 'Proposal Sent', 'Negotiation', 'Opportunity Created')
    AND (v_from_date IS NULL OR created_at >= v_from_date);

  SELECT COALESCE(SUM(estimated_value), 0.00) INTO v_overall_lost_value
  FROM public.opportunities
  WHERE status IN ('Lost', 'Denied Payment', 'Cancelled')
    AND (v_from_date IS NULL OR created_at >= v_from_date);

  -- 2. Agent-wise Pre-Aggregated Report
  SELECT jsonb_agg(
    jsonb_build_object(
      'agent_id', u.id,
      'name', u.name,
      'email', u.email,
      'status', u.status,
      'prospects_count', COALESCE(p_cnt.cnt, 0),
      'stage_changes', COALESCE(stg_cnt.cnt, 0),
      'status_changes', COALESCE(stat_cnt.cnt, 0),
      'followups_completed', COALESCE(fup_comp.cnt, 0),
      'overdue_followups', COALESCE(fup_over.cnt, 0),
      'opportunities_created', COALESCE(opp_cnt.cnt, 0),
      'sales_won', COALESCE(won_cnt.cnt, 0),
      'won_value', COALESCE(won_cnt.val, 0.00),
      'conversion_rate', ROUND(
        (COALESCE(won_cnt.cnt, 0)::numeric / GREATEST(1, COALESCE(p_cnt.cnt, 0))::numeric) * 100, 1
      ),
      'last_activity', COALESCE(act_last.last_time, u.updated_at)
    )
  ) INTO v_agents_report
  FROM public.crm_users u
  -- Assigned prospects count
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.prospects p
    WHERE p.assigned_to = u.id AND (v_from_date IS NULL OR p.created_at >= v_from_date)
  ) p_cnt ON true
  -- Stage changes count
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.activities a
    WHERE a.actor_id = u.id AND a.activity_type = 'stage_changed'
      AND (v_from_date IS NULL OR a.created_at >= v_from_date)
  ) stg_cnt ON true
  -- Status changes count
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.activities a
    WHERE a.actor_id = u.id AND a.activity_type IN ('status_changed', 'payment_recorded')
      AND (v_from_date IS NULL OR a.created_at >= v_from_date)
  ) stat_cnt ON true
  -- Follow-ups completed
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.meetings m
    WHERE m.assigned_agent_id = u.id AND m.status = 'Completed'
      AND (v_from_date IS NULL OR m.created_at >= v_from_date)
  ) fup_comp ON true
  -- Overdue follow-ups
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.meetings m
    WHERE m.assigned_agent_id = u.id AND m.status = 'Scheduled' AND m.meeting_date < now()
      AND (v_from_date IS NULL OR m.created_at >= v_from_date)
  ) fup_over ON true
  -- Opportunities created & Sales won
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.opportunities o
    WHERE (o.assigned_to = u.id OR o.created_by = u.id)
      AND (v_from_date IS NULL OR o.created_at >= v_from_date)
  ) opp_cnt ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt, SUM(estimated_value) AS val FROM public.opportunities o
    WHERE (o.assigned_to = u.id OR o.created_by = u.id) AND o.status = 'Sales Won'
      AND (v_from_date IS NULL OR o.created_at >= v_from_date)
  ) won_cnt ON true
  -- Last activity timestamp
  LEFT JOIN LATERAL (
    SELECT MAX(created_at) AS last_time FROM public.activities a
    WHERE a.actor_id = u.id
  ) act_last ON true
  WHERE u.is_deleted = false;

  RETURN jsonb_build_object(
    'overall', jsonb_build_object(
      'won_value', COALESCE(v_overall_won_value, 0.00),
      'pipeline_value', COALESCE(v_overall_pipeline_value, 0.00),
      'lost_value', COALESCE(v_overall_lost_value, 0.00)
    ),
    'agents', COALESCE(v_agents_report, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_agent_activity_reports TO authenticated;
