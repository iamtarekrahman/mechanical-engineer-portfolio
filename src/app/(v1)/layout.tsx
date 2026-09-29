import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces as display, IBM_Plex_Mono as mono } from "@/fonts/shared";
import "@/legacy/v1/globals.css";

const Newsreader = localFont({
  src: [
    { path: "../../fonts/newsreader-latin-normal.woff2", weight: "300 600", style: "normal" },
    { path: "../../fonts/newsreader-latin-italic.woff2", weight: "300 600", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
});

const Special_Elite = localFont({
  src: "../../fonts/special-elite-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-typewriter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tarekrahman.vercel.app"),
  alternates: { canonical: "/v1" },
  title: "Tarek Rahman — Assistant Mechanical Engineer",
  description:
    "Portfolio of Tarek Rahman, Assistant Mechanical Engineer working on submittal review for water treatment infrastructure. Uttara, Dhaka, Bangladesh.",
  icons: {
    icon: [
      { url: "/v1/favicon.svg", type: "image/svg+xml" },
      { url: "/v1/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/v1/favicon.svg" }],
  },
  openGraph: {
    url: "/v1",
    title: "Tarek Rahman — Assistant Mechanical Engineer",
    description:
      "Submittal review, equipment compliance, and mechanical engineering. Based in Uttara, Dhaka, Bangladesh.",
    type: "website",
    images: [
      {
        url: "/v1/og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Tarek Rahman — Assistant Mechanical Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarek Rahman — Assistant Mechanical Engineer",
    description:
      "Submittal review, equipment compliance, and mechanical engineering.",
    images: ["/v1/og.png"],
  },
};

/**
 * Applies the saved (or system) theme before first paint to avoid a flash.
 * Sets data-theme="light" | "dark" on <html>.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var mode = stored || 'system';
    var dark = mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${Newsreader.variable} ${mono.variable} ${Special_Elite.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
