import Link from "next/link";
import {
  Utensils,
  Bus,
  PhoneCall,
  Info,
  ChevronRight,
  Compass,
  Calendar,
  Map,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Menü" };

const items = [
  { href: "/", label: "Ana Sayfa", icon: Compass },
  { href: "/harita", label: "Harita", icon: Map },
  { href: "/gezilecek", label: "Gezilecek Yerler", icon: Compass },
  { href: "/etkinlikler", label: "Etkinlikler", icon: Calendar },
  { href: "/ulasim", label: "Ulaşım", icon: Bus },
  { href: "/rehber", label: "Rehber", icon: Utensils },
  { href: "/acil", label: "Acil Numaralar", icon: PhoneCall },
  { href: "/hakkinda", label: "Hakkında", icon: Info },
];

export default function Page() {
  return (
    <>
      <PageHeader title="Menü" subtitle="Tüm bölümlere erişim" />
      <div className="px-4 pb-10 pt-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/60 ${
                  i !== items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{it.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Gebzem — Gebze Şehir Rehberi · v0.1 prototip
        </p>
      </div>
    </>
  );
}
