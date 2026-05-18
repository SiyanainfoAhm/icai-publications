import type { SessionUser } from "@/lib/types";

/** Any authenticated portal user (OTP visitor, member, or admin). */
export function canAccessReader(user: SessionUser | null): boolean {
  if (!user) return false;
  return ["admin", "member", "non_member"].includes(user.role);
}

/** Flipbook uses the same access rule as the secure reader. */
export function canAccessFlipbook(user: SessionUser | null): boolean {
  return canAccessReader(user);
}
