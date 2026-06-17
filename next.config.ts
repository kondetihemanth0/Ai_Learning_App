import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
  cacheComponents: true,
  allowedDevOrigins: ['192.168.1.66'],
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
