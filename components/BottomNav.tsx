"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Calendar, Compass, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/harita", label: "Harita", icon: Map },
  { href: "/etkinlikler", label: "Etkinlik", icon: Calendar },
  { href: "/gezilecek", label: "Keşfet", icon: Compass },
  { href: "/menu", label: "Menü", icon: Menu },
];

const HIDDEN_PATHS = ["/onboarding", "/giris", "/kayit", "/sifremi-unuttum"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 10px)`,
      }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 pt-2.5 pb-[18px] text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "stroke-[2.25]" : "stroke-[1.75]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
