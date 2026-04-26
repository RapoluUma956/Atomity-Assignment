import type { Metric, DateRange } from "./tokens";

export interface BarDatum {
  label: string;
  value: number; // 0–100 percentage
}

// Lightweight seeded RNG — stable across re-renders
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

// Seed varies by metric + date so each combination produces unique data
const METRIC_SEED: Record<Metric, number> = {
  CPU: 10, GPU: 20, RAM: 30, PV: 40, Network: 50, Cloud: 60,
};
const DATE_OFFSET: Record<DateRange, number> = {
  Today: 0, "7d": 100, "30d": 200,
};

const OVERVIEW_LABELS: Metric[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];

// Overview chart — one bar per resource type
export function getOverviewData(dateRange: DateRange): BarDatum[] {
  return OVERVIEW_LABELS.map((metric) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange]);
    return { label: metric, value: rInt(20, 92, rng) };
  });
}

// Cluster names — randomly generated, stable per seed
const CLUSTER_ADJECTIVES = ["prod", "staging", "dev", "infra", "edge", "core", "data", "ml"];
const CLUSTER_NOUNS      = ["alpha", "bravo", "delta", "echo", "falcon", "hydra", "nova", "prime"];

function getClusterNames(metric: Metric): string[] {
  const rng = makeRng(METRIC_SEED[metric] + 500);
  const count = rInt(4, 6, rng);
  const names: string[] = [];
  const usedAdj  = new Set<number>();
  const usedNoun = new Set<number>();
  for (let i = 0; i < count; i++) {
    let ai = rInt(0, CLUSTER_ADJECTIVES.length - 1, rng);
    let ni = rInt(0, CLUSTER_NOUNS.length - 1, rng);
    // avoid duplicates
    while (usedAdj.has(ai))  ai = (ai + 1) % CLUSTER_ADJECTIVES.length;
    while (usedNoun.has(ni)) ni = (ni + 1) % CLUSTER_NOUNS.length;
    usedAdj.add(ai); usedNoun.add(ni);
    names.push(`${CLUSTER_ADJECTIVES[ai]}-${CLUSTER_NOUNS[ni]}`);
  }
  return names;
}

// Drill-down chart — one bar per cluster for the selected metric
export function getDrillData(metric: Metric, dateRange: DateRange): BarDatum[] {
  const names = getClusterNames(metric);
  return names.map((name, i) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange] + i * 37 + 999);
    return { label: name, value: rInt(15, 95, rng) };
  });
}