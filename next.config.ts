import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Fix pnpm symlink paths in standalone output so server.js ends up at the root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
