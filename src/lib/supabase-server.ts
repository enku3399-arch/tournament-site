import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!.trim().replace(/^﻿/, '')
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim().replace(/^﻿/, '')
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!.trim().replace(/^﻿/, '')

// Public read-only client (anon key + RLS)
export function createClient() {
  return supabaseCreateClient(url(), anonKey())
}

// Service role client — bypasses RLS, server-side API routes only
export function createServiceClient() {
  return supabaseCreateClient(url(), serviceKey())
}
