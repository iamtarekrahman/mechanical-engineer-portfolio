import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tarekrahman.vercel.app"),
  alternates: { canonical: "/" },
  title: "Tarek Rahman — Assistant Mechanical Engineer",
  description:
    "Portfolio of Tarek Rahman, Assistant Mechanical Engineer working on submittal review for water treatment infrastructure. Uttara, Dhaka, Bangladesh.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    url: "/",
    title: "Tarek Rahman — Assistant Mechanical Engineer",
    description:
      "Submittal review, equipment compliance, and mechanical engineering. Based in Uttara, Dhaka, Bangladesh.",
    type: "website",
    images: [
      {
        url: "/og.png",
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
    images: ["/og.png"],
  },
};

/**
 * Applies the saved (or system) theme before first paint to avoid a flash.
 * Sets data-theme="light" | "dark" on <html>.
 */
const themeScript = `
(function () {
  var mode = 'system';
  try {
    var stored = localStorage.getItem('theme');
    mode = stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch (e) {}
  var dark = mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
