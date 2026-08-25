INSERT INTO public.domain_checks (domain, domain_authority, backlinks, referring_domains, dofollow_backlinks, dofollow_ref_domains, checked_at)
VALUES ('sultanharamaingresik.com', 0, 5, 5, 5, 5, now())
ON CONFLICT (domain) DO UPDATE SET domain_authority = 0, backlinks = 5, referring_domains = 5, dofollow_backlinks = 5, dofollow_ref_domains = 5, checked_at = now();