"use client";

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
  LogOut,
  UserCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

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

export default function MenuPage() {
  const { user, signOut } = useAuth();
  const fullName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : "Kullanıcı";
  const phone = user?.phone ? `+90 ${user.phone}` : "";

  return (
    <>
      <PageHeader title="Menü" subtitle="Tüm bölümlere erişim" />
      <div className="px-5 pb-10 pt-4">
        <section className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <UserCircle2 className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            {phone && (
              <p className="truncate text-xs text-muted-foreground">{phone}</p>
            )}
          </div>
        </section>

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

        <button
          onClick={signOut}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Gebzem — Gebze Şehir Rehberi · v0.1 prototip
        </p>
      </div>
    </>
  );
}
