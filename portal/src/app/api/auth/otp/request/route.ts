import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/otp";
import { requestMeta } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const meta = requestMeta(request);
    await requestOtp(email, { ip: meta.ip, userAgent: meta.userAgent });

    return NextResponse.json({
      ok: true,
      message: "If the email is valid, a verification code has been sent.",
    });
  } catch (err) {
    console.error("OTP request error:", err);
    return NextResponse.json(
      { error: "Unable to send verification code. Try again later." },
      { status: 500 },
    );
  }
}
