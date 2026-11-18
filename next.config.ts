import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["node:sqlite"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      const prevExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      config.externals = [...prevExternals, "node:sqlite"];
    }
    return config;
  },
};

export default nextConfig;
