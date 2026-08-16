-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- STAGES
CREATE TABLE public.stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  stage_group text NOT NULL DEFAULT 'in_progress' CHECK (stage_group IN ('new','in_progress','won','lost')),
  sort_order integer NOT NULL DEFAULT 0,
  is_follow_up boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stages TO authenticated;
GRANT ALL ON public.stages TO service_role;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view stages" ON public.stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage stages" ON public.stages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROSPECTS
CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  business_name text,
  phone text,
  email text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prospects_assigned_to_idx ON public.prospects(assigned_to);
CREATE INDEX prospects_stage_idx ON public.prospects(stage_id);
CREATE INDEX prospects_created_at_idx ON public.prospects(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all prospects" ON public.prospects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view assigned prospects" ON public.prospects FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Agents update assigned prospects" ON public.prospects FOR UPDATE TO authenticated USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());
CREATE POLICY "Agents create own prospects" ON public.prospects FOR INSERT TO authenticated WITH CHECK (assigned_to = auth.uid());

-- FOLLOW UPS
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX follow_ups_assigned_to_idx ON public.follow_ups(assigned_to);
CREATE INDEX follow_ups_status_idx ON public.follow_ups(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all follow ups" ON public.follow_ups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view own follow ups" ON public.follow_ups FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Agents update own follow ups" ON public.follow_ups FOR UPDATE TO authenticated USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());
CREATE POLICY "Agents create own follow ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (assigned_to = auth.uid());

-- SALES
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'won' CHECK (status IN ('won','denied')),
  closed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sales_agent_idx ON public.sales(agent_id);
CREATE INDEX sales_status_idx ON public.sales(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all sales" ON public.sales FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view own sales" ON public.sales FOR SELECT TO authenticated USING (agent_id = auth.uid());
CREATE POLICY "Agents create own sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (agent_id = auth.uid());
CREATE POLICY "Agents update own sales" ON public.sales FOR UPDATE TO authenticated USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

-- ACTIVITIES
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
  activity_type text NOT NULL DEFAULT 'note',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activities_created_at_idx ON public.activities(created_at DESC);
GRANT SELECT, INSERT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all activities" ON public.activities FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view own activities" ON public.activities FOR SELECT TO authenticated USING (actor_id = auth.uid());
CREATE POLICY "Users log own activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- updated_at triggers
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER stages_updated_at BEFORE UPDATE ON public.stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER follow_ups_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DASHBOARD AGGREGATES (calculated in SQL, scoped by role)
CREATE OR REPLACE FUNCTION public.dashboard_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT auth.uid() AS uid, public.has_role(auth.uid(), 'admin') AS is_admin
  ),
  p AS (
    SELECT pr.*, st.stage_group, st.is_follow_up
    FROM public.prospects pr
    LEFT JOIN public.stages st ON st.id = pr.stage_id
    CROSS JOIN me
    WHERE me.uid IS NOT NULL AND (me.is_admin OR pr.assigned_to = me.uid)
  ),
  f AS (
    SELECT fu.* FROM public.follow_ups fu CROSS JOIN me
    WHERE me.uid IS NOT NULL AND (me.is_admin OR fu.assigned_to = me.uid)
  ),
  s AS (
    SELECT sl.* FROM public.sales sl CROSS JOIN me
    WHERE me.uid IS NOT NULL AND (me.is_admin OR sl.agent_id = me.uid)
  )
  SELECT jsonb_build_object(
    'total_prospects', (SELECT count(*) FROM p),
    'active_prospects', (SELECT count(*) FROM p WHERE is_active AND coalesce(stage_group,'in_progress') IN ('new','in_progress')),
    'won_sales', (SELECT count(*) FROM s WHERE status = 'won'),
    'pending_tasks', (SELECT count(*) FROM f WHERE status = 'pending'),
    'follow_up_stage', (SELECT count(*) FROM p WHERE coalesce(is_follow_up, false)),
    'total_sales', (SELECT coalesce(sum(amount), 0) FROM s WHERE status = 'won'),
    'paid_sales', (SELECT coalesce(sum(paid_amount), 0) FROM s WHERE status = 'won'),
    'outstanding_amount', (SELECT coalesce(sum(amount - paid_amount), 0) FROM s WHERE status = 'won')
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
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT auth.uid() AS uid, public.has_role(auth.uid(), 'admin') AS is_admin
  ),
  ranked AS (
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
    CROSS JOIN me
    WHERE me.uid IS NOT NULL AND (me.is_admin OR pr.assigned_to = me.uid)
  )
  SELECT id, contact_name, business_name, service_name, stage_name, stage_group, created_at
  FROM ranked
  WHERE rn <= greatest(1, least(per_group, 10))
  ORDER BY stage_group, created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.dashboard_recent_prospects(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_recent_prospects(integer) TO authenticated;

-- SEED DATA
INSERT INTO public.services (name, description) VALUES
  ('Google Business Profile', 'Listing setup and optimisation'),
  ('Website Development', 'Business website build'),
  ('SEO Retainer', 'Monthly search optimisation'),
  ('Social Media Management', 'Content and paid social');

INSERT INTO public.stages (name, stage_group, sort_order, is_follow_up) VALUES
  ('New Lead', 'new', 1, false),
  ('Contacted', 'in_progress', 2, true),
  ('Qualified', 'in_progress', 3, true),
  ('Proposal Sent', 'in_progress', 4, true),
  ('Negotiation', 'in_progress', 5, true),
  ('Won', 'won', 6, false),
  ('Denied Payment', 'lost', 7, false),
  ('Not Interested', 'lost', 8, false);

INSERT INTO public.prospects (contact_name, business_name, phone, email, service_id, stage_id, assigned_to, is_active, created_at)
SELECT d.contact_name, d.business_name, d.phone, d.email,
       (SELECT id FROM public.services WHERE name = d.service),
       (SELECT id FROM public.stages WHERE name = d.stage),
       (SELECT id FROM auth.users WHERE email = d.owner),
       d.is_active,
       now() - (d.age || ' hours')::interval
FROM (VALUES
  ('Rahim Uddin', 'Rahim Electronics', '+8801711000001', 'rahim@example.com', 'Google Business Profile', 'New Lead', 'agent@arbit.test', true, 2),
  ('Nusrat Jahan', 'Jahan Fabrics', '+8801711000002', 'nusrat@example.com', 'Website Development', 'Contacted', 'agent@arbit.test', true, 6),
  ('Tanvir Hasan', 'Hasan Motors', '+8801711000003', 'tanvir@example.com', 'SEO Retainer', 'Qualified', 'agent@arbit.test', true, 20),
  ('Farhana Akter', 'Akter Beauty Lounge', '+8801711000004', 'farhana@example.com', 'Social Media Management', 'Proposal Sent', 'agent@arbit.test', true, 30),
  ('Imran Kabir', 'Kabir Traders', '+8801711000005', 'imran@example.com', 'Website Development', 'Negotiation', 'agent@arbit.test', true, 48),
  ('Shamim Reza', 'Reza Foods', '+8801711000006', 'shamim@example.com', 'Google Business Profile', 'Won', 'agent@arbit.test', false, 72),
  ('Mahi Chowdhury', 'Chowdhury Interiors', '+8801711000007', 'mahi@example.com', 'SEO Retainer', 'Denied Payment', 'agent@arbit.test', false, 96),
  ('Sabbir Ahmed', 'Ahmed Pharma', '+8801711000008', 'sabbir@example.com', 'Website Development', 'New Lead', 'admin@arbit.test', true, 4),
  ('Rumana Islam', 'Islam Tailors', '+8801711000009', 'rumana@example.com', 'Social Media Management', 'Contacted', 'admin@arbit.test', true, 10),
  ('Jubayer Alam', 'Alam Hardware', '+8801711000010', 'jubayer@example.com', 'SEO Retainer', 'Won', 'admin@arbit.test', false, 120),
  ('Priya Das', 'Das Boutique', '+8801711000011', 'priya@example.com', 'Google Business Profile', 'Not Interested', 'admin@arbit.test', false, 140),
  ('Kamal Hossain', 'Hossain Logistics', '+8801711000012', 'kamal@example.com', 'Website Development', 'Proposal Sent', 'admin@arbit.test', true, 18)
) AS d(contact_name, business_name, phone, email, service, stage, owner, is_active, age);

INSERT INTO public.follow_ups (prospect_id, assigned_to, due_at, status, note)
SELECT pr.id, pr.assigned_to, now() + interval '1 day', 'pending', 'Call back to confirm interest'
FROM public.prospects pr
JOIN public.stages st ON st.id = pr.stage_id
WHERE st.is_follow_up;

INSERT INTO public.follow_ups (prospect_id, assigned_to, due_at, status, note)
SELECT pr.id, pr.assigned_to, now() - interval '2 days', 'completed', 'Initial discovery call done'
FROM public.prospects pr
JOIN public.stages st ON st.id = pr.stage_id
WHERE st.stage_group = 'won';

INSERT INTO public.sales (prospect_id, service_id, agent_id, amount, paid_amount, status, closed_at)
SELECT pr.id, pr.service_id, pr.assigned_to,
       v.amount, v.paid, v.status, now() - (v.age || ' days')::interval
FROM public.prospects pr
JOIN (VALUES
  ('Reza Foods', 45000.00, 45000.00, 'won', 3),
  ('Alam Hardware', 62000.00, 30000.00, 'won', 5),
  ('Chowdhury Interiors', 38000.00, 0.00, 'denied', 4)
) AS v(business, amount, paid, status, age) ON v.business = pr.business_name;

INSERT INTO public.activities (actor_id, prospect_id, activity_type, message, created_at)
SELECT pr.assigned_to, pr.id, 'stage_change',
       'Moved ' || coalesce(pr.business_name, pr.contact_name) || ' to ' || st.name,
       pr.created_at + interval '1 hour'
FROM public.prospects pr
JOIN public.stages st ON st.id = pr.stage_id;