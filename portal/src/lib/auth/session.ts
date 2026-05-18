import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateSessionToken, hashValue } from "@/lib/crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SessionUser } from "@/lib/types";

const COOKIE_NAME = () =>
  process.env.SESSION_COOKIE_NAME ?? "icai_session";

const TTL_HOURS = () =>
  Number(process.env.SESSION_TTL_HOURS ?? "24");

export async function createSession(
  userId: string,
  meta?: { ip?: string; userAgent?: string },
): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashValue(
    `${token}:${process.env.SESSION_SECRET ?? "dev-secret"}`,
  );
  const expiresAt = new Date(
    Date.now() + TTL_HOURS() * 60 * 60 * 1000,
  ).toISOString();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("icai_sessions").insert({
    user_id: userId,
    session_token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
  });

  if (error) throw new Error(error.message);
  return token;
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
): NextResponse {
  response.cookies.set(COOKIE_NAME(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_HOURS() * 60 * 60,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME())?.value ?? null;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME())?.value ?? null;
}

export async function resolveSessionUser(
  token: string | null,
): Promise<SessionUser | null> {
  if (!token) return null;

  const tokenHash = hashValue(
    `${token}:${process.env.SESSION_SECRET ?? "dev-secret"}`,
  );
  const supabase = getSupabaseAdmin();

  const { data: session, error } = await supabase
    .from("icai_sessions")
    .select("id, user_id, expires_at, revoked")
    .eq("session_token_hash", tokenHash)
    .maybeSingle();

  if (error || !session || session.revoked) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const { data: user, error: userError } = await supabase
    .from("icai_users")
    .select("id, email, full_name, role, is_active")
    .eq("id", session.user_id)
    .maybeSingle();

  if (userError || !user || !user.is_active) return null;

  await supabase
    .from("icai_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", session.id);

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}

export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashValue(
    `${token}:${process.env.SESSION_SECRET ?? "dev-secret"}`,
  );
  const supabase = getSupabaseAdmin();
  await supabase
    .from("icai_sessions")
    .update({ revoked: true })
    .eq("session_token_hash", tokenHash);
}

export function requestMeta(request: NextRequest) {
  return {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent"),
  };
}
