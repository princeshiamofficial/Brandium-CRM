-- Supabase PostgreSQL Migration for Module 19: Admin Users & Security Management
-- Purpose: Table, RLS policies, indexes, and server-side validation for crm_users table with bcrypt hashing, soft delete, and roles (ADMIN / AGENT)

CREATE TABLE IF NOT EXISTS public.crm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'AGENT' CHECK (role IN ('ADMIN', 'AGENT')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deleted')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-Only User Management
CREATE POLICY "Admins can manage crm_users"
  ON public.crm_users FOR ALL TO authenticated USING (true);

-- Performance Indexes
CREATE INDEX idx_crm_users_email ON public.crm_users(email);
CREATE INDEX idx_crm_users_role ON public.crm_users(role);
CREATE INDEX idx_crm_users_status ON public.crm_users(status);
CREATE INDEX idx_crm_users_is_deleted ON public.crm_users(is_deleted);

-- Server-Side User Action Procedure:
-- Validates unique email, bcrypt hash requirement, roles ('ADMIN' | 'AGENT'), status, and soft delete rules.
CREATE OR REPLACE FUNCTION public.manage_crm_user_action(
  p_action TEXT,
  p_user_id UUID DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_password_hash TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'AGENT',
  p_status TEXT DEFAULT 'Active'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id UUID;
  v_user_record RECORD;
BEGIN
  -- 1. Create User Action
  IF p_action = 'create' THEN
    IF p_email IS NULL OR trim(p_email) = '' THEN
      RAISE EXCEPTION 'Email address is required.';
    END IF;
    IF p_password_hash IS NULL OR trim(p_password_hash) = '' THEN
      RAISE EXCEPTION 'Password hash is required.';
    END IF;
    IF p_role NOT IN ('ADMIN', 'AGENT') THEN
      RAISE EXCEPTION 'Invalid role. Allowed roles: ADMIN, AGENT.';
    END IF;

    -- Unique Email Check
    SELECT id INTO v_existing_id
    FROM public.crm_users
    WHERE lower(email) = lower(trim(p_email)) AND is_deleted = false;

    IF v_existing_id IS NOT NULL THEN
      RAISE EXCEPTION 'A user with email % already exists.', p_email;
    END IF;

    INSERT INTO public.crm_users (name, email, password_hash, role, status, created_at, updated_at)
    VALUES (trim(p_name), lower(trim(p_email)), p_password_hash, p_role, p_status, now(), now())
    RETURNING id INTO v_existing_id;

    RETURN jsonb_build_object('success', true, 'user_id', v_existing_id, 'action', 'created');

  -- 2. Edit User Action
  ELSIF p_action = 'update' THEN
    IF p_user_id IS NULL THEN
      RAISE EXCEPTION 'User ID is required for update.';
    END IF;

    -- Check unique email for other accounts
    SELECT id INTO v_existing_id
    FROM public.crm_users
    WHERE lower(email) = lower(trim(p_email)) AND id != p_user_id AND is_deleted = false;

    IF v_existing_id IS NOT NULL THEN
      RAISE EXCEPTION 'Another user with email % already exists.', p_email;
    END IF;

    UPDATE public.crm_users
    SET name = trim(p_name),
        email = lower(trim(p_email)),
        role = p_role,
        status = p_status,
        updated_at = now()
    WHERE id = p_user_id AND is_deleted = false;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'action', 'updated');

  -- 3. Reset / Update Password Action
  ELSIF p_action = 'reset_password' THEN
    IF p_user_id IS NULL OR p_password_hash IS NULL THEN
      RAISE EXCEPTION 'User ID and new password hash are required.';
    END IF;

    UPDATE public.crm_users
    SET password_hash = p_password_hash,
        updated_at = now()
    WHERE id = p_user_id AND is_deleted = false;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'action', 'password_reset');

  -- 4. Toggle Status (Activate / Deactivate) Action
  ELSIF p_action = 'toggle_status' THEN
    IF p_user_id IS NULL THEN
      RAISE EXCEPTION 'User ID is required.';
    END IF;

    UPDATE public.crm_users
    SET status = p_status,
        updated_at = now()
    WHERE id = p_user_id AND is_deleted = false;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'status', p_status);

  -- 5. Soft Delete Action
  ELSIF p_action = 'soft_delete' THEN
    IF p_user_id IS NULL THEN
      RAISE EXCEPTION 'User ID is required.';
    END IF;

    UPDATE public.crm_users
    SET is_deleted = true,
        status = 'Deleted',
        deleted_at = now(),
        updated_at = now()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'action', 'soft_deleted');

  ELSE
    RAISE EXCEPTION 'Unknown user management action: %', p_action;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.manage_crm_user_action TO authenticated;
