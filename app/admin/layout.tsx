"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Megaphone,
  Briefcase,
  Calendar,
  MessageSquare,
  MapPin,
  Settings,
  Target,
  UserCircle,
} from "lucide-react";
import {
  PanelShell,
  type NavItem,
} from "@/components/panel/PanelShell";
import {
  clearAdminSession,
  getAdminSession,
  type AdminSession,
} from "@/lib/panel-auth";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/isletmeler", label: "İşletmeler", icon: Building2, badge: 4 },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: Megaphone, badge: 2 },
  { href: "/admin/reklamlar", label: "Reklamlar", icon: Target, badge: 1 },
  { href: "/admin/isler", label: "İş İlanları", icon: Briefcase },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: Calendar },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare, badge: 6 },
  { href: "/admin/mekanlar", label: "Mekanlar (POI)", icon: MapPin },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/admin/profil", label: "Profilim", icon: UserCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  // Pathname her değiştiğinde session'ı yeniden oku
  // (login sonrası redirect'te stale state'i önler)
  useEffect(() => {
    setSession(getAdminSession());
    setReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    const isLogin = pathname === "/admin/giris";
    if (!session && !isLogin) router.replace("/admin/giris");
    if (session && isLogin) router.replace("/admin");
  }, [ready, session, pathname, router]);

  if (pathname === "/admin/giris") {
    return <>{children}</>;
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <PanelShell
      brandName="Gebzem Admin"
      brandSubtitle="Yönetim Paneli"
      brandColor="from-rose-500 to-red-600"
      navItems={navItems}
      userName={session.name}
      userEmail={session.email}
      onSignOut={() => {
        clearAdminSession();
        setSession(null);
      }}
    >
      {children}
    </PanelShell>
  );
}
