import { NextRequest, NextResponse } from "next/server";
import { authenticateWithPassword } from "@/lib/auth/credentials";
import {
  attachSessionCookie,
  createSession,
  requestMeta,
} from "@/lib/auth/session";

/**
 * Mock ICAI SSP member login for demo (email + password).
 * Production: replace with OAuth2/OIDC callback from ICAI Self-Service Portal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email as string)?.trim().toLowerCase() ?? "";
    const password = (body.password as string) ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const auth = await authenticateWithPassword(email, password, "member");
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const meta = requestMeta(request);
    const token = await createSession(auth.userId, {
      ip: meta.ip ?? undefined,
      userAgent: meta.userAgent ?? undefined,
    });

    const response = NextResponse.json({
      ok: true,
      user: { email, role: "member" },
    });
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Member login error:", err);
    return NextResponse.json({ error: "Unable to sign in. Try again later." }, { status: 500 });
  }
}
