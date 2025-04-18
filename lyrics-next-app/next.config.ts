import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/lyrics-next-app" : "",
  assetPrefix: isProd ? "/lyrics-next-app/" : "",
};

export default nextConfig;
