import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { DomainMetrics } from "./metrics.functions";

const metricsSchema = z.object({
  domain: z.string().min(3),
  domainAuthority: z.number(),
  backlinks: z.number(),
  referringDomains: z.number(),
  dofollowBacklinks: z.number(),
  dofollowRefDomains: z.number(),
  checkedAt: z.string(),
});

type Row = {
  domain: string;
  domain_authority: number;
  backlinks: number;
  referring_domains: number;
  dofollow_backlinks: number;
  dofollow_ref_domains: number;
  checked_at: string;
};

function toMetrics(row: Row): DomainMetrics {
  return {
    domain: row.domain,
    domainAuthority: row.domain_authority,
    backlinks: Number(row.backlinks),
    referringDomains: Number(row.referring_domains),
    dofollowBacklinks: Number(row.dofollow_backlinks),
    dofollowRefDomains: Number(row.dofollow_ref_domains),
    checkedAt: row.checked_at,
  };
}

export const listDomainChecks = createServerFn({ method: "GET" }).handler(
  async (): Promise<DomainMetrics[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("domain_checks")
      .select(
        "domain, domain_authority, backlinks, referring_domains, dofollow_backlinks, dofollow_ref_domains, checked_at",
      )
      .order("checked_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("listDomainChecks failed", error);
      return [];
    }
    return (data as Row[]).map(toMetrics);
  },
);


export const saveDomainCheck = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => metricsSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("domain_checks").upsert(
      {
        domain: data.domain,
        domain_authority: data.domainAuthority,
        backlinks: data.backlinks,
        referring_domains: data.referringDomains,
        dofollow_backlinks: data.dofollowBacklinks,
        dofollow_ref_domains: data.dofollowRefDomains,
        checked_at: data.checkedAt,
      },
      { onConflict: "domain" },
    );
    if (error) {
      console.error("saveDomainCheck failed", error);
      return { ok: false };
    }
    return { ok: true };
  });

export const deleteDomainCheck = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ domain: z.string().min(3) }).parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("domain_checks")
      .delete()
      .eq("domain", data.domain);
    if (error) {
      console.error("deleteDomainCheck failed", error);
      return { ok: false };
    }
    return { ok: true };
  });

export const clearDomainChecks = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("domain_checks")
      .delete()
      .not("domain", "is", null);
    if (error) {
      console.error("clearDomainChecks failed", error);
      return { ok: false };
    }
    return { ok: true };
  },
);
