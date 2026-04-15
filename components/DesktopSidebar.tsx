"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Map,
  Compass,
  Utensils,
  UtensilsCrossed,
  Store,
  ShoppingBag,
  Megaphone,
  Briefcase,
  Calendar,
  Wrench,
  PhoneCall,
  Bus,
  Sparkles,
  LogOut,
  LogIn,
  UserCircle2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Ana",
    items: [
      { href: "/", label: "Ana Sayfa", icon: Home },
      { href: "/kategoriler", label: "Kategoriler", icon: LayoutGrid },
      { href: "/harita", label: "Harita", icon: Map },
      { href: "/ai", label: "Gebzem AI", icon: Sparkles },
    ],
  },
  {
    label: "Keşfet",
    items: [
      { href: "/gezilecek", label: "Gezilecek Yerler", icon: Compass },
      { href: "/etkinlikler", label: "Etkinlikler", icon: Calendar },
      { href: "/ulasim", label: "Ulaşım", icon: Bus },
    ],
  },
  {
    label: "Hizmetler",
    items: [
      { href: "/yemek", label: "Yemek", icon: Utensils },
      { href: "/restoran", label: "Restoran", icon: UtensilsCrossed },
      { href: "/market", label: "Market", icon: Store },
      { href: "/alisveris", label: "Alışveriş", icon: ShoppingBag },
      { href: "/hizmetler", label: "Hizmetler", icon: Wrench },
      { href: "/ilanlar", label: "İlanlar", icon: Megaphone },
      { href: "/is-basvurusu", label: "İş İlanları", icon: Briefcase },
    ],
  },
  {
    label: "Yardım",
    items: [
      { href: "/rehber", label: "Rehber", icon: Compass },
      { href: "/acil", label: "Acil Numaralar", icon: PhoneCall },
    ],
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const initials =
    user && (user.firstName || user.lastName)
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
      : "GB";

  return (
    <aside className="sticky top-0 flex h-[100dvh] w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <span className="text-lg font-bold">G</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Gebzem</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Şehir Rehberi
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kullanıcı / Giriş */}
      <div className="border-t border-border p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {user.firstName
                  ? `${user.firstName} ${user.lastName || ""}`.trim()
                  : "Kullanıcı"}
              </p>
              {user.phone && (
                <p className="truncate text-[10px] text-muted-foreground">
                  +90 {user.phone}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <Link
                href="/profil/mesajlar"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
                aria-label="Mesajlarım"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/profil"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
                aria-label="Profil"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
                aria-label="Çıkış"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/giris"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Hesabın yok mu? Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
