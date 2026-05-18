import { verifyPassword } from "@/lib/auth/password";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { IcaiUserRole } from "@/lib/types";

export async function authenticateWithPassword(
  email: string,
  password: string,
  expectedRole: IcaiUserRole,
): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  const { data: user, error } = await supabase
    .from("icai_users")
    .select("id, role, is_active, password_hash")
    .eq("email", normalized)
    .maybeSingle();

  if (error || !user) {
    return { ok: false, message: "Invalid email or password." };
  }

  if (!user.is_active) {
    return { ok: false, message: "This account is not active." };
  }

  if (user.role !== expectedRole) {
    return { ok: false, message: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { ok: false, message: "Invalid email or password." };
  }

  return { ok: true, userId: user.id };
}
