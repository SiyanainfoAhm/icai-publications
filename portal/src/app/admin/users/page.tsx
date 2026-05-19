import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";

export default function AdminUsersPage() {
  return (
    <>
      <h1 className="admin-page-title">User management</h1>
      <p className="admin-page-subtitle">
        Search non-member and member accounts, export data, and block access. View access
        logs for per-user publication history.
      </p>
      <AdminUsersPanel />
    </>
  );
}
