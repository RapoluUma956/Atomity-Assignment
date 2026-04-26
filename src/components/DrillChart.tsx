import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { tokens, METRICS } from "../tokens";
import type { Metric, DateRange } from "../tokens";
import { getOverviewData, getDrillData } from "../data";
import type { BarDatum } from "../data";

// ── Custom tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: tokens.colors.bgPanel,
      border: `1px solid ${tokens.colors.borderPanel}`,
      borderRadius: tokens.radius.md,
      padding: "8px 14px",
      fontSize: "0.8rem",
      color: tokens.colors.textPrimary,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <span style={{ color: tokens.colors.textSecondary }}>{label}: </span>
      <span style={{ color: tokens.colors.accent, fontWeight: 600 }}>
        {payload[0].value}%
      </span>
    </div>
  );
}

// ── Back chevron icon ──────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
}

// ── Props ──────────────────────────────────────────────────────
interface DrillChartProps {
  dateRange: DateRange;
  seedOffset: number; // from API fetch
  isLoading: boolean;
}

// ── Component ──────────────────────────────────────────────────
export function DrillChart({ dateRange, seedOffset, isLoading }: DrillChartProps) {
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [hoveredBar, setHoveredBar]     = useState<string | null>(null);
  const [chartData, setChartData]       = useState<BarDatum[]>([]);
  const [visible, setVisible]           = useState(true); // drives fade transition
  const prevDateRef = useRef(dateRange);

  // Derive current data based on drill level + dateRange
  const currentData = activeMetric
    ? getDrillData(activeMetric, dateRange)
    : getOverviewData(dateRange);

  // When dateRange changes, animate out → swap data → animate in
  useEffect(() => {
    if (prevDateRef.current === dateRange) return;
    prevDateRef.current = dateRange;
    setVisible(false);
    const t = setTimeout(() => {
      setChartData(currentData);
      setVisible(true);
    }, 260);
    return () => clearTimeout(t);
  }, [dateRange]); // eslint-disable-line

  // Initial population and metric drill changes
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setChartData(currentData);
      setVisible(true);
    }, activeMetric !== null || prevDateRef.current !== dateRange ? 260 : 0);
    return () => clearTimeout(t);
  }, [activeMetric, seedOffset]); // eslint-disable-line

  // Populate immediately on mount
  useEffect(() => {
    setChartData(currentData);
  }, []); // eslint-disable-line

  // Handle clicking a bar
  function handleBarClick(data: { activeLabel?: string }) {
    if (activeMetric) return; // already drilled, clicking does nothing at drill level
    const label = data?.activeLabel as Metric | undefined;
    if (label && METRICS.includes(label)) {
      setVisible(false);
      setTimeout(() => {
        setActiveMetric(label);
        setVisible(true);
      }, 280);
    }
  }

  // Handle back
  function handleBack() {
    setVisible(false);
    setTimeout(() => {
      setActiveMetric(null);
      setVisible(true);
    }, 280);
  }

  const isOverview = activeMetric === null;

  return (
    <section
      style={{
        background: tokens.colors.bgPanel,
        border: `1px solid ${tokens.colors.borderPanel}`,
        borderRadius: tokens.radius.xl,
        padding: "28px 32px 32px",
        animation: "fadeSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
      }}
      aria-label={isOverview ? "Unified overview chart" : `${activeMetric} per cluster chart`}
    >
      {/* ── Breadcrumb + back ─────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {!isOverview && (
          <button
            onClick={handleBack}
            aria-label="Back to overview"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.border}`,
              background: tokens.colors.bgBtn,
              color: tokens.colors.textSecondary,
              cursor: "pointer",
              fontSize: "0.78rem",
              fontFamily: "inherit",
              fontWeight: 500,
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
            <ChevronLeft />
            back
          </button>
        )}

        {/* Breadcrumb path */}
        <nav aria-label="Breadcrumb">
          <ol style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", fontSize: "0.8rem" }}>
            <li style={{ color: tokens.colors.textMuted }}>overview</li>
            {!isOverview && (
              <>
                <li style={{ color: tokens.colors.textMuted }}>/</li>
                <li style={{ color: tokens.colors.accent, fontWeight: 600 }}>{activeMetric}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* ── Section heading ───────────────────────────── */}
      <p style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tokens.colors.textMuted,
        marginBottom: 20,
      }}>
        {isOverview ? "Unified overview — all clusters" : `${activeMetric} — per cluster`}
      </p>

      {/* ── Loading skeleton ──────────────────────────── */}
      {isLoading && chartData.length === 0 ? (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 260, padding: "0 16px" }}>
          {[65, 42, 78, 35, 55, 70].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: tokens.radius.md,
                background: tokens.colors.barBg,
                animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      ) : (
        /* ── Chart ────────────────────────────────────── */
        <div
          className="chart-container"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 8, left: -20, bottom: 0 }}
              onClick={isOverview ? handleBarClick : undefined}
              style={{ cursor: isOverview ? "pointer" : "default" }}
            >
              <CartesianGrid
                vertical={false}
                stroke={tokens.colors.border}
                strokeDasharray="0"
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
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
                onMouseEnter={(data: { label?: string }) => setHoveredBar(data?.label ?? null)}
                onMouseLeave={() => setHoveredBar(null)}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {/* Percentage label on top of each bar */}
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
                {/* Per-cell coloring for hover */}
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

      {/* ── Bottom hint ───────────────────────────────── */}
      {/* <p style={{
        textAlign: "center",
        fontSize: "0.75rem",
        color: tokens.colors.textMuted,
        marginTop: 16,
      }}>
        {isOverview
          ? "click any bar to drill into clusters"
          : ""}
      </p> */}
    </section>
  );
}