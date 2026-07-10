import fs from "node:fs";
import path from "node:path";

type SheetImageProps = {
  /** Public path, e.g. "/images/profile.png". */
  src: string;
  alt: string;
  /** Text shown on the blueprint placeholder before the real image exists. */
  placeholderLabel?: string;
  /** How the image fills its box. "cover" crops, "contain" fits whole. */
  fit?: "cover" | "contain";
  /** Add a solid white backing (useful for transparent PNGs). */
  whiteBackground?: boolean;
  /** Discourage casual download (no drag, no long-press save, overlay). */
  protect?: boolean;
};

/**
 * Server component. Renders the real photo at `src` if the file exists under
 * /public, otherwise a blueprint-styled placeholder. Drop a real image at the
 * same path and it takes over on the next refresh — no code changes, and no
 * broken-image flash in the meantime.
 */
export function SheetImage({
  src,
  alt,
  placeholderLabel = "IMAGE",
  fit = "cover",
  whiteBackground = false,
  protect = false,
}: SheetImageProps) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  const exists = fs.existsSync(filePath);

  if (exists) {
    // eslint-disable-next-line @next/next/no-img-element
    const image = (
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full ${
          fit === "contain" ? "object-contain" : "object-cover"
        } ${whiteBackground ? "bg-white" : ""} ${protect ? "no-save select-none" : ""}`}
      />
    );

    if (!protect) return image;

    // Transparent overlay sits above the image to intercept right-click /
    // long-press "save image" and drags. The image itself is non-interactive.
    return (
      <>
        {image}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 block select-none"
          style={{ WebkitTouchCallout: "none" }}
        />
      </>
    );
  }

  const patternId = `hatch-${placeholderLabel.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--blueline)_7%,var(--paper))]"
      role="img"
      aria-label={`${alt} — placeholder, image to be added`}
    >
      <svg
        className="absolute inset-0 h-full w-full text-hairline"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 12L12 0" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <line
          x1="100%"
          y1="0"
          x2="0"
          y2="100%"
          stroke="currentColor"
          strokeWidth="0.8"
        />
      </svg>
      <span className="relative z-10 mono-label bg-paper px-2 py-1 text-blueline">
        {placeholderLabel}
      </span>
    </div>
  );
}
