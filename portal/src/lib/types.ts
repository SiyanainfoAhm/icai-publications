export type IcaiUserRole = "admin" | "member" | "non_member";

export type PublicationStatus = "draft" | "published" | "hidden" | "archived";

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
  committee: string | null;
  topic: string | null;
  cover_image_url: string | null;
  synopsis: string | null;
  release_date: string | null;
  status: PublicationStatus;
}

export interface PublicationDetail extends PublicationMeta {
  content_html?: string;
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
