ALTER TABLE public.domain_checks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_checks;