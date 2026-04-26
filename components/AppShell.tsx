"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopTopBar } from "@/components/DesktopTopBar";
import { AiPanel } from "@/components/AiPanel";
import { isAuthRoute } from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";
import { CartProvider } from "@/lib/cart";

function PageWrapper({ children, k }: { children: React.ReactNode; k: string }) {
  return <div key={k}>{children}</div>;
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [aiOpen, setAiOpen] = useState(false);
  const auth = isAuthRoute(pathname);
  const fullscreen = pathname.startsWith("/ai");
  const mapPage = pathname === "/duraklar";
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
          <DesktopSidebar onAiClick={() => setAiOpen(true)} />
        </div>
        <main className="flex min-w-0 flex-1 flex-col">
          <PageWrapper k={pathname}>{children}</PageWrapper>
        </main>
        <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    );
  }

  if (mapPage) {
    return (
      <main className="fixed inset-0 z-0">
        <PageWrapper k={pathname}>{children}</PageWrapper>
      </main>
    );
  }

  return (
    <div className="flex min-h-[100dvh]">
      <div className="hidden lg:block">
        <DesktopSidebar onAiClick={() => setAiOpen(true)} />
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
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

// CartProvider tüm uygulamayı sarar — sepet state'i her sayfada erişilebilir.
// Yalnızca user-facing rotalarda ihtiyacımız var ama Provider boş sepetle
// no-op çalışır, performans etkisi yok.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AppShellInner>{children}</AppShellInner>
    </CartProvider>
  );
}
