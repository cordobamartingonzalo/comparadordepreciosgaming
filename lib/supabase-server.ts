import "server-only"
import { createClient } from "@supabase/supabase-js"

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Missing server-side Supabase env vars: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    )
  }

  return createClient(url, key)
}
