import { PublicationAdminList } from "@/components/admin/PublicationAdminList";

export default function AdminPublicationsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">Publications</h1>
      <PublicationAdminList />
    </>
  );
}
