import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/types";

export function requireAuth(
  user: SessionUser | null,
): user is SessionUser {
  return user !== null;
}

export function requireAdmin(user: SessionUser | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export function canReadPublications(user: SessionUser | null): boolean {
  if (!user) return false;
  return ["admin", "member", "non_member"].includes(user.role);
}

export { canAccessFlipbook, canAccessReader } from "@/lib/auth/access";
