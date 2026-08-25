CREATE TABLE public.domain_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL UNIQUE,
  domain_authority integer NOT NULL DEFAULT 0,
  backlinks bigint NOT NULL DEFAULT 0,
  referring_domains bigint NOT NULL DEFAULT 0,
  dofollow_backlinks bigint NOT NULL DEFAULT 0,
  dofollow_ref_domains bigint NOT NULL DEFAULT 0,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.domain_checks TO anon;
GRANT SELECT, INSERT ON public.domain_checks TO authenticated;
GRANT ALL ON public.domain_checks TO service_role;

ALTER TABLE public.domain_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view domain checks"
ON public.domain_checks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can add domain checks"
ON public.domain_checks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_domain_checks_updated_at
BEFORE UPDATE ON public.domain_checks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_domain_checks_checked_at ON public.domain_checks (checked_at DESC);