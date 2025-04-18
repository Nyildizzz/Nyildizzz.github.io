const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? "/lyrics-next-app" : "",
  assetPrefix: isProd ? "/lyrics-next-app/" : "",
};

module.exports = nextConfig;