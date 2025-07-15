import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

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
