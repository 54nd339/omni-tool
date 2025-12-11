import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-only app shell; all routes are static and offline-ready.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
