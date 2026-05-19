import { generateOtp, hashValue } from "@/lib/crypto";
import { sendOtpEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const OTP_LENGTH = () => Number(process.env.OTP_LENGTH ?? "6");
const OTP_TTL_MINUTES = () => Number(process.env.OTP_TTL_MINUTES ?? "10");
const OTP_MAX_ATTEMPTS = () => Number(process.env.OTP_MAX_ATTEMPTS ?? "5");

export async function requestOtp(
  email: string,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const otp = generateOtp(OTP_LENGTH());
  const otpHash = hashValue(`${otp}:${process.env.SESSION_SECRET ?? "dev-secret"}`);
  const expiresAt = new Date(
    Date.now() + OTP_TTL_MINUTES() * 60 * 1000,
  ).toISOString();

  const supabase = getSupabaseAdmin();

  await supabase.from("icai_otp_logs").insert({
    email: normalized,
    otp_hash: otpHash,
    expires_at: expiresAt,
    max_attempts: OTP_MAX_ATTEMPTS(),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
  });

  await sendOtpEmail({
    to: normalized,
    otp,
    expiresInMinutes: OTP_TTL_MINUTES(),
  });
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  const { data: log, error } = await supabase
    .from("icai_otp_logs")
    .select("*")
    .eq("email", normalized)
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !log) {
    return { ok: false, message: "No active verification code. Request a new one." };
  }

  if (new Date(log.expires_at) < new Date()) {
    return { ok: false, message: "Code has expired. Request a new one." };
  }

  if (log.attempts >= log.max_attempts) {
    return { ok: false, message: "Too many attempts. Request a new code." };
  }

  const otpHash = hashValue(`${otp}:${process.env.SESSION_SECRET ?? "dev-secret"}`);
  const match = otpHash === log.otp_hash;

  await supabase
    .from("icai_otp_logs")
    .update({ attempts: log.attempts + 1 })
    .eq("id", log.id);

  if (!match) {
    return { ok: false, message: "Invalid verification code." };
  }

  await supabase
    .from("icai_otp_logs")
    .update({ verified: true, verified_at: new Date().toISOString() })
    .eq("id", log.id);

  return { ok: true };
}

export async function hasRecentOtpVerification(email: string, withinMinutes = 15): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("icai_otp_logs")
    .select("id")
    .eq("email", normalized)
    .eq("verified", true)
    .gte("verified_at", since)
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return !!data;
}

export async function ensureNonMemberUser(
  email: string,
): Promise<{ userId: string; needsName: boolean }> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("icai_users")
    .select("id, role, full_name")
    .eq("email", normalized)
    .maybeSingle();

  if (existing) {
    if (existing.role === "admin") {
      throw new Error("Use admin sign-in for this account.");
    }
    if (existing.role === "member") {
      throw new Error("Use ICAI member sign-in for this account.");
    }
    return {
      userId: existing.id,
      needsName: !(existing.full_name ?? "").trim(),
    };
  }

  const { data: created, error } = await supabase
    .from("icai_users")
    .insert({
      email: normalized,
      full_name: null,
      role: "non_member",
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "User create failed");
  return { userId: created.id, needsName: true };
}

export async function setNonMemberFullName(
  userId: string,
  fullName: string,
): Promise<void> {
  const trimmed = fullName.trim();
  if (trimmed.length < 2) {
    throw new Error("Please enter your full name (at least 2 characters).");
  }
  if (trimmed.length > 120) {
    throw new Error("Name is too long.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("icai_users")
    .update({ full_name: trimmed, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("role", "non_member");

  if (error) throw new Error(error.message);
}
