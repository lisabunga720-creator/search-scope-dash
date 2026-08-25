-- Remove fully public read/write access to domain_checks.
DROP POLICY IF EXISTS "Anyone can view domain checks" ON public.domain_checks;
DROP POLICY IF EXISTS "Anyone can add domain checks" ON public.domain_checks;

REVOKE ALL ON public.domain_checks FROM anon;
REVOKE ALL ON public.domain_checks FROM authenticated;
GRANT ALL ON public.domain_checks TO service_role;

ALTER TABLE public.domain_checks ENABLE ROW LEVEL SECURITY;