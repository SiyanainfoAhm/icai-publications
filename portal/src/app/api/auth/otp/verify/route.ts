import { NextRequest, NextResponse } from "next/server";
import { ensureNonMemberUser, verifyOtp } from "@/lib/auth/otp";
import {
  attachSessionCookie,
  createSession,
  requestMeta,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 },
      );
    }

    const result = await verifyOtp(email, otp);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = await ensureNonMemberUser(email);
    const meta = requestMeta(request);
    const token = await createSession(userId, {
      ip: meta.ip ?? undefined,
      userAgent: meta.userAgent ?? undefined,
    });

    const response = NextResponse.json({
      ok: true,
      user: { email: email.trim().toLowerCase(), role: "non_member" },
    });
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("OTP verify error:", err);
    const message =
      err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
