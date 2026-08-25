import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type DomainMetrics = {
  domain: string;
  domainAuthority: number;
  backlinks: number;
  referringDomains: number;
  spamScore: number;
  organicKeywords: number;
  checkedAt: string;
};

export type MetricsResult = DomainMetrics | { error: string };

export const checkDomainMetrics = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        domain: z
          .string()
          .trim()
          .min(3)
          .transform((v) =>
            v
              .replace(/^https?:\/\//i, "")
              .replace(/^www\./i, "")
              .replace(/\/.*$/, "")
              .toLowerCase(),
          )
          .refine((v) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v), {
            message: "Enter a valid domain, e.g. example.com",
          }),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<MetricsResult> => {
    const basicAuth = process.env["MOZ_BASIC_AUTH"];
    if (!basicAuth) {
      return { error: "Moz API credentials are not configured on the server." };
    }

    let response: Response;
    try {
      response = await fetch("https://lsapi.seomoz.com/v2/url_metrics", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targets: [data.domain] }),
      });
    } catch {
      return { error: "Couldn't reach the metrics service. Please try again." };
    }

    const raw = await response.text();
    let payload: {
      results?: Array<{
        domain_authority?: number;
        external_pages_to_root_domain?: number;
        root_domains_to_root_domain?: number;
        spam_score?: number;
      }>;
      error?: string;
    } = {};
    try {
      payload = JSON.parse(raw) as typeof payload;
    } catch {
      /* non-JSON response */
    }

    if (!response.ok) {
      const message = String(payload.error ?? raw);
      if (/quota/i.test(message)) {
        return {
          error:
            "The Moz API quota for this billing period is used up, so live domain metrics are unavailable right now. It resets next period, or upgrade the Moz plan for more lookups.",
        };
      }
      if (response.status === 401 || response.status === 403) {
        return { error: "Moz rejected the API credentials. Please double-check the keys." };
      }
      return { error: "Couldn't fetch domain metrics from the provider. Please try again later." };
    }

    const item = payload.results?.[0] ?? {};

    return {
      domain: data.domain,
      domainAuthority: item.domain_authority ?? 0,
      backlinks: item.external_pages_to_root_domain ?? 0,
      referringDomains: item.root_domains_to_root_domain ?? 0,
      spamScore: item.spam_score ?? 0,
      organicKeywords: 0,
      checkedAt: new Date().toISOString(),
    };
  });