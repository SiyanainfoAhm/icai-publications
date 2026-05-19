import { NextRequest, NextResponse } from "next/server";
import {
  ensureNonMemberUser,
  hasRecentOtpVerification,
  setNonMemberFullName,
} from "@/lib/auth/otp";
import {
  attachSessionCookie,
  createSession,
  requestMeta,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const fullName = typeof body.fullName === "string" ? body.fullName : "";

    if (!email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!(await hasRecentOtpVerification(email))) {
      return NextResponse.json(
        {
          error:
            "Verification expired. Request a new code and sign in again.",
        },
        { status: 401 },
      );
    }

    const { userId } = await ensureNonMemberUser(email);
    await setNonMemberFullName(userId, fullName);

    const meta = requestMeta(request);
    const token = await createSession(userId, {
      ip: meta.ip ?? undefined,
      userAgent: meta.userAgent ?? undefined,
    });

    const normalized = email.trim().toLowerCase();
    const response = NextResponse.json({
      ok: true,
      user: {
        email: normalized,
        role: "non_member",
        full_name: fullName.trim(),
      },
    });
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("OTP complete-profile error:", err);
    const message =
      err instanceof Error ? err.message : "Could not save your name";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
