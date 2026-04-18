"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Store,
  Briefcase,
  MessageSquare,
  Star,
  TrendingUp,
  Settings,
  Megaphone,
} from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel/PanelShell";
import {
  clearBusinessSession,
  getBusinessSession,
  type BusinessSession,
} from "@/lib/panel-auth";
import { getBusinessType, moduleRegistry } from "@/lib/business-types";

function buildNav(typeId: string | undefined): NavItem[] {
  const config = getBusinessType(typeId);
  const typeModules = config.modules.map((m) => ({
    href: moduleRegistry[m].href,
    label: moduleRegistry[m].label,
    icon: moduleRegistry[m].icon,
  }));

  return [
    { href: "/isletme", label: "Dashboard", icon: LayoutDashboard },
    { href: "/isletme/profil", label: "İşletme Profilim", icon: Store },
    ...typeModules,
    { href: "/isletme/reklam", label: "Reklamlar", icon: Megaphone },
    { href: "/isletme/ilanlar", label: "İş İlanlarım", icon: Briefcase },
    { href: "/isletme/mesajlar", label: "Müşteri Mesajları", icon: MessageSquare },
    { href: "/isletme/yorumlar", label: "Yorumlar", icon: Star },
    { href: "/isletme/istatistik", label: "İstatistikler", icon: TrendingUp },
    { href: "/isletme/ayarlar", label: "Ayarlar", icon: Settings },
  ];
}

const Spinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<BusinessSession | null>(null);
  const [ready, setReady] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setSession(getBusinessSession());
    setReady(true);
    setRedirecting(false);
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    const isLogin = pathname === "/isletme/giris";
    if (!session && !isLogin) { setRedirecting(true); router.replace("/isletme/giris"); return; }
    if (session && !session.token && !isLogin) {
      clearBusinessSession();
      setRedirecting(true);
      router.replace("/isletme/giris");
      return;
    }
    if (session && isLogin) { setRedirecting(true); router.replace("/isletme"); return; }
  }, [ready, session, pathname, router]);

  if (pathname === "/isletme/giris") return <>{children}</>;

  if (!ready || !session || redirecting) return <Spinner />;

  const typeConfig = getBusinessType(session.type);
  const nav = buildNav(session.type);

  return (
    <PanelShell
      brandName={session.name}
      brandSubtitle={typeConfig.label}
      brandColor={typeConfig.color}
      navItems={nav}
      userName={session.name}
      userEmail={session.email}
      onSignOut={() => { clearBusinessSession(); setSession(null); }}
    >
      {children}
    </PanelShell>
  );
}
