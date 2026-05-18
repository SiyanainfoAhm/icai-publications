import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const user = await resolveSessionUser(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
