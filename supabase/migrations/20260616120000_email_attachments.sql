-- Phase 2: email image attachments.
-- Stores uploaded attachment files in a private Storage bucket and records
-- their metadata per request. Files are uploaded/downloaded server-side with
-- the service role, so the bucket stays private (no public/anon access).

-- ── Private storage bucket ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-attachments', 'email-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ── request_attachments table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS styloire_request_attachments_request_idx
  ON public.request_attachments (request_id);

ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

-- Owner access mirrors request_contacts: a user reaches an attachment only
-- through a request they own.
DROP POLICY IF EXISTS request_attachments_owner ON public.request_attachments;
CREATE POLICY request_attachments_owner ON public.request_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_attachments.request_id AND r.user_id = auth.uid()
    )
  );
