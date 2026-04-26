import { useState, useEffect } from "react";
import { Header }        from "./components/Header";
import { Sidebar }       from "./components/Sidebar";
import { DrillChart }    from "./components/DrillChart";
import { InsightsPanel } from "./components/InsightsPanel";
import { useData }       from "./hooks/useData";
import type { DateRange, Theme, Platform } from "./tokens";
import { tokens } from "./tokens";

interface SelectedNode { node: string; platform: Platform; }


type AnimDir = "enter" | "from-right" | "from-left";

const ANIM_CLASS: Record<AnimDir, string> = {
  "enter":      "anim-chart-enter",
  "from-right": "anim-panel-right",
  "from-left":  "anim-panel-left",
};

export default function App() {
  const [theme, setTheme]                   = useState<Theme>("dark");
  const [dateRange, setDateRange]           = useState<DateRange>("30d");
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [selectedNode, setSelectedNode]     = useState<SelectedNode | null>(null);
  const [animDir, setAnimDir]               = useState<AnimDir>("enter");
  // panelKey forces remount → restarts CSS animation on every stage switch
  const [panelKey, setPanelKey]             = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const { seedOffset, status } = useData(`overview-${dateRange}`);

  function nextPanel(dir: AnimDir) {
    setAnimDir(dir);
    setPanelKey((k) => k + 1);
  }

  function handlePlatformSelect(p: Platform) {
    setActivePlatform((prev) => (prev === p ? null : p));
    setSelectedNode(null);
    nextPanel("enter");
  }

  function handleNodeClick(node: string, platform: Platform) {
    // Back signal from DrillChart back button
    if (node === "__back__") {
      setActivePlatform(null);
      setSelectedNode(null);
      nextPanel("enter");
      return;
    }
    // Forward: go to insights
    setSelectedNode({ node, platform });
    nextPanel("from-right");
  }

  function handleBackFromInsights() {
    setSelectedNode(null);
    nextPanel("from-left");
  }

  function handleDateChange(d: DateRange) {
    setDateRange(d);
    setSelectedNode(null);
    nextPanel("enter");
  }

  const showInsights = selectedNode !== null;

  return (
    <div style={{
      minHeight: "100vh",
      background: tokens.colors.bg,
      display: "flex",
      flexDirection: "column",
      transition: "background 0.3s ease",
    }}>
      {/* Header */}
      <Header
        dateRange={dateRange}
        onDateChange={handleDateChange}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      {/* Body */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Sidebar */}
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

        {/* Main */}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: "36px 32px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          // clip so sliding panels don't overflow during animation
          overflow: "hidden",
        }}>
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

          {/*
            key={panelKey} → remounts the card on every stage change
            className     → picks the right entrance animation
            overflow hidden → clips the slide so nothing bleeds outside
          */}
          <div
            key={panelKey}
            className={ANIM_CLASS[animDir]}
            style={{
              background: tokens.colors.bgPanel,
              border: `1px solid ${tokens.colors.borderPanel}`,
              borderRadius: tokens.radius.xl,
              overflow: "hidden",
            }}
          >
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