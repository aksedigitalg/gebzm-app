"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Sayfa değişince kısa bir overlay göster
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 80);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] bg-background"
      style={{
        animation: "overlayFadeOut 0.25s ease forwards",
      }}
    />
  );
}
