"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Pencil, KeyRound, Bell, Moon, Sun, Monitor,
  Shield, HelpCircle, Info, LogOut, ChevronRight,
  MessageSquare, Store, Check,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Theme = "light" | "dark" | "system";

function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("gebzem_theme") as Theme) || "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "light") root.classList.remove("dark");
  else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
    else root.classList.remove("dark");
  }
  localStorage.setItem("gebzem_theme", theme);
}

export default function ProfilPage() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<Theme>("system");
  const [realName, setRealName] = useState("");
  const [realPhone, setRealPhone] = useState("");

  useEffect(() => {
    setTheme(getTheme());
    const u = getUser();
    if (u?.token) {
      api.user.getMe().then((data) => {
        const d = data as Record<string, string>;
        if (d.name) setRealName(d.name);
        if (d.phone) setRealPhone(d.phone);
      }).catch(() => {});
    }
  }, []);

  const changeTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  const firstName = user?.firstName?.trim() || "";
  const lastName = user?.lastName?.trim() || "";
  const fullName = realName || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "Kullanıcı");
  const phone = realPhone || user?.phone || "—";
  const initials = (firstName?.[0] || "") + (lastName?.[0] || "") || (phone?.slice(-2) ?? "GB");

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const themeLabel = theme === "dark" ? "Koyu" : theme === "light" ? "Açık" : "Otomatik";

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
            <p className="mt-0.5 truncate text-xs text-muted-foreground">+90 {phone}</p>
          </div>
          <Link href="/profil/duzenle" aria-label="Profili Düzenle"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Link>
        </section>

        {/* Etkileşim */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Etkileşim</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Link href="/profil/mesajlar" className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Mesajlarım</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Hesap */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hesap</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Link href="/profil/duzenle" className="flex items-center gap-3 border-b border-border px-4 py-3.5 transition hover:bg-muted/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pencil className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Profili Düzenle</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/profil/duzenle" className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Şifre Değiştir</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Tercihler */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tercihler</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Bildirimler */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">Bildirimler</span>
              <span className="text-xs text-muted-foreground">Açık</span>
            </div>
            {/* Tema */}
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </div>
                <span className="flex-1 text-sm font-medium">Tema</span>
                <span className="text-xs text-muted-foreground">{themeLabel}</span>
              </div>
              <div className="mt-3 flex gap-2 pl-12">
                {([["light", "Açık", Sun], ["system", "Otomatik", Monitor], ["dark", "Koyu", Moon]] as [Theme, string, typeof Moon][]).map(([t, label, Icon]) => (
                  <button key={t} onClick={() => changeTheme(t)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${theme === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
                    {theme === t && <Check className="h-3 w-3" />}
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bilgi */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bilgi</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {[
              { label: "Gizlilik ve Güvenlik", icon: Shield, href: "/guvenlik" },
              { label: "Yardım ve Destek", icon: HelpCircle, href: "/yardim" },
              { label: "Hakkında", icon: Info, href: "/hakkinda" },
            ].map(({ label, icon: Icon, href }, i, arr) => (
              <Link key={label} href={href}
                className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/60 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* İşletme promo */}
        <Link href="/isletme/giris"
          className="flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-primary-foreground shadow-lg transition hover:opacity-95">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Store className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">İşletmenizi Ekleyin</p>
            <p className="mt-0.5 text-[11px] opacity-90">Gebzem'de ücretsiz profil, rezervasyon, mesajlaşma</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>

        <button onClick={signOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10">
          <LogOut className="h-4 w-4" />Çıkış Yap
        </button>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">Gebzem · v1.0</p>
      </div>
    </>
  );
}
