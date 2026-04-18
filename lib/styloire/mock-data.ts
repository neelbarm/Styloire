import type {
  BrandContact,
  ClientProfile,
  ClientProfileSummary,
  RequestContact,
  RequestSummary,
  Template,
  User
} from "./types";
import {
  DEFAULT_TEMPLATE_FOLLOW_UP,
  DEFAULT_TEMPLATE_STANDARD_PULL
} from "./default-templates";

const now = "2026-04-10T12:00:00.000Z";

export const MOCK_USER: User = {
  id: "usr_demo",
  email: "atelier@styloire.co",
  name: "Jordan Lee",
  stripe_customer_id: "cus_demo",
  subscription_status: "active",
  created_at: now,
  updated_at: now
};

export const MOCK_PROFILES: ClientProfile[] = [
  {
    id: "prof_bella",
    user_id: MOCK_USER.id,
    talent_name: "Bella Hadid",
    created_at: now,
    updated_at: now
  },
  {
    id: "prof_zendaya",
    user_id: MOCK_USER.id,
    talent_name: "Zendaya",
    created_at: now,
    updated_at: now
  }
];

export const MOCK_CONTACTS: BrandContact[] = [
  {
    id: "bc_1",
    client_profile_id: "prof_bella",
    brand_name: "VALENTINO",
    email: "press@valentino.com",
    contact_name: "Elena",
    is_active: true,
    created_at: now,
    updated_at: now
  },
  {
    id: "bc_2",
    client_profile_id: "prof_bella",
    brand_name: "SAINT LAURENT",
    email: "showroom@ysl.com",
    contact_name: "Marie",
    is_active: true,
    created_at: now,
    updated_at: now
  },
  {
    id: "bc_3",
    client_profile_id: "prof_bella",
    brand_name: "PRADA",
    email: "sally@prada.com",
    contact_name: "Sally",
    is_active: true,
    created_at: now,
    updated_at: now
  },
  {
    id: "bc_4",
    client_profile_id: "prof_zendaya",
    brand_name: "LOUIS VUITTON",
    email: "celebrity@vuitton.com",
    contact_name: "Camille",
    is_active: true,
    created_at: now,
    updated_at: now
  }
];

const bodyStandard = DEFAULT_TEMPLATE_STANDARD_PULL.body;

export const MOCK_REQUESTS: RequestSummary[] = [
  {
    id: "req_grammys",
    user_id: MOCK_USER.id,
    client_profile_id: "prof_bella",
    talent_name: "Bella Hadid",
    event_name: "Grammys",
    email_subject_template: "{talent} / {event} / {brand_name}",
    email_body: bodyStandard,
    status: "active",
    followup_date: "2026-04-18",
    followup_body: DEFAULT_TEMPLATE_FOLLOW_UP.body,
    followup_sent: false,
    sent_at: "2026-04-09T15:30:00.000Z",
    created_at: now,
    updated_at: now,
    selected_count: 3,
    sent_count: 3,
    opened_count: 2,
    responded_count: 1
  },
  {
    id: "req_vogue",
    user_id: MOCK_USER.id,
    client_profile_id: "prof_zendaya",
    talent_name: "Zendaya",
    event_name: "Vogue World",
    email_subject_template: "{talent} / {event} / {brand_name}",
    email_body: bodyStandard,
    status: "draft",
    followup_date: null,
    followup_body: null,
    followup_sent: false,
    sent_at: null,
    created_at: now,
    updated_at: now,
    selected_count: 1,
    sent_count: 0,
    opened_count: 0,
    responded_count: 0
  },
  {
    id: "req_archived",
    user_id: MOCK_USER.id,
    client_profile_id: "prof_bella",
    talent_name: "Bella Hadid",
    event_name: "Cannes",
    email_subject_template: "{talent} / {event} / {brand_name}",
    email_body: bodyStandard,
    status: "archived",
    followup_date: null,
    followup_body: null,
    followup_sent: true,
    sent_at: "2026-03-01T10:00:00.000Z",
    created_at: now,
    updated_at: now,
    selected_count: 5,
    sent_count: 5,
    opened_count: 4,
    responded_count: 3
  }
];

export const MOCK_REQUEST_CONTACTS: Record<string, RequestContact[]> = {
  req_vogue: [
    {
      id: "rc_v1",
      request_id: "req_vogue",
      brand_contact_id: "bc_4",
      selected: true,
      email_sent: false,
      opened: false,
      responded: false,
      sent_at: null
    }
  ],
  req_archived: [
    {
      id: "rc_a1",
      request_id: "req_archived",
      brand_contact_id: "bc_1",
      selected: true,
      email_sent: true,
      opened: true,
      responded: true,
      sent_at: "2026-03-01T10:05:00.000Z"
    },
    {
      id: "rc_a2",
      request_id: "req_archived",
      brand_contact_id: "bc_2",
      selected: true,
      email_sent: true,
      opened: true,
      responded: false,
      sent_at: "2026-03-01T10:05:10.000Z"
    },
    {
      id: "rc_a3",
      request_id: "req_archived",
      brand_contact_id: "bc_3",
      selected: true,
      email_sent: true,
      opened: false,
      responded: false,
      sent_at: "2026-03-01T10:05:20.000Z"
    }
  ],
  req_grammys: [
    {
      id: "rc_1",
      request_id: "req_grammys",
      brand_contact_id: "bc_1",
      selected: true,
      email_sent: true,
      opened: true,
      responded: true,
      sent_at: "2026-04-09T15:31:00.000Z"
    },
    {
      id: "rc_2",
      request_id: "req_grammys",
      brand_contact_id: "bc_2",
      selected: true,
      email_sent: true,
      opened: true,
      responded: false,
      sent_at: "2026-04-09T15:31:10.000Z"
    },
    {
      id: "rc_3",
      request_id: "req_grammys",
      brand_contact_id: "bc_3",
      selected: true,
      email_sent: true,
      opened: false,
      responded: false,
      sent_at: "2026-04-09T15:31:20.000Z"
    }
  ]
};

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl_default_standard",
    user_id: null,
    name: DEFAULT_TEMPLATE_STANDARD_PULL.name,
    body: DEFAULT_TEMPLATE_STANDARD_PULL.body,
    is_default: true,
    created_at: now
  },
  {
    id: "tpl_default_follow",
    user_id: null,
    name: DEFAULT_TEMPLATE_FOLLOW_UP.name,
    body: DEFAULT_TEMPLATE_FOLLOW_UP.body,
    is_default: true,
    created_at: now
  },
  {
    id: "tpl_user_1",
    user_id: MOCK_USER.id,
    name: "Short nudge",
    body: `Hi {{contact_name}} — quick note for {{talent}} / {{event}}. Are pulls open at {{brand_name}}?`,
    is_default: false,
    created_at: now
  }
];

export function listRequests(filter?: RequestSummary["status"] | "all"): RequestSummary[] {
  const rows = [...MOCK_REQUESTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (!filter || filter === "all") return rows;
  return rows.filter((r) => r.status === filter);
}

export function getRequest(id: string): RequestSummary | undefined {
  return MOCK_REQUESTS.find((r) => r.id === id);
}

export function getRequestContacts(requestId: string): RequestContact[] {
  return MOCK_REQUEST_CONTACTS[requestId] ?? [];
}

export function getBrandContact(id: string): BrandContact | undefined {
  return MOCK_CONTACTS.find((c) => c.id === id);
}

export function listProfiles(): ClientProfileSummary[] {
  return MOCK_PROFILES.map((p) => {
    const contact_count = MOCK_CONTACTS.filter((c) => c.client_profile_id === p.id).length;
    const request_count = MOCK_REQUESTS.filter((r) => r.client_profile_id === p.id).length;
    return { ...p, contact_count, request_count };
  });
}

export function getProfileWithContacts(
  id: string
): { profile: ClientProfile; contacts: BrandContact[]; requests: RequestSummary[] } | undefined {
  const profile = MOCK_PROFILES.find((p) => p.id === id);
  if (!profile) return undefined;
  return {
    profile,
    contacts: MOCK_CONTACTS.filter((c) => c.client_profile_id === id),
    requests: MOCK_REQUESTS.filter((r) => r.client_profile_id === id)
  };
}

export function listTemplates(): Template[] {
  const defaults = MOCK_TEMPLATES.filter((t) => t.user_id === null);
  const userOnes = MOCK_TEMPLATES.filter((t) => t.user_id !== null);
  return [...defaults, ...userOnes];
}

export type RequestContactDetail = RequestContact & BrandContact;

export function getRequestDetail(id: string):
  | { request: RequestSummary; rows: RequestContactDetail[] }
  | undefined {
  const request = getRequest(id);
  if (!request) return undefined;
  const rows = getRequestContacts(id)
    .map((rc) => {
      const contact = getBrandContact(rc.brand_contact_id);
      return contact ? { ...rc, ...contact } : null;
    })
    .filter((row): row is RequestContactDetail => row !== null);
  return { request, rows };
}
