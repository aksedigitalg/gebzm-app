"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TabFocusRefresher() {
  const router = useRouter();

  useEffect(() => {
    const handle = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [router]);

  return null;
}
