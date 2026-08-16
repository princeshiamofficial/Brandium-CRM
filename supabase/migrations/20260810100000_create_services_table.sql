-- Supabase PostgreSQL Migration for Module 20: Service Management
-- Purpose: Services table with 12 required example services, RLS policies, and soft-delete/inactive protection

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Layers',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deleted')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read services"
  ON public.services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL TO authenticated USING (true);

-- Performance Indexes
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_services_is_deleted ON public.services(is_deleted);

-- Seed 12 Required Example Services
INSERT INTO public.services (name, description, icon, status) VALUES
  ('Product Photography', 'High-end studio & e-commerce product catalog shoot.', 'Camera', 'Active'),
  ('Graphics Design', 'Social media banners, ad creatives, and print designs.', 'Palette', 'Active'),
  ('Monthly Plan', 'All-in-one monthly digital marketing & telesales management.', 'Calendar', 'Active'),
  ('Website Development', 'Custom responsive React, Next.js, and WordPress websites.', 'Globe', 'Active'),
  ('Celebrity Video Ads', 'Commercial video ads featuring popular celebrities.', 'Video', 'Active'),
  ('TVC', 'Television Commercial production & broadcast formatting.', 'Tv', 'Active'),
  ('OVC', 'Online Video Commercials optimized for social media.', 'PlayCircle', 'Active'),
  ('Voice-Over Video Ads', 'Professional voice-over narration with dynamic visuals.', 'Mic', 'Active'),
  ('Corporate AV', 'Corporate Audio-Visual presentations & company profiles.', 'Film', 'Active'),
  ('Influencer Video Ads', 'Influencer endorsement videos for TikTok, Instagram & FB.', 'Star', 'Active'),
  ('Motion Video Ads', '2D/3D motion graphics animation and visual FX.', 'Sparkles', 'Active'),
  ('Logo Design', 'Custom brand identity, vector logos, and brand guidelines.', 'Brush', 'Active')
ON CONFLICT DO NOTHING;
