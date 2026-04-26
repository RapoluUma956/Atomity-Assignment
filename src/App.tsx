import { useState, useEffect } from "react";
import { Header }         from "./components/Header";
import { Sidebar }        from "./components/Sidebar";
import { DrillChart }     from "./components/DrillChart";
import { InsightsPanel }  from "./components/InsightsPanel";
import { useData }        from "./hooks/useData";
import type { DateRange, Theme, Platform } from "./tokens";
import { tokens } from "./tokens";

interface SelectedNode {
  node:     string;
  platform: Platform;
}

export default function App() {
  const [theme, setTheme]                   = useState<Theme>("dark");
  const [dateRange, setDateRange]           = useState<DateRange>("30d");
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [selectedNode, setSelectedNode]     = useState<SelectedNode | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const { seedOffset, status } = useData(`overview-${dateRange}`);

  // When platform changes, clear selected node
  function handlePlatformSelect(p: Platform) {
    setActivePlatform((prev) => (prev === p ? null : p));
    setSelectedNode(null);
  }

  // Node bar clicked → show insights
  function handleNodeClick(node: string, platform: Platform) {
    setSelectedNode({ node, platform });
  }

  // Back from insights → return to node chart
  function handleBackFromInsights() {
    setSelectedNode(null);
  }

  // Show insights panel if a node is selected, otherwise show chart
  const showInsights = selectedNode !== null;

  return (
    <div style={{
      minHeight: "100vh",
      background: tokens.colors.bg,
      display: "flex",
      flexDirection: "column",
      transition: "background 0.3s ease",
    }}>
      {/* Header — full width */}
      <Header
        dateRange={dateRange}
        onDateChange={(d) => { setDateRange(d); setSelectedNode(null); }}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      {/* Body */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Sidebar — left strip */}
        <div style={{
          width: 160,
          flexShrink: 0,
          background: tokens.colors.bgPanel,
          borderRight: `1px solid ${tokens.colors.border}`,
        }}>
          <Sidebar
            activePlatform={activePlatform}
            onSelect={handlePlatformSelect}
          />
        </div>

        {/* Main content */}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: "36px 32px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}>
          {/* API error — non-blocking */}
          {status === "error" && (
            <div role="alert" style={{
              padding: "8px 14px",
              borderRadius: tokens.radius.md,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "rgba(239,68,68,0.85)",
              fontSize: "0.75rem",
            }}>
              API unavailable — showing locally generated data.
            </div>
          )}

          {/* Card — swaps between chart and insights */}
          <div style={{
            background: tokens.colors.bgPanel,
            border: `1px solid ${tokens.colors.borderPanel}`,
            borderRadius: tokens.radius.xl,
            overflow: "hidden",
            animation: "fadeSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {showInsights ? (
              <InsightsPanel
                node={selectedNode!.node}
                platform={selectedNode!.platform}
                dateRange={dateRange}
                onBack={handleBackFromInsights}
              />
            ) : (
              <DrillChart
                dateRange={dateRange}
                seedOffset={seedOffset}
                isLoading={status === "loading"}
                activePlatform={activePlatform}
                onNodeClick={handleNodeClick}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}