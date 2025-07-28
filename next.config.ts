import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8761",
    API_URL: process.env.API_URL || "http://localhost:3000/api",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "", // Leave empty if no specific port
        pathname: "/PokeAPI/sprites/**", // Use ** to match any path within the domain
      },
    ],
  },
};

export default nextConfig;
