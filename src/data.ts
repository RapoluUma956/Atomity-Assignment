import type { Metric, DateRange } from "./tokens";
export type { Platform } from "./tokens";

export interface BarDatum {
  label: string;
  value: number;
}

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
  CPU: 10, GPU: 20, RAM: 30, PV: 40, Network: 50, Cloud: 60,
};
const DATE_OFFSET: Record<DateRange, number> = {
  Today: 0, "7d": 100, "30d": 200,
};
const PLATFORM_SEED: Record<string, number> = {
  AWS: 300, Azure: 400, GCP: 500, "On-Prem": 600,
};

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
  const metrics: Metric[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];
  return metrics.map((metric) => {
    const rng = makeRng(METRIC_SEED[metric] + DATE_OFFSET[dateRange]);
    return { label: metric, value: rInt(20, 92, rng) };
  });
}

// ── Node names per platform ───────────────────────────────────
function getNodeNames(platform: string): string[] {
  const rng   = makeRng(PLATFORM_SEED[platform] + 77);
  const count = rInt(3, 6, rng);
  return Array.from({ length: count }, (_, i) => `node-${i + 1}`);
}

// ── Node cost chart — x: nodes, y: $ cost ────────────────────
export function getNodeCostData(
  platform: string,
  dateRange: DateRange,
): BarDatum[] {
  const names = getNodeNames(platform);
  return names.map((name, i) => {
    const rng = makeRng(PLATFORM_SEED[platform] + DATE_OFFSET[dateRange] + i * 53 + 11);
    return { label: name, value: rInt(400, 4800, rng) };
  });
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