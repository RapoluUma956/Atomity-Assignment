import type { Metric, DateRange } from "./tokens";
export type { Platform } from "./tokens";
import { PLATFORMS } from "./tokens";

export interface BarDatum {
  label: string;
  value: number;
}

const dataCache = new Map<string, BarDatum[]>();

export interface NodeInsights {
  node:        string;
  platform:    string;
  cpuUsage:    number; // millicores
  cpuRequest:  number;
  memUsageMiB: number;
  memRequestMiB: number;
  estimatedSavings: number; // $/mo
  optimizations: OptRow[];
}

export interface OptRow {
  namespace: string;
  workload:  string;
  issue:     string;
  savings:   number; // $/mo
}

// ── Seeded RNG ────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function rInt(lo: number, hi: number, rng: () => number) {
  return Math.round(lo + rng() * (hi - lo));
}

const METRIC_SEED: Record<Metric, number> = {
  CPU: 101, GPU: 503, RAM: 307, PV: 709, Network: 1013, Cloud: 1301,
};
const DATE_OFFSET: Record<DateRange, number> = {
  Today: 0, "7d": 1337, "30d": 7019,
};

const PLATFORM_SEED: Record<string, number> = Object.fromEntries(
  PLATFORMS.map((p) => {
    const base = p.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 0);
    return [p, (base * 6271 + 1) % 233280];
  })
);

const NAMESPACES = ["default", "kube-system", "monitoring", "ingress-nginx", "ml-serving", "data-pipeline"];
const WORKLOADS  = ["deploy/api-server", "sts/postgres", "deploy/redis", "ds/fluentd", "deploy/prometheus", "job/etl-runner"];
const ISSUES     = [
  { issue: "CPU over-requested",       savings_range: [60, 200]  as [number,number] },
  { issue: "Memory under-utilised",    savings_range: [30, 120]  as [number,number] },
  { issue: "Idle replica detected",    savings_range: [40, 180]  as [number,number] },
  { issue: "Orphaned PVC",             savings_range: [10, 60]   as [number,number] },
  { issue: "Over-provisioned node",    savings_range: [80, 300]  as [number,number] },
  { issue: "Unused load balancer",     savings_range: [20, 90]   as [number,number] },
];

// ── Overview chart — utilisation % per resource type ─────────
export function getOverviewData(dateRange: DateRange): BarDatum[] {
  const key = `overview-${dateRange}`;
  if (dataCache.has(key)) return dataCache.get(key)!;
  const metrics: Metric[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];
  const result = metrics.map((metric) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange]);
    return { label: metric, value: rInt(15, 95, rng) };
  });
  dataCache.set(key, result);
  return result;
}

// ── Node names per platform ───────────────────────────────────
function getNodeNames(platform: string): string[] {
  const base = PLATFORM_SEED[platform]
    ?? platform.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 0);
  const rng   = makeRng((base * 6271 + 1) % 233280);
  const count = rInt(3, 8, rng);
  return Array.from({ length: count }, (_, i) => `node-${i + 1}`);
}

// ── Node cost chart — x: nodes, y: $ cost ────────────────────
export function getNodeCostData(
  platform: string,
  dateRange: DateRange,
): BarDatum[] {
  const key = `nodes-${platform}-${dateRange}`;
  if (dataCache.has(key)) return dataCache.get(key)!;
  const names = getNodeNames(platform);
  const result = names.map((name, i) => {
    const rng = makeRng((PLATFORM_SEED[platform] * 3517 + DATE_OFFSET[dateRange] * 1193 + i * 7919 + 11) % 233280);
    return { label: name, value: rInt(500, 9500, rng) };
  });
  dataCache.set(key, result);
  return result;
}

// ── Node optimization insights ────────────────────────────────
export function getNodeInsights(
  platform: string,
  node: string,
  dateRange: DateRange,
): NodeInsights {
  const nodeIdx = parseInt(node.replace("node-", ""), 10) || 1;
  const rng = makeRng(PLATFORM_SEED[platform] + nodeIdx * 137 + DATE_OFFSET[dateRange]);

  const cpuRequest    = rInt(200, 1200, rng);
  const cpuUsage      = rInt(20, cpuRequest, rng);
  const memRequestMiB = rInt(512, 8192, rng);
  const memUsageMiB   = rInt(64, memRequestMiB, rng);
  const estimatedSavings = rInt(80, 800, rng);

  const rowCount = rInt(3, 5, rng);
  const optimizations: OptRow[] = Array.from({ length: rowCount }, (_, i) => {
    const tmpl = ISSUES[(nodeIdx + i * 2) % ISSUES.length];
    const r2   = makeRng(PLATFORM_SEED[platform] + nodeIdx * 37 + i * 19 + DATE_OFFSET[dateRange]);
    return {
      namespace: NAMESPACES[(nodeIdx + i) % NAMESPACES.length],
      workload:  WORKLOADS[(nodeIdx * 2 + i) % WORKLOADS.length],
      issue:     tmpl.issue,
      savings:   rInt(tmpl.savings_range[0], tmpl.savings_range[1], r2),
    };
  });

  return {
    node, platform,
    cpuUsage, cpuRequest,
    memUsageMiB, memRequestMiB,
    estimatedSavings, optimizations,
  };
}