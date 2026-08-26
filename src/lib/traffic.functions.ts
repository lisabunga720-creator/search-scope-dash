import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type MonthlyVisit = { month: string; visits: number };
export type TopKeyword = {
  keyword: string;
  searchVolume: number | null;
  estimatedValue: number | null;
};

export type DomainTraffic = {
  domain: string;
  rankGlobal: number | null;
  country: string | null;
  countryRank: number | null;
  totalVisits: number | null;
  bounceRate: number | null;
  pagesPerVisit: number | null;
  timeOnSite: number | null;
  dataCoverage: "full" | "partial" | "no_data" | string;
  monthlyVisits: MonthlyVisit[];
  topKeywords: TopKeyword[];
  checkedAt: string;
};

export type TrafficResult = DomainTraffic | { error: string };

const GATEWAY_URL = "https://connector-gateway.lovable.dev/apify";
const ACTOR_ID = "vortex_data~similarweb-scraper";

export const checkDomainTraffic = createServerFn({ method: "POST" })
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
  .handler(async ({ data }): Promise<TrafficResult> => {
    const lovableApiKey = process.env["LOVABLE_API_KEY"];
    const apifyKey = process.env["APIFY_API_KEY"] ?? process.env["APIFY_API_TOKEN"];
    if (!lovableApiKey || !apifyKey) {
      return { error: "The Apify connection isn't configured on the server yet." };
    }

    let response: Response;
    try {
      response = await fetch(
        `${GATEWAY_URL}/acts/${ACTOR_ID}/run-sync-get-dataset-items?timeout=180`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "X-Connection-Api-Key": apifyKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domains: [data.domain], datasetMode: "base_data" }),
        },
      );
    } catch {
      return { error: "Couldn't reach the traffic service. Please try again." };
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
      return { error: `Couldn't fetch traffic data [${response.status}]. Please try again later.` };
    }

    let items: Array<Record<string, unknown>> = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      return { error: "The traffic service returned an unexpected response." };
    }

    const item = items[0];
    if (!item) {
      return { error: `No traffic data came back for ${data.domain}.` };
    }

    const num = (v: unknown): number | null => (typeof v === "number" && !Number.isNaN(v) ? v : null);

    const monthly = Array.isArray(item["monthlyVisits"])
      ? (item["monthlyVisits"] as Array<Record<string, unknown>>)
          .map((m) => ({ month: String(m["month"] ?? ""), visits: num(m["visits"]) ?? 0 }))
          .filter((m) => m.month)
      : [];

    const keywords = Array.isArray(item["topKeywords"])
      ? (item["topKeywords"] as Array<Record<string, unknown>>)
          .map((k) => ({
            keyword: String(k["keyword"] ?? ""),
            searchVolume: num(k["searchVolume"]),
            estimatedValue: num(k["estimatedValue"]),
          }))
          .filter((k) => k.keyword)
          .slice(0, 8)
      : [];

    return {
      domain: String(item["domain"] ?? data.domain),
      rankGlobal: num(item["rankGlobal"]),
      country: typeof item["country"] === "string" ? (item["country"] as string) : null,
      countryRank: num(item["countryRank"]),
      totalVisits: num(item["totalVisits"]),
      bounceRate: num(item["bounceRate"]),
      pagesPerVisit: num(item["pagesPerVisit"]),
      timeOnSite: num(item["timeOnSite"]),
      dataCoverage: typeof item["dataCoverage"] === "string" ? (item["dataCoverage"] as string) : "no_data",
      monthlyVisits: monthly,
      topKeywords: keywords,
      checkedAt: new Date().toISOString(),
    };
  });
