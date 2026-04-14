"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { isAuthRoute } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = isAuthRoute(pathname);

  if (auth) {
    // Auth sayfalarinda tam ekran, kisitlama yok, alt menu yok
    return <main className="flex flex-1 flex-col">{children}</main>;
  }

  // Uygulama sayfalari: alt menuye 15px bosluk birakan padding + nav
  return (
    <>
      <main className="flex-1 pb-[90px]">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
