"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopTopBar } from "@/components/DesktopTopBar";
import { isAuthRoute } from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";

// Sayfa geçişi — pathname değişince key değişir → fade-in tetiklenir
function PageWrapper({ children, k }: { children: React.ReactNode; k: string }) {
  return <div key={k}>{children}</div>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = isAuthRoute(pathname);
  const fullscreen = pathname.startsWith("/ai");
  const panel = isAdminRoute(pathname) || isBusinessRoute(pathname);

  if (panel) return <>{children}</>;

  if (auth) {
    return (
      <main className="flex h-[100svh] flex-1 flex-col overflow-hidden">
        <PageWrapper k={pathname}>{children}</PageWrapper>
      </main>
    );
  }

  if (fullscreen) {
    return (
      <div className="flex min-h-[100dvh]">
        <div className="hidden lg:block">
          <DesktopSidebar />
        </div>
        <main className="flex min-w-0 flex-1 flex-col">
          <PageWrapper k={pathname}>{children}</PageWrapper>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh]">
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden lg:block">
          <DesktopTopBar />
        </div>
        <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom,0px)+5px)] lg:pb-6">
          <div className="mx-auto max-w-3xl lg:max-w-6xl lg:px-6 lg:py-4">
            <PageWrapper k={pathname}>{children}</PageWrapper>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
