import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DrillChart } from "./components/DrillChart";
import { useData } from "./hooks/useData";
import type { DateRange, Theme } from "./tokens";
import { tokens } from "./tokens";

export default function App() {
  const [theme, setTheme]         = useState<Theme>("dark");
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  // Cache key includes dateRange so each range fetches independently
  const cacheKey = `overview-${dateRange}`;
  const { seedOffset, status } = useData(cacheKey);
  const isLoading = status === "loading";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.colors.bg,
        transition: "background 0.3s ease",
      }}
    >
      <Header
        dateRange={dateRange}
        onDateChange={setDateRange}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Error banner — non-blocking, data still renders with fallback */}
        {status === "error" && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: "10px 16px",
              borderRadius: tokens.radius.md,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "rgba(239,68,68,0.9)",
              fontSize: "0.78rem",
            }}
          >
            Could not reach data API — showing locally generated data.
          </div>
        )}

        <DrillChart
          dateRange={dateRange}
          seedOffset={seedOffset}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}