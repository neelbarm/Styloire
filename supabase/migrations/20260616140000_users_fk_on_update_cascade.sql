-- Fix: duplicate-email crash in ensurePublicUserRow.
-- When an auth account is recreated, public.users can hold a row whose id no
-- longer matches the user's auth id (same email, different id). Reconciling
-- that means updating public.users.id to the current auth id, which requires
-- child foreign keys to cascade the id change. This migration re-creates the
-- FKs referencing public.users(id) with ON UPDATE CASCADE. ON DELETE CASCADE
-- behavior is unchanged; no data is modified.

ALTER TABLE public.client_profiles
  DROP CONSTRAINT IF EXISTS client_profiles_user_id_fkey;
ALTER TABLE public.client_profiles
  ADD CONSTRAINT client_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.requests
  DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE public.requests
  ADD CONSTRAINT requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.templates
  DROP CONSTRAINT IF EXISTS templates_user_id_fkey;
ALTER TABLE public.templates
  ADD CONSTRAINT templates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.connected_accounts
  DROP CONSTRAINT IF EXISTS connected_accounts_user_id_fkey;
ALTER TABLE public.connected_accounts
  ADD CONSTRAINT connected_accounts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id)
  ON DELETE CASCADE ON UPDATE CASCADE;
