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
  Palette,
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
  { href: "/admin/isletmeler", label: "İşletmeler", icon: Building2 },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: Megaphone },
  { href: "/admin/reklamlar", label: "Reklamlar", icon: Target },
  { href: "/admin/isler", label: "İş İlanları", icon: Briefcase },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: Calendar },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/mekanlar", label: "Mekanlar (POI)", icon: MapPin },
  { href: "/admin/gorunum", label: "Görünüm", icon: Palette },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/admin/profil", label: "Profilim", icon: UserCircle },
];

const Spinner = ({ dark = false }: { dark?: boolean }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${dark ? "bg-slate-900" : "bg-background"}`}>
    <div className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${dark ? "border-rose-500" : "border-primary"}`} />
  </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/giris";

  const [session, setSession] = useState<AdminSession | null>(() =>
    typeof window !== "undefined" ? getAdminSession() : null
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getAdminSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) setSession(getAdminSession());
  }, [pathname, ready]);

  useEffect(() => {
    if (!ready) return;
    if (!session && !isLogin) { router.replace("/admin/giris"); return; }
    if (session && !session.token && !isLogin) { clearAdminSession(); router.replace("/admin/giris"); return; }
    if (session?.token && isLogin) { router.replace("/admin"); return; }
  }, [ready, session, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (!ready || !session?.token) return <Spinner dark />;

  return (
    <PanelShell
      brandName="Gebzem Admin"
      brandSubtitle="Yönetim Paneli"
      brandColor="from-rose-500 to-red-600"
      navItems={navItems}
      userName={session.name}
      userEmail={session.email}
      notifToken={session.token || ""}
      notifEndpoint="admin"
      onSignOut={() => { clearAdminSession(); setSession(null); }}
    >
      {children}
    </PanelShell>
  );
}
