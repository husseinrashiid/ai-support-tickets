import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.6"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
