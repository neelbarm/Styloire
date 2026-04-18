-- Styloire V1 schema expansion (Developer Spec v4)
-- Adds: users.cc_emails, connected_accounts, waitlist_signups, contact_messages

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cc_emails TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'smtp')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connected_accounts_user_idx
  ON public.connected_accounts (user_id, is_active DESC, created_at DESC);

DROP TRIGGER IF EXISTS styloire_connected_accounts_updated_at ON public.connected_accounts;
CREATE TRIGGER styloire_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('stylist', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS connected_accounts_owner ON public.connected_accounts;
CREATE POLICY connected_accounts_owner ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS waitlist_service_insert ON public.waitlist_signups;
CREATE POLICY waitlist_service_insert ON public.waitlist_signups
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_service_insert ON public.contact_messages;
CREATE POLICY contact_messages_service_insert ON public.contact_messages
  FOR INSERT TO service_role
  WITH CHECK (true);
