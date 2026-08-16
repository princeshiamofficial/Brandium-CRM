ALTER TABLE public.follow_ups ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS follow_ups_due_at_idx ON public.follow_ups (due_at DESC);
CREATE INDEX IF NOT EXISTS follow_ups_status_idx ON public.follow_ups (status);

CREATE OR REPLACE FUNCTION public.set_follow_up_status(p_follow_up_id uuid, p_status text, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_prospect uuid;
  v_label text;
  v_old text;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_status NOT IN ('pending','completed','cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  SELECT f.prospect_id, f.status INTO v_prospect, v_old
  FROM public.follow_ups f
  WHERE f.id = p_follow_up_id
  FOR UPDATE;

  IF v_prospect IS NULL AND v_old IS NULL THEN
    RAISE EXCEPTION 'Follow-up not found or not permitted';
  END IF;

  UPDATE public.follow_ups
     SET status = p_status,
         note = coalesce(nullif(btrim(coalesce(p_note,'')), ''), note)
   WHERE id = p_follow_up_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not permitted to update this follow-up';
  END IF;

  SELECT coalesce(pr.business_name, pr.contact_name) INTO v_label
  FROM public.prospects pr WHERE pr.id = v_prospect;

  INSERT INTO public.activities (actor_id, prospect_id, activity_type, message)
  VALUES (
    v_actor,
    v_prospect,
    'follow_up_' || p_status,
    'Follow-up marked ' || p_status || coalesce(' for ' || v_label, '') ||
      coalesce(' — ' || nullif(btrim(coalesce(p_note,'')), ''), '')
  );

  RETURN jsonb_build_object('id', p_follow_up_id, 'status', p_status, 'previous_status', v_old);
END;
$$;

REVOKE ALL ON FUNCTION public.set_follow_up_status(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.set_follow_up_status(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.follow_up_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM public.follow_ups),
    'pending', (SELECT count(*) FROM public.follow_ups WHERE status = 'pending'),
    'completed', (SELECT count(*) FROM public.follow_ups WHERE status = 'completed'),
    'cancelled', (SELECT count(*) FROM public.follow_ups WHERE status = 'cancelled'),
    'overdue', (SELECT count(*) FROM public.follow_ups WHERE status = 'pending' AND due_at < now())
  );
$$;

REVOKE ALL ON FUNCTION public.follow_up_summary() FROM public;
GRANT EXECUTE ON FUNCTION public.follow_up_summary() TO authenticated;