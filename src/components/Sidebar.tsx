import { PLATFORMS, PLATFORM_META } from "../tokens";
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
      className="flex flex-col gap-1 px-2.5 py-7"
    >
      {/* Label */}
      <p
        className="text-[0.82rem] font-semibold tracking-[0.1em] uppercase px-2 mb-2.5"
        style={{ color: "var(--color-text-muted)" }}
      >
        Platforms
      </p>

      {PLATFORMS.map((platform) => {
        const isActive = activePlatform === platform;
        const { color } = PLATFORM_META[platform];
        return (
          <button
            key={platform}
            id={`platform-btn-${platform}`}
            onClick={() => onSelect(platform)}
            aria-pressed={isActive}
            aria-current={isActive ? "page" : undefined}
            className="flex items-center gap-[9px] w-full px-2.5 py-2 rounded-md
                       cursor-pointer text-[0.95rem] font-[inherit] text-left
                       transition-all duration-[180ms]"
            style={{
              border: isActive
                ? `1px solid color-mix(in srgb, ${color} 30%, transparent)`
                : "1px solid transparent",
              background: isActive
                ? `color-mix(in srgb, ${color} 10%, transparent)`
                : "transparent",
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-secondary)",
              fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = "var(--color-bg-surface)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
              }
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0 transition-opacity duration-[180ms]"
              style={{
                background: color,
                opacity: isActive ? 1 : 0.55,
              }}
            />
            {platform}
          </button>
        );
      })}
    </aside>
  );
}