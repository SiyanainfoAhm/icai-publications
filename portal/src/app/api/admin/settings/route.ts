import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DEFAULTS = {
  otp: { ttl_minutes: 10, max_attempts: 5, length: 6 },
  session: { ttl_hours: 24 },
};

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("icai_system_settings").select("key, value");

  if (error) {
    return NextResponse.json({ settings: DEFAULTS, demo: true });
  }

  const settings = { ...DEFAULTS };
  for (const row of data ?? []) {
    if (row.key === "otp") {
      settings.otp = { ...settings.otp, ...(row.value as typeof settings.otp) };
    }
    if (row.key === "session") {
      settings.session = { ...settings.session, ...(row.value as typeof settings.session) };
    }
  }

  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  if (body.otp) {
    await supabase.from("icai_system_settings").upsert({
      key: "otp",
      value: body.otp,
      updated_at: new Date().toISOString(),
    });
  }
  if (body.session) {
    await supabase.from("icai_system_settings").upsert({
      key: "session",
      value: body.session,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
