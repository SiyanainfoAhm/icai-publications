export type IcaiUserRole = "admin" | "member" | "non_member";

export type PublicationStatus = "draft" | "published" | "hidden" | "archived";

export type PublicationType = "pdf_publication" | "web_page_article" | "pdf_article";

export type DownloadPermission = "disabled" | "controlled_download" | "admin_only";

export type PublicationVisibility = "public_metadata" | "authenticated_reader";

export interface IcaiUser {
  id: string;
  email: string;
  full_name: string | null;
  role: IcaiUserRole;
  is_active: boolean;
  ssp_subject_id: string | null;
  created_at: string;
}

export interface PublicationMeta {
  id: string;
  slug: string;
  title: string;
  publication_type: PublicationType;
  committee: string | null;
  topic: string | null;
  keywords: string | null;
  cover_image_url: string | null;
  synopsis: string | null;
  release_date: string | null;
  status: PublicationStatus;
  is_featured: boolean;
  download_permission: DownloadPermission;
  visibility: PublicationVisibility;
}

export interface PublicationDetail extends PublicationMeta {
  article_content?: string;
  content_html?: string;
  pdf_file_url?: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  full_name: string | null;
  role: IcaiUserRole;
}

export interface OtpLogRow {
  id: string;
  email: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  verified: boolean;
  verified_at: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AccessLogRow {
  id: string;
  accessed_at: string;
  access_type: string;
  ip_address: string | null;
  publication: { title: string; slug: string } | null;
  user: { email: string; full_name: string | null } | null;
}
