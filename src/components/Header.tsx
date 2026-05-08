import { DATE_RANGES } from "../tokens";
import type { DateRange, Theme } from "../tokens";

interface HeaderProps {
  dateRange: DateRange;
  onDateChange: (d: DateRange) => void;
  theme: Theme;
  onThemeToggle: () => void;
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
               M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function Header({ dateRange, onDateChange, theme, onThemeToggle }: HeaderProps) {
  return (
    <header
      role="banner"
      aria-label="Atomity application header"
      className="flex items-center justify-between px-7 py-4 sticky top-0 z-50 transition-colors duration-300 border-b"
      style={{
        background: "var(--color-bg-panel)",
        borderColor: "var(--color-border-panel)",
      }}
    >
      <span
        className="text-[1.05rem] font-bold tracking-[0.04em]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Atomity
      </span>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Date range pills */}
        <nav
          aria-label="Date range"
          aria-live="polite"
          className="flex rounded-lg p-[3px] gap-[2px]"
          style={{ background: "var(--color-bg-surface)" }}
        >
          {DATE_RANGES.map((d) => {
            const isActive = d === dateRange;
            return (
              <button
                key={d}
                id={`date-range-${d}`}
                onClick={() => onDateChange(d)}
                aria-pressed={isActive}
                className={`px-3.5 py-[5px] rounded-md border-none cursor-pointer text-[0.95rem]
                            font-[inherit] outline-none transition-all duration-200
                            ${isActive ? "font-semibold" : "font-normal"}
                           `}
                style={{
                  background: isActive ? "var(--color-accent)" : "transparent",
                  color: isActive ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                }}
                onFocus={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.outline = "2px solid var(--color-accent)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.outline = "none";
                }}
              >
                {d}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-px h-6" style={{ background: "var(--color-border)" }} />

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="flex items-center justify-center w-[34px] h-[34px] rounded-md border
                     cursor-pointer transition-colors duration-200"
          style={{
            background: "var(--color-bg-btn)",
            color: "var(--color-text-secondary)",
            borderColor: "var(--color-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-bg-btn-hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-bg-btn)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
          }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}