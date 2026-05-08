/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:         "#111113",
        "bg-panel": "#18181b",
        "bg-surface":"#1e1e23",
        "bg-btn":   "#27272a",
        "bg-btn-hover":"#3f3f46",
        accent:     "#2dd4bf",
        "accent-dim":"rgba(45,212,191,0.12)",
        "accent-text":"#111113",
        border:     "rgba(255,255,255,0.07)",
        "border-panel":"rgba(255,255,255,0.11)",
        "text-primary":"#ffffff",
        "text-secondary":"#d4d4d8",
        "text-muted":"#a1a1aa",
        bar:        "rgba(45,212,191,0.70)",
        "bar-hover":"#2dd4bf",
        "bar-bg":   "rgba(255,255,255,0.04)",
        /* light overrides — applied via .light class on <html> */
        "light-bg":          "#f4f4f5",
        "light-bg-panel":    "#ffffff",
        "light-bg-surface":  "#f1f1f3",
        "light-bg-btn":      "#e4e4e7",
        "light-bg-btn-hover":"#d4d4d8",
        "light-accent":      "#0d9488",
        "light-accent-dim":  "rgba(13,148,136,0.10)",
        "light-accent-text": "#ffffff",
        "light-border":      "rgba(0,0,0,0.07)",
        "light-border-panel":"rgba(0,0,0,0.10)",
        "light-text-primary":"#09090b",
        "light-text-secondary":"#27272a",
        "light-text-muted":  "#52525b",
        "light-bar":         "rgba(13,148,136,0.70)",
        "light-bar-hover":   "#0d9488",
        "light-bar-bg":      "rgba(0,0,0,0.04)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
      },
      fontFamily: {
        mono: ["'Geist Mono'", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      keyframes: {
        chartEnter: {
          from: { opacity: "0", transform: "translateY(80px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        panelRight: {
          from: { opacity: "0", transform: "translateX(100px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        panelLeft: {
          from: { opacity: "0", transform: "translateX(-100px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "chart-enter": "chartEnter 2s cubic-bezier(0.16,1,0.3,1) both",
        "panel-right": "panelRight 1.5s cubic-bezier(0.16,1,0.3,1) both",
        "panel-left":  "panelLeft 1.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};