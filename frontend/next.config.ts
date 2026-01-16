import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500/api',
  },
  images: {
    domains: ['localhost', 'next-js-and-typescript-project.onrender.com'],
  },
};

export default nextConfig;