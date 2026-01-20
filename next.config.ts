import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    APP_NAME: process.env.APP_NAME,
    APP_DESCRIPTION: process.env.APP_DESCRIPTION,
  },
};

export default nextConfig;
