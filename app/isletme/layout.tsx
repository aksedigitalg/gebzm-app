"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  CalendarCheck2,
  MessageSquare,
  Star,
  TrendingUp,
  Settings,
} from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel/PanelShell";
import {
  clearBusinessSession,
  getBusinessSession,
  type BusinessSession,
} from "@/lib/panel-auth";

const navItems: NavItem[] = [
  { href: "/isletme", label: "Dashboard", icon: LayoutDashboard },
  { href: "/isletme/profil", label: "İşletme Profilim", icon: Store },
  { href: "/isletme/menu", label: "Menü / Ürünler", icon: UtensilsCrossed },
  { href: "/isletme/rezervasyonlar", label: "Rezervasyonlar", icon: CalendarCheck2, badge: 3 },
  { href: "/isletme/mesajlar", label: "Müşteri Mesajları", icon: MessageSquare, badge: 5 },
  { href: "/isletme/yorumlar", label: "Yorumlar", icon: Star },
  { href: "/isletme/istatistik", label: "İstatistikler", icon: TrendingUp },
  { href: "/isletme/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<BusinessSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getBusinessSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isLogin = pathname === "/isletme/giris";
    if (!session && !isLogin) router.replace("/isletme/giris");
    if (session && isLogin) router.replace("/isletme");
  }, [ready, session, pathname, router]);

  if (pathname === "/isletme/giris") {
    return <>{children}</>;
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PanelShell
      brandName={session.name}
      brandSubtitle={session.type}
      brandColor="from-primary to-secondary"
      navItems={navItems}
      userName={session.name}
      userEmail={session.email}
      onSignOut={() => {
        clearBusinessSession();
        setSession(null);
      }}
    >
      {children}
    </PanelShell>
  );
}
