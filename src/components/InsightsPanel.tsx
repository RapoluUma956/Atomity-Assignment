import type { Platform } from "../tokens";
import { getNodeInsights } from "../data";
import type { DateRange } from "../tokens";

interface InsightsPanelProps {
  node:      string;
  platform:  Platform;
  dateRange: DateRange;
  onBack:    () => void;
}

// ── Metric card ───────────────────────────────────────────────
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-4 rounded-lg border"
      style={{
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <span
        className="text-[0.8rem] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-[1.6rem] font-semibold leading-[1.2] font-[inherit]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Back chevron ──────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ── Main panel ────────────────────────────────────────────────
export function InsightsPanel({ node, platform, dateRange, onBack }: InsightsPanelProps) {
  const data = getNodeInsights(platform, node, dateRange);
  const breadcrumb = ["overview", platform, node];

  return (
    <section className="flex flex-col gap-[22px] px-7 pt-6 pb-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 list-none text-[0.9rem]">
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <li key={`${crumb}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: "var(--color-text-muted)" }}>/</span>}
                <span
                  style={{
                    color: isLast ? "var(--color-accent)" : "var(--color-text-muted)",
                    fontWeight: isLast ? 600 : 400,
                  }}
                >
                  {crumb}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Section label */}
      <p
        className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase -mt-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        {node} — optimization insights
      </p>

      {/* 4 metric cards */}
      <div className="insights-grid grid grid-cols-4 gap-3">
        <MetricCard label="CPU Usage"   value={`${data.cpuUsage}m`} />
        <MetricCard label="CPU Request" value={`${data.cpuRequest}m`} />
        <MetricCard label="Mem Usage"   value={`${data.memUsageMiB} MiB`} />
        <MetricCard label="Mem Request" value={`${(data.memRequestMiB / 1024).toFixed(1)} GiB`} />
      </div>

      {/* Estimated savings highlight */}
      <div
        className="flex items-center justify-between px-[18px] py-3 rounded-lg border"
        style={{
          background: "var(--color-accent-dim)",
          borderColor: `color-mix(in srgb, var(--color-accent) 30%, transparent)`,
        }}
      >
        <span
          className="text-[0.85rem] font-semibold tracking-[0.08em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Estimated savings
        </span>
        <span
          className="text-[1.5rem] font-bold"
          style={{ color: "var(--color-accent)" }}
        >
          ${data.estimatedSavings.toLocaleString()} / mo
        </span>
      </div>

      {/* Optimization table */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Table head */}
        <div
          className="insights-table-head grid gap-0 px-4 py-2 border-b"
          style={{
            gridTemplateColumns: "1fr 1.4fr 1.6fr 0.8fr",
            background: "var(--color-bg-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {["Namespace", "Workload", "Issue", "Savings / mo"].map((h) => (
            <span
              key={h}
              className="text-[0.8rem] font-semibold tracking-[0.09em] uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {data.optimizations.map((row, i) => (
          <div
            key={i}
            className="insights-table-row grid px-4 py-2.5 transition-colors duration-150"
            style={{
              gridTemplateColumns: "1fr 1.4fr 1.6fr 0.8fr",
              borderBottom: i < data.optimizations.length - 1
                ? "1px solid var(--color-border)"
                : "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-bg-surface)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span className="text-[0.9rem] font-[inherit]" style={{ color: "var(--color-text-muted)" }}>
              {row.namespace}
            </span>
            <span className="text-[0.9rem]" style={{ color: "var(--color-text-secondary)" }}>
              {row.workload}
            </span>
            <span className="text-[0.9rem]" style={{ color: "var(--color-text-primary)" }}>
              {row.issue}
            </span>
            <span className="text-[0.9rem] font-semibold" style={{ color: "var(--color-accent)" }}>
              ${row.savings}
            </span>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="mt-1">
        <button
          id="back-to-nodes-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border
                     cursor-pointer text-[0.9rem] font-[inherit] transition-colors duration-[180ms]"
          style={{
            background: "var(--color-bg-btn)",
            color: "var(--color-text-secondary)",
            borderColor: "var(--color-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-bg-btn-hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-bg-btn)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
          }}
        >
          <ChevronLeft /> back to {platform} nodes
        </button>
      </div>
    </section>
  );
}