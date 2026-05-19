import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">
        Analytics, active sessions, and publication performance for the ICAI demo portal.
      </p>
      <div className="mt-8">
        <AdminDashboard />
      </div>
    </>
  );
}
