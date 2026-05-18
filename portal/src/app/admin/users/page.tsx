import { AdminDataTable } from "@/components/admin/AdminDataTable";

export default function AdminUsersPage() {
  return (
    <AdminDataTable
      title="Registered users"
      endpoint="/api/admin/users"
      emptyMessage="No users registered yet."
      columns={[
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "accountType", label: "Account type" },
        { key: "status", label: "Status" },
        { key: "registered", label: "Registered" },
      ]}
    />
  );
}
