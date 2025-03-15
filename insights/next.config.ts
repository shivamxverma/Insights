import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
},
};

export default nextConfig;
