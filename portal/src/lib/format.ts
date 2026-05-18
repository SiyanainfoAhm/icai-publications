import type { IcaiUserRole } from "@/lib/types";

export function formatRole(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "member":
      return "ICAI Member";
    case "non_member":
      return "Registered visitor";
    default:
      return role ?? "—";
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatPublicationStatus(status: string): string {
  switch (status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    case "hidden":
      return "Hidden";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export function isRole(value: string): value is IcaiUserRole {
  return ["admin", "member", "non_member"].includes(value);
}
