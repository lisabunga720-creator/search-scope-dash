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

// Deterministic pseudo-metrics derived from the domain string.
// Swap this handler body for a live backlink API when credentials are available.
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

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
  .handler(async ({ data }): Promise<DomainMetrics> => {
    const h = hash(data.domain);
    const da = h % 92;
    return {
      domain: data.domain,
      domainAuthority: da,
      backlinks: (h % 987654) * (1 + (da % 7)) + 120,
      referringDomains: (h % 4321) + 12,
      spamScore: h % 18,
      organicKeywords: (h % 76543) + 40,
      checkedAt: new Date().toISOString(),
    };
  });
