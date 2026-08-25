import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUpRight, Download, MapPin, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const nf = new Intl.NumberFormat("en-US");
const cf = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

type Intent = "informational" | "commercial" | "transactional";

type Keyword = {
  keyword: string;
  volume: number;
  kd: number | null;
  cpc: number | null;
  competition: number | null;
  intent: Intent;
};

type SortKey = keyof Omit<Keyword, "intent">;
type SortDir = "asc" | "desc";

// Sourced from Google Ads keyword data (DataForSEO) — seed: "Paket Umrah", market: Indonesia.
const KEYWORDS: Keyword[] = [
  { keyword: "umroh berapa hari", volume: 14800, kd: 0, cpc: 0.18, competition: 0.03, intent: "informational" },
  { keyword: "harga umroh 2026", volume: 6600, kd: 0, cpc: 0.19, competition: 0.38, intent: "informational" },
  { keyword: "umroh berapa juta", volume: 2900, kd: 6, cpc: 0.17, competition: 0.17, intent: "informational" },
  { keyword: "paket umroh 2026", volume: 2400, kd: 5, cpc: 0.25, competition: 0.55, intent: "informational" },
  { keyword: "harga umroh 2 orang", volume: 1600, kd: 0, cpc: 0.17, competition: 0.24, intent: "informational" },
  { keyword: "paket umroh 2025", volume: 1300, kd: 0, cpc: 0.26, competition: 0.30, intent: "informational" },
  { keyword: "biaya umroh untuk 1 orang", volume: 880, kd: 0, cpc: 0.16, competition: 0.23, intent: "informational" },
  { keyword: "biaya umroh 2026 untuk 2 orang", volume: 720, kd: 0, cpc: 0.20, competition: 0.41, intent: "informational" },
  { keyword: "jadwal umroh 2026", volume: 590, kd: 0, cpc: null, competition: 0.24, intent: "informational" },
  { keyword: "biaya umroh untuk 4 orang", volume: 480, kd: 0, cpc: 0.12, competition: 0.19, intent: "informational" },
  { keyword: "harga umroh 2 orang 2026", volume: 480, kd: 0, cpc: 0.19, competition: 0.27, intent: "commercial" },
  { keyword: "biaya umroh 2 orang 2025", volume: 480, kd: 0, cpc: null, competition: 0.18, intent: "informational" },
  { keyword: "biaya umroh 2026 untuk 1 orang", volume: 480, kd: 0, cpc: 0.21, competition: 0.30, intent: "commercial" },
  { keyword: "harga tiket umroh 2026", volume: 480, kd: 0, cpc: 0.22, competition: 0.31, intent: "transactional" },
  { keyword: "paket umrah", volume: 390, kd: 74, cpc: null, competition: 0.45, intent: "commercial" },
  { keyword: "biaya umroh 2025 untuk 1 orang", volume: 390, kd: 0, cpc: null, competition: 0.33, intent: "informational" },
  { keyword: "biaya umroh 2 orang 2026", volume: 390, kd: 0, cpc: null, competition: 0.27, intent: "informational" },
  { keyword: "biaya umroh untuk 3 orang", volume: 320, kd: 0, cpc: 0.14, competition: 0.18, intent: "informational" },
  { keyword: "travel umroh surabaya terbaik", volume: 260, kd: 0, cpc: 0.18, competition: 0.35, intent: "informational" },
  { keyword: "paket umroh suami istri", volume: 210, kd: 0, cpc: 0.22, competition: 0.29, intent: "transactional" },
];

const totalVolume = KEYWORDS.reduce((sum, k) => sum + k.volume, 0);
const easyWins = KEYWORDS.filter((k) => (k.kd ?? 100) <= 20).length;
const buyerIntent = KEYWORDS.filter((k) => k.intent !== "informational").length;

const intentStyles: Record<Intent, string> = {
  informational: "border-border bg-background/60 text-muted-foreground",
  commercial: "border-warning/40 bg-warning/10 text-warning",
  transactional: "border-success/40 bg-success/10 text-success",
};

function difficultyTone(kd: number | null): string {
  if (kd === null) return "text-muted-foreground";
  if (kd <= 20) return "text-success";
  if (kd <= 50) return "text-warning";
  return "text-danger";
}

function difficultyLabel(kd: number | null): string {
  if (kd === null) return "—";
  if (kd <= 20) return "Easy";
  if (kd <= 50) return "Medium";
  return "Hard";
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
}) {
  const active = current.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1.5 ${active ? "text-foreground" : "text-muted-foreground"}`}
    >
      {label}
      <ArrowUpDown className={`size-3.5 transition-opacity ${active ? "opacity-100" : "opacity-40"}`} />
    </button>
  );
}

export function KeywordOpportunities() {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "volume", dir: "desc" });

  const sortedKeywords = useMemo(() => {
    const { key, dir } = sort;
    return [...KEYWORDS].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const mult = dir === "asc" ? 1 : -1;
      if (av === null && bv === null) return 0;
      if (av === null) return 1 * mult;
      if (bv === null) return -1 * mult;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * mult;
      return String(av).localeCompare(String(bv)) * mult;
    });
  }, [sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));
  }

  function exportCsv() {
    const header = ["Keyword", "Monthly Volume", "Keyword Difficulty", "CPC (USD)", "Competition", "Intent"];
    const rows = sortedKeywords.map((k) => [
      k.keyword,
      k.volume,
      k.kd ?? "—",
      k.cpc === null ? "—" : `$${k.cpc.toFixed(2)}`,
      k.competition === null ? "—" : cf.format(k.competition),
      k.intent,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, """)}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `paket-umrah-keyword-opportunities-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel mt-10 rounded-2xl p-6 md:p-8" aria-labelledby="keywords-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Target className="size-3.5 text-primary" />
            Keyword opportunities
          </span>
          <h2 id="keywords-heading" className="mt-4 text-2xl font-semibold md:text-3xl">
            Paket Umrah <span className="text-gradient">keyword landscape</span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Sourced from Google Ads keyword data for the seed term "Paket Umrah" · Market: Indonesia ·
            Top 20 by monthly search volume.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="gap-2 rounded-xl">
          <Download className="size-4" />
          Export keywords
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Addressable volume"
          value={`${nf.format(totalVolume)}/mo`}
          hint="Combined monthly searches across the top 20 terms"
        />
        <Stat
          label="Easy-difficulty wins"
          value={String(easyWins)}
          hint="Keywords with difficulty 0–20 (green zone)"
        />
        <Stat
          label="Buyer-intent terms"
          value={String(buyerIntent)}
          hint="Commercial or transactional queries"
        />
      </div>

      <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-5">
        <p className="flex items-start gap-2 text-sm">
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-success" />
          <span>
            <strong className="text-foreground">Insight:</strong>{" "}
            High-volume, low-difficulty terms like "umroh berapa hari"{" "}
            <span className="text-muted-foreground">(14.8K/mo)</span> and "harga umroh 2026"{" "}
            <span className="text-muted-foreground">(6.6K/mo)</span> represent strong content opportunities,
            while the exact-match term "paket umrah" is highly competitive{" "}
            <span className="text-danger">(difficulty 74)</span>.
          </span>
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>
                <SortHeader label="Keyword" sortKey="keyword" current={sort} onSort={toggleSort} />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Volume / mo" sortKey="volume" current={sort} onSort={toggleSort} />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Difficulty" sortKey="kd" current={sort} onSort={toggleSort} />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="CPC" sortKey="cpc" current={sort} onSort={toggleSort} />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Competition" sortKey="competition" current={sort} onSort={toggleSort} />
              </TableHead>
              <TableHead>Intent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedKeywords.map((k) => {
              const isLocal = k.keyword === "travel umroh surabaya terbaik";
              return (
                <TableRow key={k.keyword} className={`border-border ${isLocal ? "bg-primary/5" : ""}`}>
                  <TableCell className="font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      {k.keyword}
                      {isLocal && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          <MapPin className="size-3" />
                          Local
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{nf.format(k.volume)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-semibold ${difficultyTone(k.kd)}`}>
                      {k.kd ?? "—"}
                    </span>
                    {k.kd !== null && (
                      <span className="ml-2 text-[11px] text-muted-foreground">{difficultyLabel(k.kd)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {k.cpc === null ? "—" : `$${k.cpc.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {k.competition === null ? "—" : cf.format(k.competition)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${intentStyles[k.intent]}`}
                    >
                      {k.intent}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: Click any column header to sort. Volume is sorted descending by default.
      </p>
    </section>
  );
}
