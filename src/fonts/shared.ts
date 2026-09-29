import localFont from "next/font/local";

// Both versions use these exact bundled faces; no build-time font downloads.
export const Fraunces = localFont({
  src: [
    { path: "./fraunces-latin-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fraunces-latin-italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const IBM_Plex_Mono = localFont({
  src: [
    { path: "./ibm-plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./ibm-plex-mono-latin-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});
