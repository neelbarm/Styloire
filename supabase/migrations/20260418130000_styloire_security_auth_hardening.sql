-- Styloire production hardening
-- Aligns auth ownership, RLS, indexes, and updated_at behavior for V1 launch.

-- ---------------------------------------------------------------------------
-- table alignment (connected_accounts, waitlist_signups, contact_messages)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'smtp')),
  email TEXT NOT NULL,
  display_name TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password_encrypted TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS smtp_password_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

UPDATE public.connected_accounts
SET email = COALESCE(email, email_address)
WHERE email IS NULL;

UPDATE public.connected_accounts
SET access_token_encrypted = COALESCE(access_token_encrypted, access_token)
WHERE access_token_encrypted IS NULL;

UPDATE public.connected_accounts
SET refresh_token_encrypted = COALESCE(refresh_token_encrypted, refresh_token)
WHERE refresh_token_encrypted IS NULL;

UPDATE public.connected_accounts
SET token_expires_at = COALESCE(token_expires_at, token_expiry)
WHERE token_expires_at IS NULL;

UPDATE public.connected_accounts
SET smtp_password_encrypted = COALESCE(smtp_password_encrypted, smtp_password)
WHERE smtp_password_encrypted IS NULL;

UPDATE public.connected_accounts
SET status = 'active'
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'error');

ALTER TABLE public.connected_accounts
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.connected_accounts
  DROP CONSTRAINT IF EXISTS connected_accounts_status_check;
ALTER TABLE public.connected_accounts
  ADD CONSTRAINT connected_accounts_status_check
  CHECK (status IN ('active', 'inactive', 'error'));

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'marketing_site',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'invited', 'signed_up', 'archived')),
  invited_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'marketing_site',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signed_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.waitlist_signups
  DROP CONSTRAINT IF EXISTS waitlist_signups_status_check;
ALTER TABLE public.waitlist_signups
  ADD CONSTRAINT waitlist_signups_status_check
  CHECK (status IN ('new', 'invited', 'signed_up', 'archived'));

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  role TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_status_check
  CHECK (status IN ('new', 'read', 'replied', 'archived'));

-- ---------------------------------------------------------------------------
-- normalize ownership to auth.users
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'client_profiles'
      AND constraint_name = 'client_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.client_profiles DROP CONSTRAINT client_profiles_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.client_profiles
  ADD CONSTRAINT client_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'requests'
      AND constraint_name = 'requests_user_id_fkey'
  ) THEN
    ALTER TABLE public.requests DROP CONSTRAINT requests_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.requests
  ADD CONSTRAINT requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.request_contacts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------------
-- indexes (foreign keys, RLS predicates, request/query paths)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_brand_contacts_client_profile_id ON public.brand_contacts (client_profile_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_client_profile_id ON public.requests (client_profile_id);
CREATE INDEX IF NOT EXISTS idx_request_contacts_request_id ON public.request_contacts (request_id);
CREATE INDEX IF NOT EXISTS idx_request_contacts_brand_contact_id ON public.request_contacts (brand_contact_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates (user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_email ON public.waitlist_signups (email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages (email);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS styloire_connected_accounts_updated_at ON public.connected_accounts;
CREATE TRIGGER styloire_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_waitlist_signups_updated_at ON public.waitlist_signups;
CREATE TRIGGER styloire_waitlist_signups_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER styloire_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_request_contacts_updated_at ON public.request_contacts;
CREATE TRIGGER styloire_request_contacts_updated_at
  BEFORE UPDATE ON public.request_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_templates_updated_at ON public.templates;
CREATE TRIGGER styloire_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS hardening
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;
DROP POLICY IF EXISTS users_insert_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS client_profiles_owner ON public.client_profiles;
CREATE POLICY client_profiles_owner_select ON public.client_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY client_profiles_owner_insert ON public.client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY client_profiles_owner_update ON public.client_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY client_profiles_owner_delete ON public.client_profiles
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brand_contacts_owner ON public.brand_contacts;
CREATE POLICY brand_contacts_owner_select ON public.brand_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY brand_contacts_owner_insert ON public.brand_contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY brand_contacts_owner_update ON public.brand_contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY brand_contacts_owner_delete ON public.brand_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS requests_owner ON public.requests;
CREATE POLICY requests_owner_select ON public.requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY requests_owner_insert ON public.requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY requests_owner_update ON public.requests
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY requests_owner_delete ON public.requests
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS request_contacts_owner ON public.request_contacts;
CREATE POLICY request_contacts_owner_select ON public.request_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  );
CREATE POLICY request_contacts_owner_insert ON public.request_contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  );
CREATE POLICY request_contacts_owner_update ON public.request_contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  );
CREATE POLICY request_contacts_owner_delete ON public.request_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS templates_read ON public.templates;
DROP POLICY IF EXISTS templates_write ON public.templates;
DROP POLICY IF EXISTS templates_update ON public.templates;
DROP POLICY IF EXISTS templates_delete ON public.templates;
CREATE POLICY templates_owner_or_default_select ON public.templates
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY templates_owner_insert ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY templates_owner_update ON public.templates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY templates_owner_delete ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS connected_accounts_owner ON public.connected_accounts;
CREATE POLICY connected_accounts_owner_select ON public.connected_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY connected_accounts_owner_insert ON public.connected_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY connected_accounts_owner_update ON public.connected_accounts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY connected_accounts_owner_delete ON public.connected_accounts
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS waitlist_service_insert ON public.waitlist_signups;
CREATE POLICY waitlist_service_insert ON public.waitlist_signups
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_service_insert ON public.contact_messages;
CREATE POLICY contact_messages_service_insert ON public.contact_messages
  FOR INSERT TO service_role
  WITH CHECK (true);
