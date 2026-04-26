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
function CustomTooltip({
  active, payload, label, isDollar,
}: {
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

interface DrillChartProps {
  dateRange:      DateRange;
  seedOffset:     number;
  isLoading:      boolean;
  activePlatform: Platform | null;
  onNodeClick:    (node: string, platform: Platform) => void;
}

export function DrillChart({
  dateRange,
  seedOffset,
  isLoading,
  activePlatform,
  onNodeClick,
}: DrillChartProps) {
  const [chartData,   setChartData]   = useState<BarDatum[]>([]);
  const [hoveredBar,  setHoveredBar]  = useState<string | null>(null);
  const [visible,     setVisible]     = useState(true);
  const prevPlatformRef               = useRef<Platform | null>(null);

  const view: "overview" | "nodes" = activePlatform ? "nodes" : "overview";
  const isDollar = view === "nodes";

  function currentData(): BarDatum[] {
    if (activePlatform) return getNodeCostData(activePlatform, dateRange);
    return getOverviewData(dateRange);
  }

  function swapData(next: BarDatum[]) {
    setVisible(false);
    setTimeout(() => { setChartData(next); setVisible(true); }, 260);
  }

  // Re-fetch on deps change
  useEffect(() => {
    swapData(currentData());
  }, [view, dateRange, seedOffset]); // eslint-disable-line

  // Platform change
  useEffect(() => {
    if (prevPlatformRef.current === activePlatform) return;
    prevPlatformRef.current = activePlatform;
    swapData(currentData());
  }, [activePlatform]); // eslint-disable-line

  // Initial mount
  useEffect(() => { setChartData(currentData()); }, []); // eslint-disable-line

  // Breadcrumb
  const breadcrumb: string[] = ["overview"];
  if (activePlatform) breadcrumb.push(activePlatform);

  const sectionLabel = view === "overview"
    ? "Unified overview — all clusters"
    : `${activePlatform} — node cost overview`;

  const hintText = view === "overview"
    ? "select a platform on the left to view its nodes"
    : "click any node to view optimization insights";

  // Y-axis formatter
  const yFormatter = isDollar
    ? (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
    : (v: number) => `${v}%`;

  // Label formatter
  const labelFormatter = isDollar
    ? (v: number) => `$${v.toLocaleString()}`
    : (v: number) => `${v}%`;

  return (
    <section style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb */}
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
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.26s ease, transform 0.26s cubic-bezier(0.16,1,0.3,1)",
        }}>
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
                animationDuration={550}
                animationEasing="ease-out"
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={labelFormatter}
                  style={{ fill: tokens.colors.textSecondary, fontSize: 11, fontFamily: "inherit" }}
                />
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
    </section>
  );
}