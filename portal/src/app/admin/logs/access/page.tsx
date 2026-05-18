import { AdminDataTable } from "@/components/admin/AdminDataTable";

export default function AccessLogsPage() {
  return (
    <AdminDataTable
      title="Publication reading activity"
      endpoint="/api/admin/logs/access"
      emptyMessage="No publication views recorded yet."
      columns={[
        { key: "when", label: "Date & time" },
        { key: "publication", label: "Publication" },
        { key: "reader", label: "Reader" },
      ]}
    />
  );
}
