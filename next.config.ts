import type { NextConfig } from "next";

const replitDomain = process.env.REPLIT_DEV_DOMAIN ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.riker.replit.dev",
    "*.picard.replit.dev",
    "*.replit.dev",
    "*.repl.co",
    ...(replitDomain ? [replitDomain, `*.${replitDomain.split('.').slice(1).join('.')}`] : []),
  ],
};

export default nextConfig;
