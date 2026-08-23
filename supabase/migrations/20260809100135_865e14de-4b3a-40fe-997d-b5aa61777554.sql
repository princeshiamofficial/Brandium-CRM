-- 1) Canonical stage set (names are UNIQUE, so duplicates are impossible)
UPDATE public.stages SET name = 'Prospect', stage_group = 'new', sort_order = 1, is_follow_up = false WHERE name = 'New Lead';
UPDATE public.stages SET name = 'Follow-up', stage_group = 'in_progress', sort_order = 2, is_follow_up = true WHERE name = 'Contacted';
UPDATE public.stages SET name = 'Sales Won', stage_group = 'won', sort_order = 11, is_follow_up = false WHERE name = 'Won';

UPDATE public.stages SET stage_group = 'lost', sort_order = 6, is_follow_up = false WHERE name = 'Not Interested';
UPDATE public.stages SET stage_group = 'in_progress', sort_order = 7, is_follow_up = true WHERE name = 'Qualified';
UPDATE public.stages SET stage_group = 'in_progress', sort_order = 9, is_follow_up = true WHERE name = 'Proposal Sent';
UPDATE public.stages SET stage_group = 'in_progress', sort_order = 10, is_follow_up = true WHERE name = 'Negotiation';
UPDATE public.stages SET stage_group = 'lost', sort_order = 13, is_follow_up = false WHERE name = 'Denied Payment';

INSERT INTO public.stages (name, stage_group, sort_order, is_follow_up) VALUES
  ('DNP', 'in_progress', 3, true),
  ('Switched Off', 'in_progress', 4, true),
  ('Invalid Number', 'lost', 5, false),
  ('Opportunity Created', 'in_progress', 8, true),
  ('Sales Lost', 'lost', 12, false)
ON CONFLICT (name) DO NOTHING;

-- 2) Immutable stage history
CREATE TABLE public.prospect_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  to_stage_id uuid NOT NULL REFERENCES public.stages(id) ON DELETE RESTRICT,
  note text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prospect_stage_history_prospect_idx ON public.prospect_stage_history(prospect_id, changed_at DESC);
CREATE INDEX prospect_stage_history_changed_by_idx ON public.prospect_stage_history(changed_by);

-- append-only: no UPDATE/DELETE privileges for app roles
GRANT SELECT, INSERT ON public.prospect_stage_history TO authenticated;
GRANT ALL ON public.prospect_stage_history TO service_role;
ALTER TABLE public.prospect_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all stage history" ON public.prospect_stage_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view history of assigned prospects" ON public.prospect_stage_history
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.prospects pr WHERE pr.id = prospect_id AND pr.assigned_to = auth.uid())
  );
CREATE POLICY "Users insert own stage history" ON public.prospect_stage_history
  FOR INSERT TO authenticated WITH CHECK (changed_by = auth.uid());

-- block edits/deletes even if privileges are widened later
CREATE OR REPLACE FUNCTION public.prevent_stage_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'prospect_stage_history is append-only';
END;
$$;
CREATE TRIGGER prospect_stage_history_no_update BEFORE UPDATE ON public.prospect_stage_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_stage_history_mutation();
CREATE TRIGGER prospect_stage_history_no_delete BEFORE DELETE ON public.prospect_stage_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_stage_history_mutation();

-- 3) Reusable, transactional stage change (SECURITY INVOKER: RLS validates permission)
CREATE OR REPLACE FUNCTION public.change_prospect_stage(
  p_prospect_id uuid,
  p_stage_id uuid,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_current uuid;
  v_label text;
  v_stage_name text;
  v_history_id uuid;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT name INTO v_stage_name FROM public.stages WHERE id = p_stage_id AND is_active;
  IF v_stage_name IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive stage';
  END IF;

  -- read current stage; RLS makes this invisible when the caller lacks access
  SELECT pr.stage_id, coalesce(pr.business_name, pr.contact_name)
    INTO v_current, v_label
  FROM public.prospects pr
  WHERE pr.id = p_prospect_id
  FOR UPDATE;

  IF v_label IS NULL THEN
    RAISE EXCEPTION 'Prospect not found or not permitted';
  END IF;

  IF v_current IS NOT DISTINCT FROM p_stage_id THEN
    RETURN jsonb_build_object('changed', false, 'stage_id', p_stage_id, 'stage_name', v_stage_name);
  END IF;

  -- append immutable history first
  INSERT INTO public.prospect_stage_history (prospect_id, from_stage_id, to_stage_id, note, changed_by)
  VALUES (p_prospect_id, v_current, p_stage_id, nullif(btrim(coalesce(p_note, '')), ''), v_actor)
  RETURNING id INTO v_history_id;

  UPDATE public.prospects
     SET stage_id = p_stage_id,
         is_active = (SELECT stage_group IN ('new','in_progress') FROM public.stages WHERE id = p_stage_id)
   WHERE id = p_prospect_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not permitted to update this prospect';
  END IF;

  INSERT INTO public.activities (actor_id, prospect_id, activity_type, message)
  VALUES (
    v_actor,
    p_prospect_id,
    'stage_change',
    'Moved ' || v_label || ' to ' || v_stage_name ||
      coalesce(' — ' || nullif(btrim(coalesce(p_note, '')), ''), '')
  );

  RETURN jsonb_build_object(
    'changed', true,
    'history_id', v_history_id,
    'from_stage_id', v_current,
    'stage_id', p_stage_id,
    'stage_name', v_stage_name
  );
END;
$$;
REVOKE ALL ON FUNCTION public.change_prospect_stage(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.change_prospect_stage(uuid, uuid, text) TO authenticated;
