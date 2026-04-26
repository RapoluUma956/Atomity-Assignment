import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { tokens } from "../tokens";
import type { DateRange, Platform } from "../tokens";
import { getOverviewData, getNodeCostData } from "../data";
import type { BarDatum } from "../data";

// ── Tooltip ───────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDollar }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  isDollar: boolean;
}) {
  if (!active || !payload?.length) return null;
  const val = isDollar
    ? `$${payload[0].value.toLocaleString()}`
    : `${payload[0].value}%`;
  return (
    <div style={{
      background: tokens.colors.bgPanel,
      border: `1px solid ${tokens.colors.borderPanel}`,
      borderRadius: tokens.radius.md,
      padding: "7px 13px",
      fontSize: "0.78rem",
      color: tokens.colors.textPrimary,
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    }}>
      <span style={{ color: tokens.colors.textSecondary }}>{label}: </span>
      <span style={{ color: tokens.colors.accent, fontWeight: 600 }}>{val}</span>
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

// ── Props ─────────────────────────────────────────────────────
interface DrillChartProps {
  dateRange:      DateRange;
  seedOffset:     number;
  isLoading:      boolean;
  activePlatform: Platform | null;
  onNodeClick:    (node: string, platform: Platform) => void;
}

// ── Component ─────────────────────────────────────────────────
export function DrillChart({
  dateRange, seedOffset, isLoading, activePlatform, onNodeClick,
}: DrillChartProps) {
  const view: "overview" | "nodes" = activePlatform ? "nodes" : "overview";
  const isDollar = view === "nodes";

  // Compute data immediately — no deferred swap
  const chartData: BarDatum[] = activePlatform
    ? getNodeCostData(activePlatform, dateRange)
    : getOverviewData(dateRange);

  // animationKey forces React to remount the chart wrapper,
  // replaying the CSS entrance animation cleanly on every change.
  const [animationKey, setAnimationKey] = useState(1);
  const prevPlatformRef = useRef<Platform | null>(null);
  const prevDateRef     = useRef<DateRange>(dateRange);

  useEffect(() => {
    const platformChanged = prevPlatformRef.current !== activePlatform;
    const dateChanged     = prevDateRef.current !== dateRange;
    if (platformChanged || dateChanged) {
      setAnimationKey((k) => k + 1);
      prevPlatformRef.current = activePlatform;
      prevDateRef.current     = dateRange;
    }
  }, [activePlatform, dateRange, seedOffset]);

  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Breadcrumb
  const breadcrumb = activePlatform
    ? ["overview", activePlatform]
    : ["overview"];

  const sectionLabel = view === "overview"
    ? "Unified overview — all clusters"
    : `${activePlatform} — node cost overview`;

  const hintText = view === "overview"
    ? "select a platform on the left to view its nodes"
    : "click any node to view optimization insights";

  const yFormatter = isDollar
    ? (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
    : (v: number) => `${v}%`;

  const labelFormatter = isDollar
    ? (v: number) => `$${v.toLocaleString()}`
    : (v: number) => `${v}%`;

  return (
    <section style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb — always visible, transitions via color */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
        <ol style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", fontSize: "0.78rem" }}>
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <li key={`${crumb}-${i}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: tokens.colors.textMuted }}>/</span>}
                <span style={{
                  color: isLast ? tokens.colors.accent : tokens.colors.textMuted,
                  fontWeight: isLast ? 600 : 400,
                  transition: "color 0.35s ease",
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
        marginBottom: 18,
        transition: "opacity 0.35s ease",
      }}>
        {sectionLabel}
      </p>

      {/* Loading skeleton */}
      {isLoading && chartData.length === 0 ? (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 300 }}>
          {[65, 42, 78, 35, 55, 70].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`,
              borderRadius: tokens.radius.md,
              background: tokens.colors.barBg,
            }} />
          ))}
        </div>
      ) : (
        /*
          key={animationKey} causes React to fully remount this div
          on every platform/date change, replaying .anim-chart-enter
          from scratch — clean entrance, no flicker, no data flash.
        */
        <div
          key={animationKey}
          className="anim-chart-enter"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 26, right: 12, left: 10, bottom: 0 }}
              onClick={
                view === "nodes"
                  ? (data) => {
                      const label = data?.activeLabel;
                      if (label && activePlatform) onNodeClick(label, activePlatform);
                    }
                  : undefined
              }
              style={{ cursor: view === "nodes" ? "pointer" : "default" }}
            >
              <CartesianGrid vertical={false} stroke={tokens.colors.border} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tokens.colors.textSecondary, fontSize: 12, fontFamily: "inherit" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={yFormatter}
                tick={{ fill: tokens.colors.textMuted, fontSize: 11, fontFamily: "inherit" }}
                width={56}
              />
              <Tooltip
                content={<CustomTooltip isDollar={isDollar} />}
                cursor={{ fill: tokens.colors.barBg }}
              />
              <Bar
                dataKey="value"
                radius={[5, 5, 0, 0]}
                maxBarSize={80}
                onMouseEnter={(d: { label?: string }) => setHoveredBar(d?.label ?? null)}
                onMouseLeave={() => setHoveredBar(null)}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={hoveredBar === entry.label ? tokens.colors.barHover : tokens.colors.bar}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hint */}
      <p style={{
        textAlign: "center",
        fontSize: "0.72rem",
        color: tokens.colors.textMuted,
        marginTop: 12,
      }}>
        {hintText}
      </p>

      {/* Back button — nodes view only */}
      {view === "nodes" && (
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}>
          <button
            onClick={() => onNodeClick("__back__", activePlatform!)}
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
            <ChevronLeft /> back to overview
          </button>
        </div>
      )}
    </section>
  );
}