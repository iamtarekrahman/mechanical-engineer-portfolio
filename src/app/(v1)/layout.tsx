import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Newsreader,
  IBM_Plex_Mono,
  Special_Elite,
} from "next/font/google";
import "@/legacy/v1/globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const typewriter = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${display.variable} ${body.variable} ${mono.variable} ${typewriter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
