import type { NextConfig } from "next";

// Her build'de yeni bir ID — PWA yenilenince onboarding tekrar gosterilir.
const BUILD_ID = Date.now().toString();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  // Tarayıcı/telefon Router Cache süresi.
  // static=0: ISR sayfalarına her navigasyonda sunucudan taze veri gelir.
  // dynamic=0: force-dynamic sayfalar zaten 0, bu açıkça belirtir.
  experimental: {
    staleTimes: {
      static: 0,
      dynamic: 0,
    },
  },
};

export default nextConfig;
