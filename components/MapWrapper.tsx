"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Harita yükleniyor...
    </div>
  ),
});

export default function MapWrapper({ focusSlug }: { focusSlug?: string }) {
  return <MapView focusSlug={focusSlug} />;
}
