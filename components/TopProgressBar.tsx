"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Başlat
    setVisible(true);
    setProgress(0);

    // Hızlıca %80'e git
    const t1 = setTimeout(() => setProgress(30), 10);
    const t2 = setTimeout(() => setProgress(60), 100);
    const t3 = setTimeout(() => setProgress(80), 300);

    // Tamamla
    const t4 = setTimeout(() => {
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      clearTimeout(t3); clearTimeout(t4);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-[3px] bg-primary shadow-sm"
      style={{
        width: `${progress}%`,
        transition: progress === 0 ? "none" : progress === 100 ? "width 0.2s ease, opacity 0.3s ease" : "width 0.4s ease",
        opacity: progress === 100 && !visible ? 0 : 1,
      }}
    />
  );
}
