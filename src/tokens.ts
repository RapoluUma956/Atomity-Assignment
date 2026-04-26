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

export const METRICS: Metric[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];
export const DATE_RANGES: DateRange[] = ["Today", "7d", "30d"];