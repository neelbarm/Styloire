-- Styloire V1 schema (Developer Spec v2)
-- Apply with: supabase db push   OR paste into Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'trialing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  talent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brand_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES public.client_profiles (id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES public.client_profiles (id) ON DELETE SET NULL,
  talent_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  email_subject_template TEXT NOT NULL DEFAULT '{talent} / {event} / {brand_name}',
  email_body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  followup_date DATE,
  followup_body TEXT,
  followup_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS styloire_requests_user_created_at_idx
  ON public.requests (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.request_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  brand_contact_id UUID NOT NULL REFERENCES public.brand_contacts (id) ON DELETE CASCADE,
  selected BOOLEAN NOT NULL DEFAULT true,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  opened BOOLEAN NOT NULL DEFAULT false,
  responded BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  UNIQUE (request_id, brand_contact_id)
);

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT templates_owner_or_global CHECK (
    user_id IS NOT NULL OR is_default = true
  )
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.styloire_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS styloire_users_updated_at ON public.users;
CREATE TRIGGER styloire_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER styloire_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_brand_contacts_updated_at ON public.brand_contacts;
CREATE TRIGGER styloire_brand_contacts_updated_at
  BEFORE UPDATE ON public.brand_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

DROP TRIGGER IF EXISTS styloire_requests_updated_at ON public.requests;
CREATE TRIGGER styloire_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.styloire_set_updated_at();

-- ---------------------------------------------------------------------------
-- dashboard view
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.request_dashboard_rows AS
SELECT
  r.id,
  r.user_id,
  r.client_profile_id,
  r.talent_name,
  r.event_name,
  r.email_subject_template,
  r.email_body,
  r.status,
  r.followup_date,
  r.followup_body,
  r.followup_sent,
  r.sent_at,
  r.created_at,
  r.updated_at,
  COALESCE(s.selected_count, 0)::bigint AS selected_count,
  COALESCE(s.sent_count, 0)::bigint AS sent_count,
  COALESCE(s.opened_count, 0)::bigint AS opened_count,
  COALESCE(s.responded_count, 0)::bigint AS responded_count
FROM public.requests r
LEFT JOIN (
  SELECT
    request_id,
    COUNT(*) FILTER (WHERE selected) AS selected_count,
    COUNT(*) FILTER (WHERE email_sent) AS sent_count,
    COUNT(*) FILTER (WHERE opened) AS opened_count,
    COUNT(*) FILTER (WHERE responded) AS responded_count
  FROM public.request_contacts
  GROUP BY request_id
) s ON s.request_id = r.id;

-- ---------------------------------------------------------------------------
-- RLS (public.users.id should match auth.users.id when auth is wired)
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS client_profiles_owner ON public.client_profiles;
CREATE POLICY client_profiles_owner ON public.client_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brand_contacts_owner ON public.brand_contacts;
CREATE POLICY brand_contacts_owner ON public.brand_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = brand_contacts.client_profile_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS requests_owner ON public.requests;
CREATE POLICY requests_owner ON public.requests
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS request_contacts_owner ON public.request_contacts;
CREATE POLICY request_contacts_owner ON public.request_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_contacts.request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS templates_read ON public.templates;
CREATE POLICY templates_read ON public.templates
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS templates_write ON public.templates;
CREATE POLICY templates_write ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS templates_update ON public.templates;
CREATE POLICY templates_update ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS templates_delete ON public.templates;
CREATE POLICY templates_delete ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT ON public.request_dashboard_rows TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- seed (fixed UUIDs for local + STYLOIRE_DASHBOARD_USER_ID)
-- ---------------------------------------------------------------------------

INSERT INTO public.users (id, email, name, stripe_customer_id, subscription_status)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'atelier@styloire.co',
  'Jordan Lee',
  'cus_demo',
  'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.client_profiles (id, user_id, talent_name)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Bella Hadid'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Zendaya')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_contacts (id, client_profile_id, brand_name, email, contact_name)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'VALENTINO', 'press@valentino.com', 'Elena'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'SAINT LAURENT', 'showroom@ysl.com', 'Marie'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'PRADA', 'sally@prada.com', 'Sally'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', 'LOUIS VUITTON', 'celebrity@vuitton.com', 'Camille')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.requests (
  id, user_id, client_profile_id, talent_name, event_name, email_body, status,
  followup_date, followup_body, followup_sent, sent_at
) VALUES
(
  'd0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'Bella Hadid',
  'Grammys',
  'Hi {{contact_name}} — pull request body…',
  'active',
  '2026-04-18',
  'Follow up copy…',
  false,
  '2026-04-09T15:30:00Z'
),
(
  'd0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  'Zendaya',
  'Vogue World',
  'Draft body…',
  'draft',
  NULL,
  NULL,
  false,
  NULL
),
(
  'd0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'Bella Hadid',
  'Cannes',
  'Archived body…',
  'archived',
  NULL,
  NULL,
  true,
  '2026-03-01T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.request_contacts (
  id, request_id, brand_contact_id, selected, email_sent, opened, responded, sent_at
) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', true, true, true, true, '2026-04-09T15:31:00Z'),
  ('e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', true, true, true, false, '2026-04-09T15:31:10Z'),
  ('e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', true, true, false, false, '2026-04-09T15:31:20Z'),
  ('e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000004', true, false, false, false, NULL),
  ('e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', true, true, true, true, '2026-03-01T10:05:00Z'),
  ('e0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', true, true, true, false, '2026-03-01T10:05:10Z'),
  ('e0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', true, true, false, false, '2026-03-01T10:05:20Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.templates (id, user_id, name, body, is_default)
VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    NULL,
    'Standard Pull Request',
    E'Hi {{contact_name}},\n\nWe would love to request a pull from {{brand_name}} for {{talent}} / {{event}}.',
    true
  ),
  (
    'f0000000-0000-4000-8000-000000000002',
    NULL,
    'Follow Up',
    E'Hi {{contact_name}},\n\nFollowing up regarding {{talent}} for {{event}} at {{brand_name}}.',
    true
  )
ON CONFLICT (id) DO NOTHING;
