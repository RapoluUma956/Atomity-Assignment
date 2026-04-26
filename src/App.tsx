// src/App.tsx
// Layout: Header full-width on top.
// Body: sidebar pinned to left edge | chart fills remaining width.

import { useState, useEffect } from "react";
import { Header }     from "./components/Header";
import { Sidebar }    from "./components/Sidebar";
import { DrillChart } from "./components/DrillChart";
import { useData }    from "./hooks/useData";
import type { DateRange, Theme, Platform } from "./tokens";
import { tokens } from "./tokens";

export default function App() {
  const [theme, setTheme]                   = useState<Theme>("dark");
  const [dateRange, setDateRange]           = useState<DateRange>("30d");
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const { seedOffset, status } = useData(`overview-${dateRange}`);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.colors.bg,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s ease",
      }}
    >
      {/* ── Header — full width ── */}
      <Header
        dateRange={dateRange}
        onDateChange={setDateRange}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      {/* ── Body row: sidebar + main ── */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Sidebar — fixed left strip, full page height */}
        <div
          style={{
            width: 160,
            flexShrink: 0,
            background: tokens.colors.bgPanel,
            borderRight: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Sidebar
            activePlatform={activePlatform}
            onSelect={(p) =>
              setActivePlatform((prev) => (prev === p ? null : p))
            }
          />
        </div>

        {/* Main content — takes all remaining width */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "36px 32px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Non-blocking API error */}
          {status === "error" && (
            <div
              role="alert"
              style={{
                padding: "8px 14px",
                borderRadius: tokens.radius.md,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.85)",
                fontSize: "0.75rem",
              }}
            >
              API unavailable — showing locally generated data.
            </div>
          )}

          {/* Chart card — full width */}
          <div
            style={{
              background: tokens.colors.bgPanel,
              border: `1px solid ${tokens.colors.borderPanel}`,
              borderRadius: tokens.radius.xl,
              overflow: "hidden",
            }}
          >
            <DrillChart
              dateRange={dateRange}
              seedOffset={seedOffset}
              isLoading={status === "loading"}
              activePlatform={activePlatform}
            />
          </div>
        </main>
      </div>
    </div>
  );
}