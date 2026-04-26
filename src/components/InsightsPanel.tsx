import { tokens } from "../tokens";
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
    <div style={{
      background: tokens.colors.bgSurface,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: tokens.radius.lg,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tokens.colors.textMuted,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "1.3rem",
        fontWeight: 600,
        color: tokens.colors.textPrimary,
        fontFamily: "inherit",
        lineHeight: 1.2,
      }}>
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

  // Breadcrumb: overview / platform / node
  const breadcrumb = ["overview", platform, node];

  return (
    <section style={{ padding: "24px 28px 32px", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", fontSize: "0.78rem" }}>
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <li key={`${crumb}-${i}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: tokens.colors.textMuted }}>/</span>}
                <span style={{
                  color: isLast ? tokens.colors.accent : tokens.colors.textMuted,
                  fontWeight: isLast ? 600 : 400,
                }}>
                  {crumb}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Section label */}
      <p style={{
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tokens.colors.textMuted,
        marginTop: -12,
      }}>
        {node} — optimization insights
      </p>

      {/* 4 metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="CPU Usage"    value={`${data.cpuUsage}m`} />
        <MetricCard label="CPU Request"  value={`${data.cpuRequest}m`} />
        <MetricCard label="Mem Usage"    value={`${data.memUsageMiB} MiB`} />
        <MetricCard label="Mem Request"  value={`${(data.memRequestMiB / 1024).toFixed(1)} GiB`} />
      </div>

      {/* Estimated savings highlight */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        background: tokens.colors.accentDim,
        border: `1px solid color-mix(in srgb, ${tokens.colors.accent} 30%, transparent)`,
        borderRadius: tokens.radius.lg,
      }}>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tokens.colors.textMuted,
        }}>
          Estimated savings
        </span>
        <span style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: tokens.colors.accent,
        }}>
          ${data.estimatedSavings.toLocaleString()} / mo
        </span>
      </div>

      {/* Optimization table */}
      <div style={{
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.lg,
        overflow: "hidden",
      }}>
        {/* Table head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1.6fr 0.8fr",
          padding: "8px 16px",
          background: tokens.colors.bgSurface,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}>
          {["Namespace", "Workload", "Issue", "Savings / mo"].map((h) => (
            <span key={h} style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: tokens.colors.textMuted,
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {data.optimizations.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1.6fr 0.8fr",
              padding: "10px 16px",
              borderBottom: i < data.optimizations.length - 1
                ? `1px solid ${tokens.colors.border}`
                : "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = tokens.colors.bgSurface;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span style={{ fontSize: "0.78rem", color: tokens.colors.textMuted, fontFamily: "inherit" }}>
              {row.namespace}
            </span>
            <span style={{ fontSize: "0.78rem", color: tokens.colors.textSecondary }}>
              {row.workload}
            </span>
            <span style={{ fontSize: "0.78rem", color: tokens.colors.textPrimary }}>
              {row.issue}
            </span>
            <span style={{ fontSize: "0.78rem", color: tokens.colors.accent, fontWeight: 600 }}>
              ${row.savings}
            </span>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div style={{ marginTop: 4 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.colors.border}`,
            background: tokens.colors.bgBtn,
            color: tokens.colors.textSecondary,
            cursor: "pointer",
            fontSize: "0.78rem",
            fontFamily: "inherit",
            transition: "background 0.18s ease, color 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = tokens.colors.bgBtnHover;
            (e.currentTarget as HTMLElement).style.color = tokens.colors.textPrimary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = tokens.colors.bgBtn;
            (e.currentTarget as HTMLElement).style.color = tokens.colors.textSecondary;
          }}
        >
          <ChevronLeft /> back to {platform} nodes
        </button>
      </div>
    </section>
  );
}