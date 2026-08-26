import { Activity, Clock, Files, Globe2, Info, MapPin, TrendingUp, Users } from "lucide-react";

import type { DomainTraffic } from "@/lib/traffic.functions";

const nf = new Intl.NumberFormat("en-US");

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

export function TrafficCard({ data }: { data: DomainTraffic }) {
  const noData = data.dataCoverage === "no_data";
  const partial = data.dataCoverage === "partial";
  const latest = data.monthlyVisits.at(-1);
  const trend = data.monthlyVisits.slice(-3);
  const peak = Math.max(1, ...trend.map((m) => m.visits));

  return (
    <section className="panel mt-6 rounded-2xl p-6 md:p-8" aria-labelledby="traffic-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Activity className="size-3.5 text-primary" />
            Live traffic panel
          </span>
          <h2 id="traffic-heading" className="mt-4 font-mono text-2xl font-semibold md:text-3xl">
            {data.domain}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Checked {new Date(data.checkedAt).toLocaleTimeString()} · coverage:{" "}
            <span className="font-medium">{data.dataCoverage}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Monthly visits {latest ? `· ${latest.month}` : ""}
          </p>
          <p className="mt-1 font-mono text-4xl font-bold text-gradient">
            {data.totalVisits === null ? "—" : nf.format(Math.round(data.totalVisits))}
          </p>
        </div>
      </div>

      {(noData || partial) && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">
            {noData
              ? "This site is too small to appear in traffic panel data yet — that's common for new or low-traffic sites."
              : "Only partial traffic data is available for this domain, so some figures below may be missing."}
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          icon={<Globe2 className="size-3.5" />}
          label="Global rank"
          value={data.rankGlobal === null ? "Not ranked" : `#${nf.format(data.rankGlobal)}`}
        />
        <Stat
          icon={<MapPin className="size-3.5" />}
          label={`Country rank${data.country ? ` · ${data.country}` : ""}`}
          value={data.countryRank === null ? "Not ranked" : `#${nf.format(data.countryRank)}`}
        />
        <Stat
          icon={<Users className="size-3.5" />}
          label="Bounce rate"
          value={data.bounceRate === null ? "—" : `${(data.bounceRate * 100).toFixed(1)}%`}
        />
        <Stat
          icon={<Files className="size-3.5" />}
          label="Pages / visit"
          value={data.pagesPerVisit === null ? "—" : data.pagesPerVisit.toFixed(2)}
        />
      </div>

      {(data.rankGlobal === null || data.countryRank === null) && !noData && (
        <p className="mt-3 text-xs text-muted-foreground">
          Missing ranks mean insufficient data for this domain, not zero traffic.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/40 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="size-3.5" />
            Visits trend (last 3 months)
          </h3>
          {trend.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No monthly history available.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {trend.map((m) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.month}</span>
                    <span className="font-mono font-semibold">{nf.format(m.visits)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, (m.visits / peak) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.timeOnSite !== null && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              Avg. time on site {Math.round(data.timeOnSite)}s
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top keywords
          </h3>
          {data.topKeywords.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No keyword data available for this domain yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {data.topKeywords.map((k) => (
                <li key={k.keyword} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate text-sm">{k.keyword}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {k.searchVolume === null ? "—" : `${nf.format(k.searchVolume)}/mo`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
