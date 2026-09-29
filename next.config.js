/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep verification builds separate from an active local development server.
  distDir:
    process.env.PORTFOLIO_VERIFY_BUILD === "1" ? ".next-verify" : ".next",
};

module.exports = nextConfig;
