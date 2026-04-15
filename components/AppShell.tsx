"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { isAuthRoute } from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = isAuthRoute(pathname);
  const fullscreen = pathname.startsWith("/ai");
  const panel = isAdminRoute(pathname) || isBusinessRoute(pathname);

  // Admin / business panelleri: kendi layout'unu kullanır, appshell yok
  if (panel) {
    return <>{children}</>;
  }

  if (auth || fullscreen) {
    return (
      <main className="flex h-[100svh] flex-1 flex-col overflow-hidden">
        {children}
      </main>
    );
  }

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
