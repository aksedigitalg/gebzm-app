import type { NextConfig } from "next";

// Her build'de yeni bir ID — PWA yenilenince onboarding tekrar gosterilir.
const BUILD_ID = Date.now().toString();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
};

export default nextConfig;
