import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DrillChart } from "./components/DrillChart";
import { InsightsPanel } from "./components/InsightsPanel";
import { useData } from "./hooks/useData";
import type { DateRange, Theme, Platform } from "./tokens";

interface SelectedNode { node: string; platform: Platform; }

type AnimDir = "enter" | "from-right" | "from-left";

const ANIM_CLASS: Record<AnimDir, string> = {
  "enter":      "animate-chart-enter",
  "from-right": "animate-panel-right",
  "from-left":  "animate-panel-left",
};

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [animDir, setAnimDir] = useState<AnimDir>("enter");
  const [panelKey, setPanelKey] = useState(0);

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
    if (node === "__back__") {
      setActivePlatform(null);
      setSelectedNode(null);
      nextPanel("enter");
      return;
    }
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
    <div className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: "var(--color-bg)" }}>

      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="absolute -top-[999px] -left-[999px] px-5 py-2.5 rounded-md font-semibold text-sm z-[999]
                   focus:top-3 focus:left-3 transition-all duration-200"
        style={{
          background: "var(--color-accent)",
          color: "var(--color-accent-text)",
        }}
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header
        dateRange={dateRange}
        onDateChange={handleDateChange}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      {/* Body */}
      <div className="layout-body flex flex-1">

        {/* Sidebar */}
        <div
          className="layout-sidebar w-40 shrink-0 border-r"
          style={{
            background: "var(--color-bg-panel)",
            borderColor: "var(--color-border)",
          }}
        >
          <Sidebar activePlatform={activePlatform} onSelect={handlePlatformSelect} />
        </div>

        {/* Main */}
        <main
          id="main-content"
          className="layout-main flex-1 min-w-0 px-8 pt-9 pb-16 flex flex-col gap-3.5 overflow-hidden"
        >
          {status === "error" && (
            <div
              role="alert"
              className="px-3.5 py-2 rounded-md text-xs border"
              style={{
                background: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.85)",
              }}
            >
              API unavailable — showing locally generated data.
            </div>
          )}

          <div
            key={panelKey}
            className={`${ANIM_CLASS[animDir]} rounded-xl overflow-hidden border`}
            style={{
              background: "var(--color-bg-panel)",
              borderColor: "var(--color-border-panel)",
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