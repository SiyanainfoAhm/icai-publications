import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getTokenFromRequest, revokeSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (token) {
    await revokeSession(token).catch(() => undefined);
  }
  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
