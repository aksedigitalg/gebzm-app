"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  Compass,
  UserCircle2,
  LayoutGrid,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/components/SearchProvider";

const links = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/kategoriler", label: "Kategoriler", icon: LayoutGrid },
  { href: "/harita", label: "Harita", icon: Map },
  { href: "/gezilecek", label: "Keşfet", icon: Compass },
  { href: "/profil", label: "Profil", icon: UserCircle2 },
] as const;

const HIDDEN_PATHS = ["/onboarding", "/giris", "/kayit", "/sifremi-unuttum", "/ai"];

export function BottomNav() {
  const pathname = usePathname();
  const { open } = useSearch();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 10px)`,
      }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-6">
        {/* Sıralama: Ana Sayfa, Kategoriler, Harita, Ara, Keşfet, Profil */}
        <NavLink item={links[0]} pathname={pathname} />
        <NavLink item={links[1]} pathname={pathname} />
        <NavLink item={links[2]} pathname={pathname} />

        {/* Ara — popup açar */}
        <li>
          <button
            type="button"
            onClick={open}
            className="flex w-full flex-col items-center gap-1 px-1 pt-2.5 pb-[18px] text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-5 w-5 stroke-[1.75]" />
            <span>Ara</span>
          </button>
        </li>

        <NavLink item={links[3]} pathname={pathname} />
        <NavLink item={links[4]} pathname={pathname} />
      </ul>
    </nav>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { href: string; label: string; icon: typeof Home };
  pathname: string;
}) {
  const Icon = item.icon;
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex flex-col items-center gap-1 px-1 pt-2.5 pb-[18px] text-[11px] font-medium transition-colors",
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
}
