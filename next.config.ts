import type { NextConfig } from "next";
const repo = 'tiph';
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: `/${repo}/`,
  basePath: `/${repo}`,
};


export default nextConfig;
