import { tokens, DATE_RANGES } from "../tokens";
import type { DateRange, Theme } from "../tokens";

interface HeaderProps {
  dateRange: DateRange;
  onDateChange: (d: DateRange) => void;
  theme: Theme;
  onThemeToggle: () => void;
}

// Sun icon for light mode
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

// Moon icon for dark mode
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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        background: tokens.colors.bgPanel,
        borderBottom: `1px solid ${tokens.colors.borderPanel}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.3s ease",
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: tokens.colors.textPrimary,
        }}
      >
        Atomity
      </span>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Date range pills */}
        <nav
          aria-label="Date range"
          aria-live="polite"
          style={{
            display: "flex",
            background: tokens.colors.bgSurface,
            borderRadius: tokens.radius.lg,
            padding: 3,
            gap: 2,
          }}
        >
          {DATE_RANGES.map((d) => {
            const isActive = d === dateRange;
            return (
              <button
                key={d}
                onClick={() => onDateChange(d)}
                aria-pressed={isActive}
                style={{
                  padding: "5px 14px",
                  borderRadius: tokens.radius.md,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? tokens.colors.accent : "transparent",
                  color: isActive ? tokens.colors.accentText : tokens.colors.textSecondary,
                  transition: "background 0.2s ease, color 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.outline = `2px solid ${tokens.colors.accent}`;
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
        <div style={{ width: 1, height: 24, background: tokens.colors.border }} />

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.colors.border}`,
            background: tokens.colors.bgBtn,
            color: tokens.colors.textSecondary,
            cursor: "pointer",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = tokens.colors.bgBtnHover;
            (e.currentTarget as HTMLElement).style.color = tokens.colors.textPrimary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = tokens.colors.bgBtn;
            (e.currentTarget as HTMLElement).style.color = tokens.colors.textSecondary;
          }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}