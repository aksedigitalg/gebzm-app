"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Sparkles,
  Tag,
  LogIn,
  LogOut,
  MessageSquare,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useSearch } from "@/components/SearchProvider";

const navItems: { href: string; label: string; icon: LucideIcon; search?: boolean; ai?: boolean }[] = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "#", label: "Arama", icon: Search, search: true },
  { href: "/kategoriler", label: "Kategoriler", icon: LayoutGrid },
  { href: "#", label: "Gebzem AI", icon: Sparkles, ai: true },
  { href: "/kampanyalar", label: "Kampanyalar", icon: Tag },
];

export function DesktopSidebar({ onAiClick }: { onAiClick?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { open: openSearch } = useSearch();

  const isActive = (href: string) => {
    if (href === "/" || href === "#") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const initials =
    user && (user.firstName || user.lastName)
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
      : user?.phone?.slice(-2) || "GB";

  return (
    <aside className="sticky top-0 flex h-[100dvh] w-[88px] shrink-0 flex-col items-center border-r border-border bg-card">
      {/* Logo */}
      <Link href="/" className="mt-6 flex flex-col items-center gap-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <span className="text-base font-bold">G</span>
        </div>
        <span className="text-[9px] font-bold tracking-wide text-muted-foreground">GEBZEM</span>
      </Link>

      {/* Nav — dikey ortada */}
      <nav className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <div key={item.label}>
              {item.ai ? (
                <button type="button" onClick={onAiClick}
                  className="group flex flex-col items-center gap-1 px-2 py-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-border bg-background text-muted-foreground transition group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
                </button>
              ) : item.search ? (
                <button
                  type="button"
                  onClick={openSearch}
                  className="group flex flex-col items-center gap-1 px-2 py-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-border bg-background text-muted-foreground transition group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                    {item.label}
                  </span>
                </button>
              ) : (
                <Link href={item.href} className="group flex flex-col items-center gap-1 px-2 py-1">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-[12px] transition",
                      active
                        ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md"
                        : "border border-border bg-background text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )}

            </div>
          );
        })}
      </nav>

      {/* Profil kartı — altta */}
      <div className="mb-6 flex flex-col items-center">
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/profil"
              className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground shadow-sm transition hover:shadow-md"
            >
              {initials}
            </Link>
            <span className="max-w-[72px] truncate text-center text-[10px] font-semibold">
              {user.firstName || "Profil"}
            </span>
            <div className="flex gap-1.5">
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
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-red-500"
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
              className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
              aria-label="Giriş Yap"
            >
              <LogIn className="h-5 w-5" strokeWidth={2} />
            </Link>
            <span className="text-[10px] font-semibold text-primary">Giriş Yap</span>
          </div>
        )}
      </div>
    </aside>
  );
}
