import { tokens, PLATFORMS, PLATFORM_META } from "../tokens";
import type { Platform } from "../tokens";

interface SidebarProps {
  activePlatform: Platform | null;
  onSelect: (p: Platform) => void;
}

export function Sidebar({ activePlatform, onSelect }: SidebarProps) {
  return (
    <aside
      role="navigation"
      aria-label="Cloud platform selector"
      style={{
        padding: "28px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: tokens.colors.textMuted,
          padding: "0 8px",
          marginBottom: 10,
        }}
      >
        Platforms
      </p>

      {PLATFORMS.map((platform) => {
        const isActive = activePlatform === platform;
        const { color } = PLATFORM_META[platform];

        return (
          <button
            key={platform}
            onClick={() => onSelect(platform)}
            aria-pressed={isActive}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "8px 10px",
              borderRadius: tokens.radius.md,
              border: isActive
                ? `1px solid color-mix(in srgb, ${color} 30%, transparent)`
                : "1px solid transparent",
              background: isActive
                ? `color-mix(in srgb, ${color} 10%, transparent)`
                : "transparent",
              color: isActive
                ? tokens.colors.textPrimary
                : tokens.colors.textSecondary,
              cursor: "pointer",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              fontWeight: isActive ? 600 : 400,
              textAlign: "left",
              transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = tokens.colors.bgSurface;
                (e.currentTarget as HTMLElement).style.color = tokens.colors.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = tokens.colors.textSecondary;
              }
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
                opacity: isActive ? 1 : 0.55,
                transition: "opacity 0.18s ease",
              }}
            />
            {platform}
          </button>
        );
      })}
    </aside>
  );
}