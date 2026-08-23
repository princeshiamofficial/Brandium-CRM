DROP FUNCTION IF EXISTS public.dashboard_metrics();
DROP FUNCTION IF EXISTS public.dashboard_recent_prospects(integer);

CREATE OR REPLACE FUNCTION public.dashboard_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_prospects', (SELECT count(*) FROM public.prospects),
    'active_prospects', (
      SELECT count(*) FROM public.prospects pr
      LEFT JOIN public.stages st ON st.id = pr.stage_id
      WHERE pr.is_active AND coalesce(st.stage_group, 'in_progress') IN ('new','in_progress')
    ),
    'won_sales', (SELECT count(*) FROM public.sales WHERE status = 'won'),
    'pending_tasks', (SELECT count(*) FROM public.follow_ups WHERE status = 'pending'),
    'follow_up_stage', (
      SELECT count(*) FROM public.prospects pr
      JOIN public.stages st ON st.id = pr.stage_id
      WHERE st.is_follow_up
    ),
    'total_sales', (SELECT coalesce(sum(amount), 0) FROM public.sales WHERE status = 'won'),
    'paid_sales', (SELECT coalesce(sum(paid_amount), 0) FROM public.sales WHERE status = 'won'),
    'outstanding_amount', (SELECT coalesce(sum(amount - paid_amount), 0) FROM public.sales WHERE status = 'won')
  );
$$;
REVOKE ALL ON FUNCTION public.dashboard_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_metrics() TO authenticated;

CREATE OR REPLACE FUNCTION public.dashboard_recent_prospects(per_group integer DEFAULT 4)
RETURNS TABLE (
  id uuid,
  contact_name text,
  business_name text,
  service_name text,
  stage_name text,
  stage_group text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      pr.id,
      pr.contact_name,
      pr.business_name,
      sv.name AS service_name,
      st.name AS stage_name,
      coalesce(st.stage_group, 'in_progress') AS stage_group,
      pr.created_at,
      row_number() OVER (
        PARTITION BY coalesce(st.stage_group, 'in_progress')
        ORDER BY pr.created_at DESC
      ) AS rn
    FROM public.prospects pr
    LEFT JOIN public.services sv ON sv.id = pr.service_id
    LEFT JOIN public.stages st ON st.id = pr.stage_id
  )
  SELECT id, contact_name, business_name, service_name, stage_name, stage_group, created_at
  FROM ranked
  WHERE rn <= greatest(1, least(per_group, 10))
  ORDER BY stage_group, created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.dashboard_recent_prospects(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_recent_prospects(integer) TO authenticated;