import { ArrowUpRight, FileSearch, Link2, Search, ShieldAlert } from "lucide-react";

const nf = new Intl.NumberFormat("en-US");

const SNAPSHOT = {
  domain: "sultanharamaingresik.com",
  domainAuthority: 0,
  backlinks: 5,
  referringDomains: 5,
  referringPages: 5,
  organicKeywords: 0,
  organicTraffic: "No measurable organic traffic",
};

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function AuditSnapshot() {
  return (
    <section className="panel mt-10 rounded-2xl p-6 md:p-8" aria-labelledby="snapshot-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <FileSearch className="size-3.5 text-primary" />
            Client audit snapshot
          </span>
          <h2 id="snapshot-heading" className="mt-4 font-mono text-2xl font-semibold md:text-3xl">
            {SNAPSHOT.domain}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Externally verified backlink &amp; visibility profile · thresholds: 30+ strong, 15–30
            moderate, under 15 weak
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex size-28 flex-col items-center justify-center rounded-2xl border border-danger/40 bg-danger/10">
            <span className="font-mono text-4xl font-bold text-danger">
              {SNAPSHOT.domainAuthority}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              DA score
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-danger opacity-40 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
            </span>
            Weak authority
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Backlink profile
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric
            icon={<Link2 className="size-3.5" />}
            label="Backlinks"
            value={nf.format(SNAPSHOT.backlinks)}
          />
          <Metric
            icon={<ArrowUpRight className="size-3.5" />}
            label="Referring domains"
            value={nf.format(SNAPSHOT.referringDomains)}
          />
          <Metric
            icon={<ShieldAlert className="size-3.5" />}
            label="Referring pages"
            value={nf.format(SNAPSHOT.referringPages)}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Search className="size-3.5" />
            Organic keywords ranking
          </p>
          <p className="mt-1.5 font-mono text-3xl font-semibold text-warning">
            {SNAPSHOT.organicKeywords}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This site does not yet rank for any tracked keywords — an opportunity for SEO growth.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Organic traffic
          </p>
          <p className="mt-1.5 text-lg font-semibold">{SNAPSHOT.organicTraffic}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Authority of 0 and only 5 referring domains — essentially a new, unestablished site.
            Priority: foundational on-page SEO, content targeting local intent, and earning quality
            links.
          </p>
        </div>
      </div>
    </section>
  );
}
