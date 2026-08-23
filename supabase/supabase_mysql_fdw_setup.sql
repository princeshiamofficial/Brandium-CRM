-- =====================================================================
-- Supabase MySQL Integration via Foreign Data Wrapper (mysql_fdw)
-- Execute this SQL inside your Supabase Project SQL Editor
-- =====================================================================

-- Step 1: Enable the Supabase Foreign Data Wrappers Extension
CREATE EXTENSION IF NOT EXISTS wrappers;
CREATE EXTENSION IF NOT EXISTS mysql_fdw;

-- Step 2: Create a Foreign Server connecting Supabase Postgres to your MySQL instance
-- Replace 'your_mysql_host', '3306', 'brandium_crm' with your MySQL credentials
CREATE SERVER IF NOT EXISTS mysql_server
  FOREIGN DATA WRAPPER mysql_fdw
  OPTIONS (
    host 'your_mysql_host',
    port '3306',
    dbname 'brandium_crm'
  );

-- Step 3: Map Supabase Postgres User to MySQL DB User
-- Replace 'mysql_username' and 'mysql_password' with your actual MySQL credentials
CREATE USER MAPPING IF NOT EXISTS FOR postgres
  SERVER mysql_server
  OPTIONS (
    username 'mysql_username',
    password 'mysql_password'
  );

-- Step 4: Import Foreign Schema or Create Foreign Tables for Supabase PostgREST
-- Example for importing all foreign tables from MySQL 'brandium_crm' into Supabase public schema:
-- IMPORT FOREIGN SCHEMA brandium_crm FROM SERVER mysql_server INTO public;

-- Step 5: (Alternative) Explicit Foreign Table definitions for exact Supabase JS Client compatibility
CREATE FOREIGN TABLE IF NOT EXISTS public.mysql_prospects (
  id text NOT NULL,
  contact_name text NOT NULL,
  business_name text,
  designation text,
  phone text,
  alternative_phone text,
  email text,
  address text,
  service_id text,
  stage_id text,
  assigned_to text,
  created_by text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
)
SERVER mysql_server
OPTIONS (
  dbname 'brandium_crm',
  table_name 'prospects'
);

-- Note: All queries via supabase.from('prospects') will interact with MySQL through Postgres FDW seamlessly.
