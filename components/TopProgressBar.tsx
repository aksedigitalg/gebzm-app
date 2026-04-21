"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Tıklandığı anda bar başlasın — sayfa gelince tamamlansın
export function TopProgressBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const startBar = () => {
    clearAll();
    setVisible(true);
    setWidth(0);
    timers.current.push(setTimeout(() => setWidth(20), 10));
    timers.current.push(setTimeout(() => setWidth(50), 150));
    timers.current.push(setTimeout(() => setWidth(75), 400));
    timers.current.push(setTimeout(() => setWidth(90), 800));
    // Aynı sayfaya tıklanınca pathname değişmez → bar takılır. 1.5sn sonra kapat.
    timers.current.push(setTimeout(() => finishBar(), 1500));
  };

  const finishBar = () => {
    clearAll();
    setWidth(100);
    timers.current.push(setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300));
  };

  // Link tıklandığında bar başlat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;
      if (target.getAttribute("target") === "_blank") return;
      startBar();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Pathname değişince tamamla
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      finishBar();
    }
  }, [pathname]);

  if (!visible && width === 0) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-[3px] bg-primary"
      style={{
        width: `${width}%`,
        transition: width === 0 ? "none" : width === 100 ? "width 0.15s ease" : "width 0.5s ease",
        boxShadow: "0 0 8px rgba(var(--color-primary), 0.6)",
      }}
    />
  );
}
