export const tokens = {
  colors: {
    bg:           "var(--color-bg)",
    bgPanel:      "var(--color-bg-panel)",
    bgSurface:    "var(--color-bg-surface)",
    bgBtn:        "var(--color-bg-btn)",
    bgBtnHover:   "var(--color-bg-btn-hover)",
    accent:       "var(--color-accent)",
    accentDim:    "var(--color-accent-dim)",
    accentText:   "var(--color-accent-text)",
    border:       "var(--color-border)",
    borderPanel:  "var(--color-border-panel)",
    textPrimary:  "var(--color-text-primary)",
    textSecondary:"var(--color-text-secondary)",
    textMuted:    "var(--color-text-muted)",
    bar:          "var(--color-bar)",
    barHover:     "var(--color-bar-hover)",
    barBg:        "var(--color-bar-bg)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
  },
} as const;

export type Metric    = "CPU" | "GPU" | "RAM" | "PV" | "Network" | "Cloud";
export type DateRange = "Today" | "7d" | "30d";
export type Theme     = "dark" | "light";

// ── Add any new platform name here — color is auto-assigned ──
export const PLATFORMS = ["AWS", "Azure", "GCP", "On-Prem", "xyz"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const METRICS: Metric[]        = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];
export const DATE_RANGES: DateRange[] = ["Today", "7d", "30d"];

// ── Palette — cycles automatically for any number of platforms ─
const PLATFORM_COLOR_PALETTE: string[] = [
  "#FF9900", // amber   (AWS)
  "#0ea5e9", // sky     (Azure)
  "#60a5fa", // blue    (GCP)
  "#a78bfa", // violet  (On-Prem)
  "#f43f5e", // rose 
  "#34d399", // emerald
  "#fb923c", // orange
  "#e879f9", // fuchsia
  "#facc15", // yellow
  "#2dd4bf", // teal
  "#f87171", // red
  "#818cf8", // indigo
  "#4ade80", // green
  "#38bdf8", // light-blue
  "#c084fc", // purple
];

export const PLATFORM_META: Record<Platform, { color: string }> = Object.fromEntries(
  PLATFORMS.map((p, i) => [p, { color: PLATFORM_COLOR_PALETTE[i % PLATFORM_COLOR_PALETTE.length] }])
) as Record<Platform, { color: string }>;