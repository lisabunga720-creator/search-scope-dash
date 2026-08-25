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
    // Panggil Supabase Edge Function yang sudah Anda deploy ke project tzbcvsbzoyexslhisovk
    const response = await fetch("https://tzbcvsbzoyexslhisovk.supabase.co/functions/v1/check-da", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain: data.domain }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Gagal mengambil data Domain Authority dari server.");
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