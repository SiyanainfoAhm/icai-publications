import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getTokenFromCookies, resolveSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getTokenFromCookies();
  const user = await resolveSessionUser(token);

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
