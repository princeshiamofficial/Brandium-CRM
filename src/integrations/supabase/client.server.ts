/**
 * Server-Side Standalone Database Client (Decoupled from Supabase Cloud)
 * Bypasses Supabase completely and uses direct database / fluent proxy.
 */

import { supabase } from "./client";

export const supabaseAdmin = supabase;
