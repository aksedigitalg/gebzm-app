"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, type LucideIcon, Search } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface PanelShellProps {
  children: React.ReactNode;
  brandName: string;
  brandSubtitle: string;
  brandColor: string;
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  onSignOut: () => void;
  notifToken?: string;
  notifEndpoint?: "user" | "business" | "admin";
}

export function PanelShell({
  children,
  brandName,
  brandSubtitle,
  brandColor,
  navItems,
  userName,
  userEmail,
  onSignOut,
  notifToken = "",
  notifEndpoint = "business",
}: PanelShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pathname değiştiğinde mobile sidebar'ı kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === navItems[0]?.href) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex min-h-[100dvh] bg-muted/30">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-sm",
              brandColor
            )}
          >
            <span className="text-base font-bold">G</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{brandName}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {brandSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full lg:hidden"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.75} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                          active
                            ? "bg-white/25"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-primary-foreground",
                brandColor
              )}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {userEmail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                router.replace(pathname.startsWith("/admin") ? "/admin/giris" : "/isletme/giris");
              }}
              aria-label="Çıkış"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label="Menü"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Ara..."
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary" />
          </div>
          <NotificationBell token={notifToken} endpoint={notifEndpoint} />
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
