import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` — Vercel handles this automatically
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Prisma to work in serverless/edge deployments
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Vercel-compatible build settings
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
