import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client for API routes and server components.
 *
 * Why a secret key at all?
 * - This app does NOT use Supabase Auth; all access goes through Next.js APIs.
 * - With RLS enabled and no policies (see 001_schema.sql), the anon key cannot read/write.
 * - With RLS disabled ("UNRESTRICTED" in dashboard), the anon key works — but only
 *   use it here on the server, never in the browser.
 *
 * Prefer SUPABASE_SERVICE_ROLE_KEY in production. For demos with RLS off, you may
 * set SUPABASE_SERVER_KEY to the anon key instead (server env only).
 */
function resolveServerKey(): string {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceRole) return serviceRole;

  const serverKey = process.env.SUPABASE_SERVER_KEY?.trim();
  if (serverKey) return serverKey;

  throw new Error(
    "Missing Supabase server key: set SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_SERVER_KEY",
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveServerKey();

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return serverClient;
}
