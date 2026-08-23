-- Supabase PostgreSQL Migration for Module 18: Server-Side Reports SQL Metrics & Aggregation
-- Purpose: Pre-aggregated server-side SQL queries for Reports KPIs & Charts without pulling full datasets to client
-- Rule: All metrics must come from filtered SQL queries.

CREATE OR REPLACE FUNCTION public.get_reports_summary_metrics(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_agent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_prospects INT;
  v_sales_won_count INT;
  v_followup_count INT;
  v_total_sales_value NUMERIC(12, 2);
  v_paid_sales_value NUMERIC(12, 2);
  v_total_billed NUMERIC(12, 2);
  v_total_outstanding NUMERIC(12, 2);
  v_total_paid NUMERIC(12, 2);
  v_active_clients_count INT;
  v_stage_distribution JSONB;
  v_stage_counts JSONB;
BEGIN
  -- 1. Total Prospects Count (Filtered by agent & dates)
  SELECT COUNT(DISTINCT p.id) INTO v_total_prospects
  FROM public.prospects p
  WHERE (p_agent_id IS NULL OR p.assigned_to = p_agent_id)
    AND (p_from_date IS NULL OR p.created_at::date >= p_from_date)
    AND (p_to_date IS NULL OR p.created_at::date <= p_to_date);

  -- 2. Sales Won Count & 4. Total Sales Value
  SELECT COUNT(DISTINCT o.id), COALESCE(SUM(o.estimated_value), 0.00)
  INTO v_sales_won_count, v_total_sales_value
  FROM public.opportunities o
  JOIN public.prospects p ON p.id = o.prospect_id
  WHERE o.status = 'Sales Won'
    AND (p_agent_id IS NULL OR p.assigned_to = p_agent_id OR o.assigned_to = p_agent_id)
    AND (p_from_date IS NULL OR o.created_at::date >= p_from_date)
    AND (p_to_date IS NULL OR o.created_at::date <= p_to_date);

  -- 3. Follow-up Count
  SELECT COUNT(DISTINCT o.id) INTO v_followup_count
  FROM public.opportunities o
  JOIN public.prospects p ON p.id = o.prospect_id
  WHERE o.status IN ('Follow-up', 'Proposal Sent', 'Negotiation')
    AND (p_agent_id IS NULL OR p.assigned_to = p_agent_id OR o.assigned_to = p_agent_id)
    AND (p_from_date IS NULL OR o.created_at::date >= p_from_date)
    AND (p_to_date IS NULL OR o.created_at::date <= p_to_date);

  -- 5. Paid Sales Value & 6. Total Billed & 7. Total Outstanding & 8. Total Paid & 9. Active Clients Count
  SELECT 
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0.00 END), 0.00),
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.total_amount ELSE 0.00 END), 0.00),
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.due_amount ELSE 0.00 END), 0.00),
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0.00 END), 0.00),
    COUNT(DISTINCT CASE WHEN i.status != 'Cancelled' AND (i.total_amount > 0 OR i.paid_amount > 0) THEN i.prospect_id END)
  INTO v_paid_sales_value, v_total_billed, v_total_outstanding, v_total_paid, v_active_clients_count
  FROM public.invoices i
  JOIN public.prospects p ON p.id = i.prospect_id
  WHERE (p_agent_id IS NULL OR p.assigned_to = p_agent_id OR i.created_by = p_agent_id)
    AND (p_from_date IS NULL OR i.bill_date >= p_from_date)
    AND (p_to_date IS NULL OR i.bill_date <= p_to_date);

  -- Chart 1 & Chart 2: Prospect Stage Distribution & Counts SQL Aggregation
  SELECT jsonb_agg(
    jsonb_build_object(
      'stage', stage_name,
      'count', stage_cnt,
      'percentage', ROUND((stage_cnt::numeric / GREATEST(1, v_total_prospects)::numeric) * 100, 1)
    )
  ) INTO v_stage_distribution
  FROM (
    SELECT 
      COALESCE(s.name, o.status, 'New Prospects') AS stage_name,
      COUNT(DISTINCT p.id) AS stage_cnt
    FROM public.prospects p
    LEFT JOIN public.stages s ON s.id = p.stage_id
    LEFT JOIN public.opportunities o ON o.prospect_id = p.id
    WHERE (p_agent_id IS NULL OR p.assigned_to = p_agent_id)
      AND (p_from_date IS NULL OR p.created_at::date >= p_from_date)
      AND (p_to_date IS NULL OR p.created_at::date <= p_to_date)
    GROUP BY COALESCE(s.name, o.status, 'New Prospects')
    ORDER BY stage_cnt DESC
  ) t;

  v_stage_counts := COALESCE(v_stage_distribution, '[]'::jsonb);

  RETURN jsonb_build_object(
    'kpis', jsonb_build_object(
      'total_prospects', COALESCE(v_total_prospects, 0),
      'sales_won', COALESCE(v_sales_won_count, 0),
      'followup', COALESCE(v_followup_count, 0),
      'total_sales', COALESCE(v_total_sales_value, 0.00),
      'paid_sales', COALESCE(v_paid_sales_value, 0.00),
      'total_billed', COALESCE(v_total_billed, 0.00),
      'total_outstanding', COALESCE(v_total_outstanding, 0.00),
      'total_paid', COALESCE(v_total_paid, 0.00),
      'active_clients', COALESCE(v_active_clients_count, 0)
    ),
    'stage_distribution', v_stage_counts,
    'stage_counts', v_stage_counts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_reports_summary_metrics TO authenticated;
