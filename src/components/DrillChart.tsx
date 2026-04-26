// src/components/DrillChart.tsx
// Three view levels:
//   1. overview   — resource metrics (CPU, GPU, RAM, PV, Network, Cloud)
//   2. nodes      — per-node bars for a selected platform + metric
// Breadcrumb path and back / overview buttons sit at the bottom of the chart.

import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { tokens, METRICS } from "../tokens";
import type { Metric, DateRange, Platform } from "../tokens";
import { getOverviewData, getDrillData, getNodeData } from "../data";
import type { BarDatum } from "../data";

// ── Types ─────────────────────────────────────────────────────
type ViewLevel = "overview" | "metric" | "nodes";

interface DrillChartProps {
  dateRange:      DateRange;
  seedOffset:     number;
  isLoading:      boolean;
  activePlatform: Platform | null;
  // called when platform sidebar button changes breadcrumb
  onPathChange?:  (parts: string[]) => void;
}

// ── Custom tooltip ────────────────────────────────────────────
function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: tokens.colors.bgPanel,
        border: `1px solid ${tokens.colors.borderPanel}`,
        borderRadius: tokens.radius.md,
        padding: "7px 13px",
        fontSize: "0.78rem",
        color: tokens.colors.textPrimary,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ color: tokens.colors.textSecondary }}>{label}: </span>
      <span style={{ color: tokens.colors.accent, fontWeight: 600 }}>
        {payload[0].value}%
      </span>
    </div>
  );
}

// ── ChevronLeft icon ──────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ── BottomNav — back + overview buttons ──────────────────────
function BottomNav({
  onBack,
  onOverview,
}: {
  onBack: () => void;
  onOverview: () => void;
}) {
  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 14px",
    borderRadius: tokens.radius.md,
    fontSize: "0.78rem",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "background 0.18s ease, color 0.18s ease",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${tokens.colors.border}`,
      }}
    >
      <button
        onClick={onBack}
        style={{
          ...btnBase,
          background: tokens.colors.bgBtn,
          border: `1px solid ${tokens.colors.border}`,
          color: tokens.colors.textSecondary,
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
        <ChevronLeft /> back
      </button>

      <button
        onClick={onOverview}
        style={{
          ...btnBase,
          background: tokens.colors.accentDim,
          border: `1px solid color-mix(in srgb, ${tokens.colors.accent} 30%, transparent)`,
          color: tokens.colors.accent,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        ↩ overview
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function DrillChart({
  dateRange,
  seedOffset,
  isLoading,
  activePlatform,
}: DrillChartProps) {
  const [view, setView]               = useState<ViewLevel>("overview");
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [hoveredBar, setHoveredBar]   = useState<string | null>(null);
  const [chartData, setChartData]     = useState<BarDatum[]>([]);
  const [visible, setVisible]         = useState(true);

  // Track previous platform to detect changes
  const prevPlatformRef = useRef<Platform | null>(null);

  // ── Derive data for current view ──────────────────────────
  function currentData(): BarDatum[] {
    if (view === "overview")                         return getOverviewData(dateRange);
    if (view === "metric" && activeMetric)           return getDrillData(activeMetric, dateRange);
    if (view === "nodes" && activePlatform && activeMetric)
      return getNodeData(activePlatform, activeMetric, dateRange);
    return getOverviewData(dateRange);
  }

  // ── Animated swap helper ──────────────────────────────────
  function swapData(newData: BarDatum[]) {
    setVisible(false);
    setTimeout(() => {
      setChartData(newData);
      setVisible(true);
    }, 260);
  }

  // When view or dateRange changes → swap
  useEffect(() => {
    swapData(currentData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeMetric, dateRange, seedOffset]);

  // When activePlatform changes:
  // - if we're in nodes view, refresh the node chart for new platform
  // - if we're in overview, stay in overview (platform just highlights sidebar)
  useEffect(() => {
    if (prevPlatformRef.current === activePlatform) return;
    prevPlatformRef.current = activePlatform;

    if (activePlatform === null) {
      // platform deselected → back to overview
      setView("overview");
      setActiveMetric(null);
    } else if (view === "nodes" && activeMetric) {
      // already drilled → refresh nodes for new platform
      swapData(getNodeData(activePlatform, activeMetric, dateRange));
    }
    // overview or metric level: just update sidebar highlight, no chart change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlatform]);

  // ── Handle bar click ──────────────────────────────────────
  function handleBarClick(data: { activeLabel?: string }) {
    const label = data?.activeLabel;
    if (!label) return;

    if (view === "overview") {
      // overview bar clicked → go to metric drill (cluster names)
      if (METRICS.includes(label as Metric)) {
        setActiveMetric(label as Metric);
        setView("metric");
      }
    } else if (view === "metric" && activePlatform) {
      // metric drill bar clicked + platform selected → go to nodes
      setView("nodes");
    } else if (view === "metric" && !activePlatform) {
      // metric drill but no platform → hint in UI (handled via hint text)
    }
  }

  // ── Back one level ────────────────────────────────────────
  function handleBack() {
    if (view === "nodes") {
      setView("metric");
    } else if (view === "metric") {
      setView("overview");
      setActiveMetric(null);
    }
  }

  // ── Reset to overview ─────────────────────────────────────
  function handleOverview() {
    setView("overview");
    setActiveMetric(null);
  }

  // ── Breadcrumb parts ──────────────────────────────────────
  const breadcrumb: string[] = ["overview"];
  if (activePlatform && view !== "overview") breadcrumb.push(activePlatform);
  if (activeMetric && view !== "overview")   breadcrumb.push(activeMetric);
  if (view === "nodes")                      breadcrumb.push("nodes");

  // ── Section heading ───────────────────────────────────────
  function sectionLabel(): string {
    if (view === "overview") return "Unified overview — all clusters";
    if (view === "metric" && activeMetric)
      return `${activeMetric} — per cluster`;
    if (view === "nodes" && activePlatform && activeMetric)
      return `${activePlatform} · ${activeMetric} — per node`;
    return "";
  }

  // ── Hint text ─────────────────────────────────────────────
  function hintText(): string {
    if (view === "overview") return "click any bar to drill into clusters";
    if (view === "metric" && !activePlatform)
      return "select a platform on the left, then click a bar to see nodes";
    if (view === "metric" && activePlatform)
      return "click any bar to view nodes for " + activePlatform;
    if (view === "nodes") return "click any node to view optimization insights (Stage 3)";
    return "";
  }

  const showBottomNav = view !== "overview";

  return (
    <section
      style={{
        flex: 1,
        padding: "24px 28px 28px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Breadcrumb ────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
        <ol
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            listStyle: "none",
            fontSize: "0.78rem",
          }}
        >
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <li
                key={crumb}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: isLast ? tokens.colors.accent : tokens.colors.textMuted,
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {i > 0 && (
                  <span style={{ color: tokens.colors.textMuted, fontWeight: 400 }}>
                    /
                  </span>
                )}
                {crumb}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── Section label ─────────────────────────────────── */}
      <p
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: tokens.colors.textMuted,
          marginBottom: 18,
        }}
      >
        {sectionLabel()}
      </p>

      {/* ── Loading skeleton ──────────────────────────────── */}
      {isLoading && chartData.length === 0 ? (
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-end",
            height: 260,
            padding: "0 8px",
          }}
        >
          {[65, 42, 78, 35, 55, 70].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: tokens.radius.md,
                background: tokens.colors.barBg,
              }}
            />
          ))}
        </div>
      ) : (
        /* ── Chart ──────────────────────────────────────── */
        <div
          style={{
            flex: 1,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.26s ease, transform 0.26s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 26, right: 8, left: -20, bottom: 0 }}
              onClick={handleBarClick}
              style={{
                cursor:
                  view === "overview" ||
                  (view === "metric" && activePlatform)
                    ? "pointer"
                    : "default",
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke={tokens.colors.border}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: tokens.colors.textSecondary,
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                tick={{
                  fill: tokens.colors.textMuted,
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: tokens.colors.barBg }}
              />
              <Bar
                dataKey="value"
                radius={[5, 5, 0, 0]}
                maxBarSize={72}
                onMouseEnter={(data: { label?: string }) =>
                  setHoveredBar(data?.label ?? null)
                }
                onMouseLeave={() => setHoveredBar(null)}
                isAnimationActive
                animationDuration={550}
                animationEasing="ease-out"
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{
                    fill: tokens.colors.textSecondary,
                    fontSize: 11,
                    fontFamily: "inherit",
                  }}
                />
                {chartData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      hoveredBar === entry.label
                        ? tokens.colors.barHover
                        : tokens.colors.bar
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Hint text ─────────────────────────────────────── */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.72rem",
          color: tokens.colors.textMuted,
          marginTop: 12,
        }}
      >
        {hintText()}
      </p>

      {/* ── Bottom nav (back + overview) ─────────────────── */}
      {showBottomNav && (
        <BottomNav onBack={handleBack} onOverview={handleOverview} />
      )}
    </section>
  );
}