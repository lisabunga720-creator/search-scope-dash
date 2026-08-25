import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpRight,
  Download,
  Link2,
  Search,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { checkDomainMetrics, type DomainMetrics } from "@/lib/metrics.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Backlink Research Dashboard | Domain Authority Checker" },
      {
        name: "description",
        content:
          "Agency-grade backlink research: check domain authority, referring domains and spam score, track a session history and export CSV reports.",
      },
      { property: "og:title", content: "Backlink Research Dashboard" },
      {
        property: "og:description",
        content:
          "Check domain authority and backlink metrics, compare domains and export client-ready CSV reports.",
      },
    ],
  }),
  component: Dashboard,
});

type Tier = { label: string; tone: "success" | "warning" | "danger" };

function tierFor(da: number): Tier {
  if (da > 30) return { label: "Strong", tone: "success" };
  if (da >= 15) return { label: "Moderate", tone: "warning" };
  return { label: "Weak", tone: "danger" };
}

const toneText = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

const toneBg = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

const toneChip = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
} as const;

function StatusDot({ tone }: { tone: Tier["tone"] }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={`absolute inset-0 rounded-full ${toneBg[tone]} opacity-40 animate-ping`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${toneBg[tone]}`} />
    </span>
  );
}

const nf = new Intl.NumberFormat("en-US");

function Dashboard() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<DomainMetrics | null>(null);
  const [history, setHistory] = useState<DomainMetrics[]>([]);

  const check = useServerFn(checkDomainMetrics);
  const mutation = useMutation({
    mutationFn: (value: string) => check({ data: { domain: value } }),
    onSuccess: (result) => {
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setCurrent(result);
      setHistory((prev) => [result, ...prev.filter((r) => r.domain !== result.domain)].slice(0, 50));
      setError(null);
    },
    onError: () => setError("That doesn't look like a valid domain. Try example.com"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Enter a domain to check.");
      return;
    }
    mutation.mutate(domain.trim());
  }

  function exportCsv() {
    const header = [
      "Domain",
      "Domain Authority",
      "Status",
      "Backlinks",
      "Referring Domains",
      "Spam Score",
      "Organic Keywords",
      "Checked At",
    ];
    const rows = history.map((r) => [
      r.domain,
      r.domainAuthority,
      tierFor(r.domainAuthority).label,
      r.backlinks,
      r.referringDomains,
      `${r.spamScore}%`,
      r.organicKeywords,
      new Date(r.checkedAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `backlink-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tier = current ? tierFor(current.domainAuthority) : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Link2 className="size-3.5 text-primary" />
            Agency Toolkit
          </span>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Backlink <span className="text-gradient">Research</span> Dashboard
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Audit any domain's authority profile, stack results side by side, and export a
            client-ready CSV in one click.
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-semibold">{history.length}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            domains this session
          </p>
        </div>
      </header>

      <section className="panel mt-10 rounded-2xl p-5 md:p-6">
        <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              aria-label="Domain name"
              className="h-13 rounded-xl border-border bg-background/60 pl-11 font-mono text-base placeholder:text-muted-foreground/70"
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-13 rounded-xl px-7 text-sm font-semibold shadow-[var(--shadow-glow)]"
          >
            {mutation.isPending ? "Checking…" : "Check Metrics"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </section>

      {mutation.isPending && (
        <section className="panel mt-6 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-6">
            <Skeleton className="size-28 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {current && tier && !mutation.isPending && (
        <section className="panel mt-6 rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-7">
            <div className="relative flex size-28 flex-col items-center justify-center rounded-2xl border border-border bg-background/50">
              <span className={`font-mono text-4xl font-bold ${toneText[tier.tone]}`}>
                {current.domainAuthority}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                DA score
              </span>
            </div>
            <div className="min-w-56 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-mono text-2xl font-semibold">{current.domain}</h2>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneChip[tier.tone]}`}
                >
                  <StatusDot tone={tier.tone} />
                  {tier.label}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Checked {new Date(current.checkedAt).toLocaleTimeString()} · thresholds: 30+ strong,
                15–30 moderate, under 15 weak
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat
                  icon={<Link2 className="size-3.5" />}
                  label="Backlinks"
                  value={nf.format(current.backlinks)}
                />
                <Stat
                  icon={<ArrowUpRight className="size-3.5" />}
                  label="Ref. domains"
                  value={nf.format(current.referringDomains)}
                />
                <Stat
                  icon={<ShieldAlert className="size-3.5" />}
                  label="Dofollow links"
                  value={nf.format(current.dofollowBacklinks)}
                />
                <Stat
                  icon={<TrendingUp className="size-3.5" />}
                  label="Dofollow refs"
                  value={nf.format(current.dofollowRefDomains)}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="panel mt-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:px-6">
          <div>
            <h2 className="text-lg font-semibold">Session history</h2>
            <p className="text-xs text-muted-foreground">
              Every domain checked in this session, newest first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setHistory([])}
              disabled={history.length === 0}
              className="rounded-xl"
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={history.length === 0}
              className="rounded-xl"
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No domains checked yet — run your first lookup above.
          </p>
        ) : (
          <div className="overflow-x-auto p-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">DA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Backlinks</TableHead>
                  <TableHead className="text-right">Ref. domains</TableHead>
                  <TableHead className="text-right">Spam</TableHead>
                  <TableHead className="text-right">Checked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => {
                  const t = tierFor(row.domainAuthority);
                  return (
                    <TableRow key={row.domain} className="border-border">
                      <TableCell className="font-mono">{row.domain}</TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${toneText[t.tone]}`}>
                        {row.domainAuthority}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneChip[t.tone]}`}
                        >
                          <span className={`size-1.5 rounded-full ${toneBg[t.tone]}`} />
                          {t.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {nf.format(row.backlinks)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {nf.format(row.referringDomains)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {row.spamScore}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(row.checkedAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}
