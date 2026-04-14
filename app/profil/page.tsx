"use client";

import Link from "next/link";
import {
  Pencil,
  KeyRound,
  Bell,
  Globe,
  Moon,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

interface MenuItem {
  label: string;
  icon: typeof Pencil;
  href?: string;
  value?: string;
}

interface Section {
  title: string;
  items: MenuItem[];
}

const sections: Section[] = [
  {
    title: "Hesap",
    items: [
      { label: "Profili Düzenle", icon: Pencil, href: "#" },
      { label: "Şifre Değiştir", icon: KeyRound, href: "#" },
    ],
  },
  {
    title: "Tercihler",
    items: [
      { label: "Bildirimler", icon: Bell, href: "#", value: "Açık" },
      { label: "Dil", icon: Globe, href: "#", value: "Türkçe" },
      { label: "Tema", icon: Moon, href: "#", value: "Otomatik" },
    ],
  },
  {
    title: "Bilgi",
    items: [
      { label: "Gizlilik ve Güvenlik", icon: Shield, href: "#" },
      { label: "Yardım ve Destek", icon: HelpCircle, href: "#" },
      { label: "Hakkında", icon: Info, href: "/hakkinda" },
    ],
  },
];

export default function ProfilPage() {
  const { user, signOut } = useAuth();

  const firstName = user?.firstName?.trim() || "";
  const lastName = user?.lastName?.trim() || "";
  const fullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : "Kullanıcı";
  const phone = user?.phone ? `+90 ${user.phone}` : "—";
  const initials =
    (firstName?.[0] || "") + (lastName?.[0] || "") ||
    (user?.phone?.slice(-2) ?? "GB");

  return (
    <>
      <PageHeader title="Profil" />
      <div className="space-y-5 px-5 pb-6 pt-4">
        {/* Profil kartı */}
        <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xl font-bold text-primary-foreground">
            {initials.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{fullName}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {phone}
            </p>
          </div>
          <Link
            href="#"
            aria-label="Profili Düzenle"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </section>

        {/* Ayar bölümleri */}
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                const isLast = i === section.items.length - 1;
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/60 ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    {item.value && (
                      <span className="text-xs text-muted-foreground">
                        {item.value}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Çıkış */}
        <button
          onClick={signOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          Gebzem · v0.1 prototip
        </p>
      </div>
    </>
  );
}
