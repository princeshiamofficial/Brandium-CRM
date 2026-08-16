-- Add management columns to stages
ALTER TABLE public.stages ADD COLUMN color text;
ALTER TABLE public.stages ADD COLUMN icon text;
ALTER TABLE public.stages ADD COLUMN is_system boolean DEFAULT false;

-- Normalize stage names for uniqueness
CREATE UNIQUE INDEX stages_name_unique_idx ON public.stages (lower(trim(name)));

-- Update existing stages with some default colors/icons
UPDATE public.stages SET color = '#10b981', icon = 'CheckCircle2' WHERE name = 'Sales Won';
UPDATE public.stages SET color = '#ef4444', icon = 'XCircle' WHERE name = 'Sales Lost';
UPDATE public.stages SET color = '#3b82f6', icon = 'History' WHERE name = 'Follow-up';
UPDATE public.stages SET color = '#f59e0b', icon = 'Timer' WHERE name = 'Opportunity Created';
UPDATE public.stages SET color = '#6366f1', icon = 'FileText' WHERE name = 'Proposal Sent';
UPDATE public.stages SET color = '#ec4899', icon = 'Users' WHERE name = 'Negotiation';
UPDATE public.stages SET color = '#94a3b8', icon = 'Circle' WHERE name = 'Prospect';

-- Protect critical stages
UPDATE public.stages SET is_system = true WHERE name IN ('Prospect', 'Follow-up', 'Sales Won', 'Sales Lost', 'Not Interested');

-- Function for stage management summary
CREATE OR REPLACE FUNCTION public.get_stage_management_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_prospects', (SELECT COUNT(*) FROM public.prospects),
    'active_stages', (SELECT COUNT(*) FROM public.stages WHERE is_active = true),
    'follow_up_prospects', (SELECT COUNT(*) FROM public.prospects p JOIN public.stages s ON p.current_stage_id = s.id WHERE s.is_follow_up = true),
    'top_stage', (
       SELECT s.name FROM public.stages s
       JOIN public.prospects p ON p.current_stage_id = s.id
       GROUP BY s.id, s.name
       ORDER BY COUNT(p.id) DESC
       LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_stage_management_summary() TO authenticated;

-- Function for stage management list with counts
CREATE OR REPLACE FUNCTION public.get_stages_with_counts()
RETURNS TABLE (
  id uuid,
  name text,
  stage_group text,
  sort_order integer,
  is_follow_up boolean,
  is_active boolean,
  color text,
  icon text,
  is_system boolean,
  prospect_count bigint,
  prospect_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count bigint;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.prospects;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.stage_group,
    s.sort_order,
    s.is_follow_up,
    s.is_active,
    s.color,
    s.icon,
    s.is_system,
    COUNT(p.id) as prospect_count,
    CASE 
      WHEN total_count = 0 THEN 0
      ELSE ROUND((COUNT(p.id)::numeric / total_count::numeric) * 100, 2)
    END as prospect_percentage
  FROM public.stages s
  LEFT JOIN public.prospects p ON p.current_stage_id = s.id
  GROUP BY s.id
  ORDER BY s.sort_order ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_stages_with_counts() TO authenticated;
