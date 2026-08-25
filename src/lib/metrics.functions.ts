import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type DomainMetrics = {
  domain: string;
  domainAuthority: number;
  backlinks: number;
  referringDomains: number;
  dofollowBacklinks: number;
  dofollowRefDomains: number;
  checkedAt: string;
};

export type MetricsResult = DomainMetrics | { error: string };

const GATEWAY_URL = "https://connector-gateway.lovable.dev/apify";
const ACTOR_ID = "kinaesthetic_millionaire~ahref-website-authority-checker";

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
    const lovableApiKey = process.env["LOVABLE_API_KEY"];
    const apifyKey = process.env["APIFY_API_KEY"];
    if (!lovableApiKey || !apifyKey) {
      return { error: "The Apify connection isn't configured on the server yet." };
    }

    let response: Response;
    try {
      response = await fetch(
        `${GATEWAY_URL}/acts/${ACTOR_ID}/run-sync-get-dataset-items?timeout=120`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "X-Connection-Api-Key": apifyKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ start_urls: [{ url: `https://${data.domain}` }] }),
        },
      );
    } catch {
      return { error: "Couldn't reach the metrics service. Please try again." };
    }

    const raw = await response.text();

    if (!response.ok) {
      console.error(`Apify gateway request failed [${response.status}]: ${raw}`);
      if (response.status === 401 || response.status === 403) {
        return { error: "Apify rejected the request — the connection needs to be re-authorized." };
      }
      if (response.status === 402) {
        return { error: "The Apify account is out of credit for this Actor run." };
      }
      if (response.status === 429) {
        return { error: "Apify is rate limiting requests right now. Try again in a moment." };
      }
      return { error: `Couldn't fetch domain metrics [${response.status}]. Please try again later.` };
    }

    let items: Array<{
      domainRating?: number;
      backlinks?: number;
      refdomains?: number;
      dofollowBacklinks?: number;
      dofollowRefdomains?: number;
    }> = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      return { error: "The metrics service returned an unexpected response." };
    }

    const item = items[0];
    if (!item) {
      return { error: `No authority data came back for ${data.domain}.` };
    }

    return {
      domain: data.domain,
      domainAuthority: item.domainRating ?? 0,
      backlinks: item.backlinks ?? 0,
      referringDomains: item.refdomains ?? 0,
      dofollowBacklinks: item.dofollowBacklinks ?? 0,
      dofollowRefDomains: item.dofollowRefdomains ?? 0,
      checkedAt: new Date().toISOString(),
    };
  });
