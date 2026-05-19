import { PublicationAdminList } from "@/components/admin/PublicationAdminList";

export default function AdminPublicationsPage() {
  return (
    <>
      <h1 className="admin-page-title">Publication management</h1>
      <p className="admin-page-subtitle">
        Upload, edit, hide, archive, or delete publications. Hidden items are removed from
        the public catalogue and are not accessible via public URLs.
      </p>
      <PublicationAdminList />
    </>
  );
}
