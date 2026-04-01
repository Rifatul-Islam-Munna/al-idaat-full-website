import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        unoptimized:true
    },
    reactCompiler: true,
  output: "standalone",
};

export default nextConfig;
