import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/types";

export async function requireAdminSession(
  request: NextRequest,
): Promise<{ user: SessionUser } | Response> {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;
  return { user: user! };
}
