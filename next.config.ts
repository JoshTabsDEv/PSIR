import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray lockfiles in parent folders are ignored.
  turbopack: {
    root: path.join(__dirname),
  },
  // DOCX templates are read from disk at request time via fs, which the
  // bundler cannot trace statically. Include them in the export functions.
  outputFileTracingIncludes: {
    "/api/reports/**": ["./templates/**/*"],
  },
};

export default nextConfig;
