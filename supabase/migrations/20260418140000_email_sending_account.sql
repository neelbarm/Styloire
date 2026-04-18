-- Email sending: single active account per user + send diagnostics

ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS is_sending_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_error_message TEXT,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN;

-- At most one sending-active row per user
CREATE UNIQUE INDEX IF NOT EXISTS connected_accounts_one_sending_active_per_user
  ON public.connected_accounts (user_id)
  WHERE is_sending_active;

CREATE INDEX IF NOT EXISTS idx_connected_accounts_sending_active
  ON public.connected_accounts (user_id, is_sending_active)
  WHERE is_sending_active;

ALTER TABLE public.request_contacts
  ADD COLUMN IF NOT EXISTS send_error TEXT;
