import type { NextConfig } from "next";

export const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/projects/plai-landing-page", destination: "/projects/plai", permanent: true },
    ];
  },
};

// Next.js only reads the config from the default export.
export default config;
