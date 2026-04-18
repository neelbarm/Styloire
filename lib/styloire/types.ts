/** Domain model aligned with Styloire Developer Spec v2 (April 2026). */

export type SubscriptionStatus = "active" | "inactive" | "trialing";

export type User = {
  id: string;
  email: string;
  name: string;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
};

export type ClientProfile = {
  id: string;
  user_id: string;
  talent_name: string;
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
};

export type Template = {
  id: string;
  user_id: string | null;
  name: string;
  body: string;
  is_default: boolean;
  created_at: string;
};

/** Row shape for dashboard cards — denormalized counts */
export type RequestSummary = Request & {
  selected_count: number;
  sent_count: number;
  opened_count: number;
  responded_count: number;
};
