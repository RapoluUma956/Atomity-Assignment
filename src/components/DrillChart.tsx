import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
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
    <div
      className="px-3.5 py-[7px] rounded-md text-[0.9rem] shadow-[0_8px_24px_rgba(0,0,0,0.35)] border"
      style={{
        background: "var(--color-bg-panel)",
        borderColor: "var(--color-border-panel)",
        color: "var(--color-text-primary)",
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}: </span>
      <span className="font-semibold" style={{ color: "var(--color-accent)" }}>{val}</span>
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
  dateRange: DateRange;
  seedOffset: number;
  isLoading: boolean;
  activePlatform: Platform | null;
  onNodeClick: (node: string, platform: Platform) => void;
}

// ── Component ─────────────────────────────────────────────────
export function DrillChart({
  dateRange, seedOffset, isLoading, activePlatform, onNodeClick,
}: DrillChartProps) {
  const view: "overview" | "nodes" = activePlatform ? "nodes" : "overview";
  const isDollar = view === "nodes";

  const chartData: BarDatum[] = activePlatform
    ? getNodeCostData(activePlatform, dateRange)
    : getOverviewData(dateRange);

  const [animationKey, setAnimationKey] = useState(1);
  const prevPlatformRef = useRef<Platform | null>(null);
  const prevDateRef = useRef<DateRange>(dateRange);

  useEffect(() => {
    const platformChanged = prevPlatformRef.current !== activePlatform;
    const dateChanged = prevDateRef.current !== dateRange;
    if (platformChanged || dateChanged) {
      setAnimationKey((k) => k + 1);
      prevPlatformRef.current = activePlatform;
      prevDateRef.current = dateRange;
    }
  }, [activePlatform, dateRange, seedOffset]);

  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const breadcrumb = activePlatform ? ["overview", activePlatform] : ["overview"];

  const sectionLabel = view === "overview"
    ? "Unified overview — all clusters"
    : `${activePlatform} — node cost overview`;

  const hintText = view === "overview"
    ? "select a platform on the left to view its nodes"
    : "click any node to view optimization insights";

  const yFormatter = isDollar
    ? (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
    : (v: number) => `${v}%`;

  return (
    <section
      aria-live="polite"
      aria-label={view === "overview" ? "Overview chart" : `${activePlatform} nodes chart`}
      className="flex flex-col px-7 pt-6 pb-7"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center gap-1.5 list-none text-[0.9rem]">
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <li key={`${crumb}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: "var(--color-text-muted)" }}>/</span>}
                <span
                  className="transition-colors duration-[350ms]"
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
        className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase mb-[18px] transition-opacity duration-[350ms]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {sectionLabel}
      </p>

      {/* Loading skeleton */}
      {isLoading && chartData.length === 0 ? (
        <div className="flex gap-5 items-end h-[300px]">
          {[65, 42, 78, 35, 55, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-md"
              style={{
                height: `${h}%`,
                background: "var(--color-bar-bg)",
              }}
            />
          ))}
        </div>
      ) : (
        <div key={animationKey} className="animate-chart-enter w-full overflow-x-auto pb-2">
          <div className="min-w-[600px]">
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
                tick={{ fill: tokens.colors.textSecondary, fontSize: 13, fontFamily: "inherit" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={yFormatter}
                tick={{ fill: tokens.colors.textMuted, fontSize: 12, fontFamily: "inherit" }}
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
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const label = props.label ?? props.name ?? props.tooltipPayload?.[0]?.payload?.label;
                  const isHovered = hoveredBar === label;
                  const isNodes = view === "nodes";

                  return (
                    <g>
                      <rect
                        x={x} y={y} width={width} height={height}
                        rx={5} ry={5}
                        fill={isHovered ? tokens.colors.barHover : tokens.colors.bar}
                      />
                      <foreignObject x={x} y={y} width={width} height={height}>
                        <button
                          // @ts-ignore
                          xmlns="http://www.w3.org/1999/xhtml"
                          tabIndex={0}
                          aria-label={
                            isNodes
                              ? `${label}, cost $${value?.toLocaleString()}, click to view optimization insights`
                              : `${label}, utilisation ${value}%`
                          }
                          onClick={() => {
                            if (isNodes && activePlatform && label) {
                              onNodeClick(label, activePlatform);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (isNodes && activePlatform && label) {
                                onNodeClick(label, activePlatform);
                              }
                            }
                          }}
                          onFocus={() => setHoveredBar(label)}
                          onBlur={() => setHoveredBar(null)}
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "transparent",
                            border: "none",
                            cursor: isNodes ? "pointer" : "default",
                            outline: "none",
                            display: "block",
                          }}
                          onFocusCapture={(e) => {
                            const rect = e.currentTarget.previousElementSibling as SVGRectElement;
                            if (rect) rect.setAttribute("stroke", tokens.colors.accent);
                            if (rect) rect.setAttribute("stroke-width", "2");
                          }}
                        />
                      </foreignObject>
                    </g>
                  );
                }}
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
        </div>
      )}

      {/* Hint */}
      <p
        className="text-center text-[0.88rem] mt-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        {hintText}
      </p>

      {/* Back button (nodes view) */}
      {view === "nodes" && (
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            id="back-to-overview-btn"
            onClick={() => onNodeClick("__back__", activePlatform!)}
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
            <ChevronLeft /> back to overview
          </button>
        </div>
      )}
    </section>
  );
}