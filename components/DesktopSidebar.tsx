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
      { href: "/kategoriler", label: "Kategori", icon: LayoutGrid },
      { href: "/harita", label: "Harita", icon: Map },
      { href: "/ai", label: "AI", icon: Sparkles },
    ],
  },
  {
    label: "Keşfet",
    items: [
      { href: "/gezilecek", label: "Keşfet", icon: Compass },
      { href: "/etkinlikler", label: "Etkinlik", icon: Calendar },
      { href: "/ulasim", label: "Ulaşım", icon: Bus },
    ],
  },
  {
    label: "Hizmet",
    items: [
      { href: "/yemek", label: "Yemek", icon: Utensils },
      { href: "/restoran", label: "Restoran", icon: UtensilsCrossed },
      { href: "/market", label: "Market", icon: Store },
      { href: "/alisveris", label: "Alışveriş", icon: ShoppingBag },
      { href: "/hizmetler", label: "Hizmetler", icon: Wrench },
      { href: "/ilanlar", label: "İlanlar", icon: Megaphone },
      { href: "/is-basvurusu", label: "İş İlanı", icon: Briefcase },
    ],
  },
  {
    label: "Yardım",
    items: [
      { href: "/rehber", label: "Rehber", icon: Compass },
      { href: "/acil", label: "Acil", icon: PhoneCall },
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
    <aside className="sticky top-0 flex h-[100dvh] w-[104px] shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <Link
        href="/"
        className="flex flex-col items-center gap-1 border-b border-border py-4"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <span className="text-lg font-bold">G</span>
        </div>
        <span className="text-[10px] font-bold">Gebzem</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 no-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
            <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-2.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex flex-col items-center gap-1"
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-[10px] transition",
                          active
                            ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md"
                            : "border border-border bg-background text-muted-foreground group-hover:border-primary/30 group-hover:bg-muted group-hover:text-foreground"
                        )}
                      >
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={active ? 2.25 : 1.75}
                        />
                      </div>
                      <span
                        className={cn(
                          "max-w-full truncate text-center text-[10px] font-medium",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kullanıcı / Giriş */}
      <div className="border-t border-border p-2">
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/profil"
              className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground shadow-sm transition hover:shadow-md"
            >
              {initials}
            </Link>
            <p className="max-w-full truncate text-center text-[10px] font-semibold">
              {user.firstName || "Profil"}
            </p>
            <div className="flex gap-1">
              <Link
                href="/profil/mesajlar"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Mesajlarım"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Çıkış"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/giris"
              className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
              aria-label="Giriş Yap"
            >
              <LogIn className="h-5 w-5" strokeWidth={2} />
            </Link>
            <span className="text-[10px] font-semibold text-primary">
              Giriş Yap
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
