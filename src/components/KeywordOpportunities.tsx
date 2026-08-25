import { Download, Target } from "lucide-react";

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

type Keyword = {
  keyword: string;
  volume: number;
  kd: number | null;
  cpc: number | null;
  intent: "informational" | "commercial" | "transactional";
  cluster: "Umrah" | "Haji";
};

// Sourced from Open SEO keyword research — market: Indonesia (2360) / Bahasa Indonesia.
const KEYWORDS: Keyword[] = [
  { keyword: "harga umroh 2026", volume: 6600, kd: 0, cpc: 0.19, intent: "informational", cluster: "Umrah" },
  { keyword: "biaya haji plus 2026", volume: 6600, kd: 0, cpc: 0.33, intent: "informational", cluster: "Haji" },
  { keyword: "umroh berapa juta", volume: 2900, kd: 6, cpc: 0.17, intent: "informational", cluster: "Umrah" },
  { keyword: "biaya haji furoda", volume: 2900, kd: 0, cpc: 0.24, intent: "informational", cluster: "Haji" },
  { keyword: "biaya haji reguler 2026", volume: 2900, kd: 0, cpc: 0.22, intent: "commercial", cluster: "Haji" },
  { keyword: "paket umroh 2026", volume: 2400, kd: 5, cpc: 0.25, intent: "informational", cluster: "Umrah" },
  { keyword: "biaya haji 2026 terbaru kemenag", volume: 1900, kd: 0, cpc: 0.27, intent: "commercial", cluster: "Haji" },
  { keyword: "biaya haji plus untuk 2 orang", volume: 1300, kd: 0, cpc: 0.3, intent: "commercial", cluster: "Haji" },
  { keyword: "biaya umroh untuk 1 orang", volume: 880, kd: 0, cpc: 0.16, intent: "informational", cluster: "Umrah" },
  { keyword: "daftar haji plus", volume: 880, kd: 0, cpc: 0.78, intent: "informational", cluster: "Haji" },
  { keyword: "biaya umroh 2026 untuk 2 orang", volume: 720, kd: 0, cpc: 0.2, intent: "informational", cluster: "Umrah" },
  { keyword: "jadwal umroh 2026", volume: 590, kd: 0, cpc: null, intent: "informational", cluster: "Umrah" },
  { keyword: "harga tiket umroh 2026", volume: 480, kd: 0, cpc: 0.22, intent: "transactional", cluster: "Umrah" },
  { keyword: "perbedaan haji plus dan furoda", volume: 390, kd: 0, cpc: 0.49, intent: "informational", cluster: "Haji" },
  { keyword: "masa tunggu haji plus 2026", volume: 260, kd: 5, cpc: 0.24, intent: "informational", cluster: "Haji" },
  { keyword: "travel umroh surabaya terbaik", volume: 260, kd: 0, cpc: 0.18, intent: "informational", cluster: "Umrah" },
  { keyword: "paket umroh suami istri", volume: 210, kd: 0, cpc: 0.22, intent: "transactional", cluster: "Umrah" },
  { keyword: "paket haji plus", volume: 210, kd: 0, cpc: 0.52, intent: "commercial", cluster: "Haji" },
  { keyword: "travel haji plus terbaik", volume: 170, kd: 0, cpc: 0.48, intent: "commercial", cluster: "Haji" },
  { keyword: "paket umroh murah 10 juta", volume: 110, kd: 0, cpc: 0.22, intent: "commercial", cluster: "Umrah" },
  { keyword: "paket umroh vip", volume: 110, kd: null, cpc: 0.42, intent: "commercial", cluster: "Umrah" },
  { keyword: "paket umroh keluarga", volume: 90, kd: 0, cpc: 0.21, intent: "commercial", cluster: "Umrah" },
  { keyword: "paket haji furoda", volume: 70, kd: 13, cpc: 0.16, intent: "commercial", cluster: "Haji" },
  { keyword: "travel haji furoda terpercaya", volume: 30, kd: 0, cpc: 0.38, intent: "commercial", cluster: "Haji" },
];

const totalVolume = KEYWORDS.reduce((sum, k) => sum + k.volume, 0);
const easyWins = KEYWORDS.filter((k) => (k.kd ?? 100) <= 10).length;
const buyerIntent = KEYWORDS.filter((k) => k.intent !== "informational").length;

const intentStyles: Record<Keyword["intent"], string> = {
  informational: "border-border bg-background/60 text-muted-foreground",
  commercial: "border-warning/40 bg-warning/10 text-warning",
  transactional: "border-success/40 bg-success/10 text-success",
};

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function KeywordOpportunities() {
  function exportCsv() {
    const header = ["Keyword", "Cluster", "Monthly Volume", "Difficulty", "CPC (USD)", "Intent"];
    const rows = KEYWORDS.map((k) => [
      k.keyword,
      k.cluster,
      k.volume,
      k.kd ?? "n/a",
      k.cpc ?? "n/a",
      k.intent,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-opportunities-sultanharamaingresik-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
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
            Umrah &amp; Haji <span className="text-gradient">target keywords</span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Market: Indonesia · Bahasa Indonesia · researched via Open SEO. The client ranks for none
            of these today — each row is unclaimed demand.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="gap-2">
          <Download className="size-4" />
          Export keywords
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Addressable volume"
          value={`${nf.format(totalVolume)}/mo`}
          hint="Combined monthly searches across the shortlist"
        />
        <Stat
          label="Low-difficulty wins"
          value={String(easyWins)}
          hint="Keywords with difficulty 10 or below"
        />
        <Stat
          label="Buyer-intent terms"
          value={String(buyerIntent)}
          hint="Commercial or transactional queries"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Cluster</TableHead>
              <TableHead className="text-right">Volume / mo</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead>Intent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {KEYWORDS.map((k) => (
              <TableRow key={k.keyword}>
                <TableCell className="font-medium">{k.keyword}</TableCell>
                <TableCell className="text-muted-foreground">{k.cluster}</TableCell>
                <TableCell className="text-right font-mono">{nf.format(k.volume)}</TableCell>
                <TableCell className="text-right font-mono">{k.kd ?? "—"}</TableCell>
                <TableCell className="text-right font-mono">
                  {k.cpc === null ? "—" : `$${k.cpc.toFixed(2)}`}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${intentStyles[k.intent]}`}
                  >
                    {k.intent}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
