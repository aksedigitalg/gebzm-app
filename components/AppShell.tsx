"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { isAuthRoute } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = isAuthRoute(pathname);

  if (auth) {
    // Auth sayfalari: dinamik viewport'u tam doldurur, alt menu yok
    return (
      <main className="flex h-[100svh] flex-1 flex-col overflow-hidden">
        {children}
      </main>
    );
  }

  // Uygulama sayfalari: son icerikle alt menu arasi ~10px (safe-area hassas)
  return (
    <>
      <main
        className="flex-1"
        style={{
          paddingBottom:
            "calc(76px + env(safe-area-inset-bottom, 0px) + 5px)",
        }}
      >
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
