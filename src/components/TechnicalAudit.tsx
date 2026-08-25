import { AlertTriangle, EyeOff, Info, Wrench } from "lucide-react";

type Severity = "critical" | "warning" | "info";

type Finding = {
  title: string;
  severity: Severity;
  page: string;
  detail: string;
  fix: string;
};

// Sourced from the Open SEO site audit of https://www.sultanharamaingresik.com/ (2 pages crawled).
const CRAWL = { pagesCrawled: 2, issues: 3 };

const FINDINGS: Finding[] = [
  {
    title: "Page is set to noindex",
    severity: "critical",
    page: "/",
    detail:
      "A robots noindex directive tells Google to keep the page out of search results entirely. This alone explains the 0 ranking keywords and 0 authority — the site is invisible to search.",
    fix: "Remove the noindex meta tag / X-Robots-Tag header, then request indexing in Search Console.",
  },
  {
    title: "Missing H1 heading",
    severity: "warning",
    page: "/",
    detail:
      "The page has no single top-level heading, so search engines have no clear signal about its main topic.",
    fix: 'Add one H1 describing the core offer, e.g. "Paket Umrah dan Haji Gresik — Sultan Haramain".',
  },
  {
    title: "Meta description too short",
    severity: "info",
    page: "/",
    detail:
      "A very short description wastes snippet space and reduces click-through from the results page.",
    fix: "Write a 140–160 character description covering Umrah/Haji packages, Gresik location, and a reason to choose the agency.",
  },
];

const severityStyles: Record<Severity, { chip: string; border: string; icon: React.ReactNode }> = {
  critical: {
    chip: "border-danger/40 bg-danger/10 text-danger",
    border: "border-danger/40 bg-danger/5",
    icon: <EyeOff className="size-4 text-danger" />,
  },
  warning: {
    chip: "border-warning/40 bg-warning/10 text-warning",
    border: "border-warning/30 bg-warning/5",
    icon: <AlertTriangle className="size-4 text-warning" />,
  },
  info: {
    chip: "border-border bg-background/60 text-muted-foreground",
    border: "border-border bg-background/40",
    icon: <Info className="size-4 text-muted-foreground" />,
  },
};

export function TechnicalAudit() {
  return (
    <section className="panel mt-10 rounded-2xl p-6 md:p-8" aria-labelledby="audit-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Wrench className="size-3.5 text-primary" />
            Technical audit
          </span>
          <h2 id="audit-heading" className="mt-4 text-2xl font-semibold md:text-3xl">
            On-page <span className="text-gradient">blockers</span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Crawl of www.sultanharamaingresik.com · {CRAWL.pagesCrawled} pages ·{" "}
            {CRAWL.issues} issues found
          </p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {FINDINGS.map((f, i) => {
          const s = severityStyles[f.severity];
          return (
            <li key={f.title} className={`rounded-xl border p-5 ${s.border}`}>
              <div className="flex flex-wrap items-center gap-3">
                {s.icon}
                <h3 className="text-base font-semibold">
                  {i + 1}. {f.title}
                </h3>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${s.chip}`}
                >
                  {f.severity}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{f.page}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-primary">Fix: </span>
                <span className="text-muted-foreground">{f.fix}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
