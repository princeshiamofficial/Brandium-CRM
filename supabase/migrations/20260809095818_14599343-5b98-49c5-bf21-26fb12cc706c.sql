ALTER TABLE public.prospects
  ADD COLUMN designation text,
  ADD COLUMN alternative_phone text,
  ADD COLUMN address text,
  ADD COLUMN created_by uuid REFERENCES auth.users(id);

COMMENT ON COLUMN public.prospects.created_by IS 'The user who originally added this prospect.';

-- Update RLS to ensure created_by is handled
DROP POLICY IF EXISTS "Agents create own prospects" ON public.prospects;
CREATE POLICY "Agents create own prospects" ON public.prospects FOR INSERT TO authenticated WITH CHECK (
  (assigned_to = auth.uid() OR created_by = auth.uid())
);

-- Add extra seed data to test filters and pagination
INSERT INTO public.prospects (contact_name, business_name, phone, email, designation, service_id, stage_id, assigned_to, created_by, notes)
SELECT 
  'Prospect ' || i, 
  'Business ' || i, 
  '+88017' || LPAD(i::text, 8, '0'), 
  'prospect' || i || '@example.com',
  'Manager',
  (SELECT id FROM public.services ORDER BY random() LIMIT 1),
  (SELECT id FROM public.stages ORDER BY random() LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'agent@arbit.test' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'admin@arbit.test' LIMIT 1),
  'Generated for testing'
FROM generate_series(20, 50) s(i);
