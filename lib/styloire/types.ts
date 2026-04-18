/** Domain model aligned with Styloire Developer Spec v4 (April 2026). */

export type SubscriptionStatus = "active" | "inactive" | "trialing";

export type User = {
  id: string;
  email: string;
  name: string;
  cc_emails: string[];
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
};

export type ClientProfile = {
  id: string;
  user_id: string;
  talent_name: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientProfileSummary = ClientProfile & {
  contact_count: number;
  request_count: number;
};

export type BrandContact = {
  id: string;
  client_profile_id: string;
  brand_name: string;
  email: string;
  contact_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RequestStatus = "draft" | "active" | "archived";

export type Request = {
  id: string;
  user_id: string;
  client_profile_id: string | null;
  talent_name: string;
  event_name: string;
  email_subject_template: string;
  email_body: string;
  status: RequestStatus;
  followup_date: string | null;
  followup_body: string | null;
  followup_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RequestContact = {
  id: string;
  request_id: string;
  brand_contact_id: string;
  selected: boolean;
  email_sent: boolean;
  opened: boolean;
  responded: boolean;
  sent_at: string | null;
  send_error?: string | null;
};

export type Template = {
  id: string;
  user_id: string | null;
  name: string;
  body: string;
  is_default: boolean;
  created_at: string;
};

export type ConnectedAccountProvider = "gmail" | "outlook" | "smtp";

export type ConnectedAccount = {
  id: string;
  user_id: string;
  provider: ConnectedAccountProvider;
  email: string;
  display_name: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  status: "active" | "inactive" | "error";
  is_sending_active: boolean;
  last_error_message: string | null;
  last_error_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Row shape for dashboard cards — denormalized counts */
export type RequestSummary = Request & {
  selected_count: number;
  sent_count: number;
  opened_count: number;
  responded_count: number;
};
