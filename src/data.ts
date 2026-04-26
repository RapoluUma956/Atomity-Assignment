import type { Metric, DateRange } from "./tokens";

export interface BarDatum {
  label: string;
  value: number; // 0–100 percentage
}

export type Platform = "AWS" | "Azure" | "GCP" | "On-Prem";

// ── Seeded RNG ────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function rInt(lo: number, hi: number, rng: () => number) {
  return Math.round(lo + rng() * (hi - lo));
}

// ── Seeds ─────────────────────────────────────────────────────
const METRIC_SEED: Record<Metric, number> = {
  CPU: 10, GPU: 20, RAM: 30, PV: 40, Network: 50, Cloud: 60,
};
const DATE_OFFSET: Record<DateRange, number> = {
  Today: 0, "7d": 100, "30d": 200,
};
const PLATFORM_SEED: Record<Platform, number> = {
  AWS: 300, Azure: 400, GCP: 500, "On-Prem": 600,
};

// ── Overview chart — one bar per resource type ────────────────
export function getOverviewData(dateRange: DateRange): BarDatum[] {
  const metrics: Metric[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];
  return metrics.map((metric) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange]);
    return { label: metric, value: rInt(20, 92, rng) };
  });
}

// ── Drill chart — per cluster for a metric ────────────────────
const CLUSTER_ADJECTIVES = ["prod", "staging", "dev", "infra", "edge", "core"];
const CLUSTER_NOUNS      = ["alpha", "bravo", "delta", "echo", "falcon", "nova"];

function getClusterNames(metric: Metric): string[] {
  const rng   = makeRng(METRIC_SEED[metric] + 500);
  const count = rInt(4, 6, rng);
  return Array.from({ length: count }, (_, i) => {
    const adj  = CLUSTER_ADJECTIVES[i % CLUSTER_ADJECTIVES.length];
    const noun = CLUSTER_NOUNS[(i + 2) % CLUSTER_NOUNS.length];
    return `${adj}-${noun}`;
  });
}

export function getDrillData(metric: Metric, dateRange: DateRange): BarDatum[] {
  const names = getClusterNames(metric);
  return names.map((name, i) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange] + i * 37 + 999);
    return { label: name, value: rInt(15, 95, rng) };
  });
}

// ── Node names per platform ───────────────────────────────────
// Each platform has a random count of nodes (3–6), names are
// generated deterministically so they stay stable across renders.
function getNodeNames(platform: Platform): string[] {
  const rng   = makeRng(PLATFORM_SEED[platform] + 77);
  const count = rInt(3, 6, rng);
  return Array.from({ length: count }, (_, i) => `node-${i + 1}`);
}

// ── Platform → nodes chart ────────────────────────────────────
// x-axis: node names, y-axis: utilisation % for the given metric
export function getNodeData(
  platform: Platform,
  metric: Metric,
  dateRange: DateRange
): BarDatum[] {
  const names = getNodeNames(platform);
  return names.map((name, i) => {
    const rng = makeRng(
      PLATFORM_SEED[platform] + METRIC_SEED[metric] + DATE_OFFSET[dateRange] + i * 53
    );
    return { label: name, value: rInt(10, 95, rng) };
  });
}