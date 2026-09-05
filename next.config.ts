import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dominios externos permitidos para next/image (usados en AboutSection y HeroVideo).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // "motion" (Framer Motion) se distribuye sin transpilar; Next necesita
  // procesarlo explícitamente para que funcione en Server Components.
  transpilePackages: ["motion"],
};

export default nextConfig;
