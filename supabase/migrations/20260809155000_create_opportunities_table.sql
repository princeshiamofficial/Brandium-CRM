-- Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  estimated_value numeric(12, 2) NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Opportunity Created',
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_prospect_id ON public.opportunities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON public.opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_active ON public.opportunities(is_active);

-- Enable RLS & Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view opportunities"
  ON public.opportunities FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Authenticated users can create opportunities"
  ON public.opportunities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON public.opportunities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Single Atomic Transaction for Marking Opportunity as Sales Won:
-- 1. Updates opportunity status to 'Sales Won'
-- 2. Updates prospect stage to 'Won' or 'Sales Won'
-- 3. Creates stage history entry in prospect_stage_history (if table exists)
-- 4. Creates activity log entry in activities
CREATE OR REPLACE FUNCTION public.mark_opportunity_sales_won(
  p_opportunity_id uuid,
  p_actor_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prospect_id uuid;
  v_val numeric(12, 2);
  v_prospect_name text;
  v_won_stage_id uuid;
  v_old_stage_id uuid;
  v_actor uuid;
BEGIN
  v_actor := coalesce(p_actor_id, auth.uid());

  -- 1. Lock & update opportunity
  SELECT prospect_id, estimated_value INTO v_prospect_id, v_val
  FROM public.opportunities
  WHERE id = p_opportunity_id AND is_active = true
  FOR UPDATE;

  IF v_prospect_id IS NULL THEN
    RAISE EXCEPTION 'Opportunity not found or inactive';
  END IF;

  UPDATE public.opportunities
  SET status = 'Sales Won',
      notes = coalesce(nullif(btrim(coalesce(p_notes, '')), ''), notes),
      updated_at = now()
  WHERE id = p_opportunity_id;

  -- Get prospect info & current stage
  SELECT coalesce(business_name, contact_name), stage_id
  INTO v_prospect_name, v_old_stage_id
  FROM public.prospects
  WHERE id = v_prospect_id;

  -- Find 'Won' or 'Sales Won' stage ID
  SELECT id INTO v_won_stage_id
  FROM public.stages
  WHERE lower(name) IN ('won', 'sales won') OR stage_group = 'won'
  ORDER BY sort_order ASC
  LIMIT 1;

  -- 2. Update prospect stage if stage found
  IF v_won_stage_id IS NOT NULL THEN
    UPDATE public.prospects
    SET stage_id = v_won_stage_id,
        updated_at = now()
    WHERE id = v_prospect_id;

    -- 3. Create stage history record
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospect_stage_history') THEN
      INSERT INTO public.prospect_stage_history (prospect_id, old_stage_id, new_stage_id, changed_by, notes)
      VALUES (v_prospect_id, v_old_stage_id, v_won_stage_id, v_actor, 'Opportunity marked as Sales Won (Valued at ৳' || v_val || ')');
    END IF;
  END IF;

  -- 4. Create activity log record
  INSERT INTO public.activities (actor_id, prospect_id, activity_type, message)
  VALUES (
    v_actor,
    v_prospect_id,
    'opportunity_won',
    'Opportunity marked as Sales Won for ' || coalesce(v_prospect_name, 'Prospect') || ' (Value: ৳' || coalesce(v_val, 0) || ')' ||
      coalesce(' — ' || nullif(btrim(coalesce(p_notes, '')), ''), '')
  );

  RETURN jsonb_build_object(
    'success', true,
    'opportunity_id', p_opportunity_id,
    'prospect_id', v_prospect_id,
    'status', 'Sales Won',
    'value', v_val
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_opportunity_sales_won(uuid, uuid, text) TO authenticated;

-- Seed initial test opportunities if empty
INSERT INTO public.opportunities (prospect_id, estimated_value, assigned_to, status, notes)
SELECT 
  p.id,
  (random() * 50000 + 15000)::numeric(12, 2),
  p.assigned_to,
  CASE (i % 5)
    WHEN 0 THEN 'Opportunity Created'
    WHEN 1 THEN 'Follow-up'
    WHEN 2 THEN 'Proposal Sent'
    WHEN 3 THEN 'Negotiation'
    ELSE 'Sales Won'
  END,
  'Initial sales opportunity identified during discovery call.'
FROM (
  SELECT id, assigned_to, row_number() over () as i
  FROM public.prospects
  LIMIT 10
) p
ON CONFLICT DO NOTHING;
