-- Create meetings table for MODULE 09 - MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  phone text,
  location text,
  meeting_type text NOT NULL DEFAULT 'Office' CHECK (meeting_type IN ('Office', 'Online', 'Client Location', 'Other')),
  meeting_date date NOT NULL DEFAULT CURRENT_DATE,
  meeting_time time NOT NULL DEFAULT '10:00:00',
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  status text NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  sms_sent boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_prospect_id ON public.meetings(prospect_id);
CREATE INDEX IF NOT EXISTS idx_meetings_assigned_user_id ON public.meetings(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON public.meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date ON public.meetings(meeting_date);

-- Security & RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view meetings"
  ON public.meetings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create meetings"
  ON public.meetings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update meetings"
  ON public.meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete meetings"
  ON public.meetings FOR DELETE TO authenticated USING (true);
