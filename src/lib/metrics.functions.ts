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
    let response: Response;
    try {
      response = await fetch("https://tzbcvsbzoyexslhisovk.supabase.co/functions/v1/check-da", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: data.domain }),
      });
    } catch {
      return { error: "Couldn't reach the metrics service. Please try again." };
    }

    const raw = await response.text();
    let result: { domain?: string; da?: number; error?: string } = {};
    try {
      result = JSON.parse(raw) as typeof result;
    } catch {
      /* non-JSON response */
    }

    if (!response.ok) {
      const message = String(result.error ?? raw);
      if (/quota/i.test(message)) {
        return {
          error:
            "The Moz API quota for this billing period is used up, so live domain metrics are unavailable right now. It resets next period, or upgrade the Moz plan for more lookups.",
        };
      }
      return { error: "Couldn't fetch domain metrics from the provider. Please try again later." };
    }


    // Mengembalikan data hasil nyata dari Moz API melalui Supabase Edge Function
    return {
      domain: result.domain,
      domainAuthority: result.da ?? 0,
      backlinks: 0,         // Placeholder jika API Moz v2 tidak mengembalikan field ini secara langsung
      referringDomains: 0,  // Placeholder
      spamScore: 0,         // Placeholder
      organicKeywords: 0,   // Placeholder
      checkedAt: new Date().toISOString(),
    };
  });