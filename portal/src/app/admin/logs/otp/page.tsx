import { AdminDataTable } from "@/components/admin/AdminDataTable";

export default function OtpLogsPage() {
  return (
    <AdminDataTable
      title="Email verification activity"
      endpoint="/api/admin/logs/otp"
      emptyMessage="No verification requests recorded yet."
      columns={[
        { key: "email", label: "Email" },
        { key: "requested", label: "Requested" },
        { key: "expires", label: "Expires" },
        { key: "attempts", label: "Attempts" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
