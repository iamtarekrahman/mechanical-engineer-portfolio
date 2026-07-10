import { Certification } from "@/data/content";

type MarkKey = Certification["mark"];

/**
 * Simple monochrome line-art marks used as placeholders for issuer logos.
 * These are abstract engineering-style glyphs, not real brand logos — the
 * real brand SVGs can be swapped in later. Drawn in currentColor so callers
 * control ink vs. blueline.
 */
export function IssuerMark({
  mark,
  className = "",
}: {
  mark: MarkKey;
  className?: string;
}) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (mark) {
    case "khalifa":
      // Safety / risk: shield with a checkmark
      return (
        <svg {...common}>
          <path d="M16 3l10 4v7c0 6.5-4.3 11-10 13-5.7-2-10-6.5-10-13V7l10-4z" />
          <path d="M11.5 16.2l3 3 6-6.5" />
        </svg>
      );
    case "colorado":
      // Renewable: sun over mountains
      return (
        <svg {...common}>
          <circle cx="16" cy="12" r="4" />
          <path d="M16 4v2M24 12h2M6 12h2M22 6l-1.4 1.4M11.4 7.4L10 6" />
          <path d="M4 26l7-8 4 5 3-4 6 7" />
        </svg>
      );
    case "dtu":
      // Wind: turbine
      return (
        <svg {...common}>
          <path d="M16 16V28" />
          <circle cx="16" cy="16" r="1.6" />
          <path d="M16 16L16 5M16 16l9.5 5.5M16 16L6.5 21.5" />
        </svg>
      );
    case "autodesk":
      // Drafting: compass / triangle
      return (
        <svg {...common}>
          <path d="M16 4l10 22H6L16 4z" />
          <path d="M16 4v22" />
          <circle cx="16" cy="4" r="1.4" />
        </svg>
      );
    case "dassault":
      // CAD solid: isometric cube
      return (
        <svg {...common}>
          <path d="M16 4l10 5.6v12.8L16 28 6 22.4V9.6L16 4z" />
          <path d="M6 9.6l10 5.6 10-5.6M16 15.2V28" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="6" y="6" width="20" height="20" rx="1" />
          <path d="M11 16h10M16 11v10" />
        </svg>
      );
  }
}
