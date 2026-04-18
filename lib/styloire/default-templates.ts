/** Pre-loaded copy from Developer Spec §6 — subject lines use Send-time substitution. */

export const DEFAULT_TEMPLATE_STANDARD_PULL = {
  name: "Standard Pull Request",
  subjectHint: "{{talent}} / {{event}} / {{brand_name}}",
  body: `Hi {{contact_name}},

I hope this email finds you well. I am reaching out on behalf of {{talent}} for {{event}}.

We would love to request a pull from {{brand_name}} for consideration. Please let me know your availability and any requirements for the loan.

Thank you so much for your time.`
} as const;

export const DEFAULT_TEMPLATE_FOLLOW_UP = {
  name: "Follow Up",
  subjectHint: "Following Up — {{talent}} / {{event}} / {{brand_name}}",
  body: `Hi {{contact_name}},

I wanted to follow up on my previous email regarding a pull request for {{talent}} for {{event}}.

Please let me know if you are able to accommodate. We would love to include {{brand_name}}.

Thank you!`
} as const;

export const DYNAMIC_FIELD_HELP = [
  "{{brand_name}}",
  "{{contact_name}}",
  "{{talent}}",
  "{{event}}"
] as const;
