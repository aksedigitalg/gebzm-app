"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopTopBar } from "@/components/DesktopTopBar";
import { isAuthRoute } from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = isAuthRoute(pathname);
  const fullscreen = pathname.startsWith("/ai");
  const panel = isAdminRoute(pathname) || isBusinessRoute(pathname);

  // Admin / business panelleri: kendi layout
  if (panel) return <>{children}</>;

  // Auth sayfaları (mobile + desktop): tam ekran
  if (auth) {
    return (
      <main className="flex h-[100svh] flex-1 flex-col overflow-hidden">
        {children}
      </main>
    );
  }

  // AI sayfası: tam ekran (mobile), desktop'ta da sidebar + tam chat
  if (fullscreen) {
    return (
      <div className="flex min-h-[100dvh]">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar />
        </div>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    );
  }

  // Normal kullanıcı rotaları — responsive
  return (
    <div className="flex min-h-[100dvh]">
      {/* Desktop sidebar (lg+) */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      {/* Ana alan */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar (lg+) */}
        <div className="hidden lg:block">
          <DesktopTopBar />
        </div>

        <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom,0px)+5px)] lg:pb-6">
          <div className="mx-auto max-w-3xl lg:max-w-6xl lg:px-6 lg:py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile alt menü (lg altında) */}
      <BottomNav />
    </div>
  );
}
