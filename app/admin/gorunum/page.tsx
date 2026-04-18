"use client";

import { useEffect, useState } from "react";
import { Save, Palette, Type, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminSession } from "@/lib/panel-auth";

const presetColors = [
  { name: "Okyanus", primary: "#0e7490", secondary: "#10b981" },
  { name: "Mor", primary: "#7c3aed", secondary: "#ec4899" },
  { name: "Turuncu", primary: "#ea580c", secondary: "#f59e0b" },
  { name: "Kırmızı", primary: "#dc2626", secondary: "#f97316" },
  { name: "Yeşil", primary: "#16a34a", secondary: "#22d3ee" },
  { name: "Lacivert", primary: "#1d4ed8", secondary: "#7c3aed" },
];

const fonts = [
  { id: "google-sans", label: "Google Sans" },
  { id: "inter", label: "Inter" },
  { id: "geist", label: "Geist" },
];

export default function Page() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    api.admin.getSettings(t).then((data) => {
      setSettings(data as Record<string, string>);
    }).catch(() => {});
  }, []);

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const save = async (keys: string[]) => {
    const subset: Record<string, string> = {};
    keys.forEach(k => { subset[k] = settings[k] || ""; });
    try {
      await api.admin.updateSettings(subset, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Kayıt başarısız"); }
  };

  const Toggle = ({ keyName, label, desc }: { keyName: string; label: string; desc: string }) => {
    const active = settings[keyName] === "true";
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <button onClick={() => set(keyName, active ? "false" : "true")}
          className={`flex h-8 w-14 items-center rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`}>
          <span className={`ml-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${active ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Görünüm Ayarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">Site renkleri, font ve özellik toggle'ları</p>
      </header>

      {saved && <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600">Kaydedildi</div>}

      {/* Renk Paleti */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Renk Paleti</h3>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {presetColors.map((p) => (
            <button key={p.name} onClick={() => { set("primary_color", p.primary); set("secondary_color", p.secondary); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${settings.primary_color === p.primary ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded-full" style={{ background: p.primary }} />
                <div className="h-5 w-5 rounded-full" style={{ background: p.secondary }} />
              </div>
              <span className="text-[10px] font-medium">{p.name}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Primary Renk</label>
            <div className="flex gap-2">
              <input type="color" value={settings.primary_color || "#0e7490"}
                onChange={e => set("primary_color", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
              <input type="text" value={settings.primary_color || "#0e7490"}
                onChange={e => set("primary_color", e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Secondary Renk</label>
            <div className="flex gap-2">
              <input type="color" value={settings.secondary_color || "#10b981"}
                onChange={e => set("secondary_color", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
              <input type="text" value={settings.secondary_color || "#10b981"}
                onChange={e => set("secondary_color", e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary font-mono" />
            </div>
          </div>
        </div>
        <button onClick={() => save(["primary_color", "secondary_color"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Renkleri Kaydet
        </button>
      </section>

      {/* Font */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Type className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Yazı Tipi</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {fonts.map(f => (
            <button key={f.id} onClick={() => set("font_family", f.id)}
              className={`rounded-xl border p-3 text-left transition ${settings.font_family === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <p className="text-sm font-medium">{f.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground" style={{ fontFamily: f.label }}>Örnek yazı</p>
            </button>
          ))}
        </div>
        <button onClick={() => save(["font_family"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Fontu Kaydet
        </button>
      </section>

      {/* Auth Özellikleri */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ToggleRight className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Kayıt / Giriş Özellikleri</h3>
        </div>
        <div className="divide-y divide-border">
          <Toggle keyName="email_auth_active" label="E-posta ile Kayıt/Giriş"
            desc="Kullanıcılar e-posta + şifre ile kayıt olabilir" />
          <Toggle keyName="google_active" label="Google ile Giriş"
            desc="Google OAuth2 — Client ID ve Secret girilmiş olmalı" />
          <Toggle keyName="netgsm_active" label="Netgsm SMS"
            desc="OTP için Netgsm kullan" />
          <Toggle keyName="twilio_active" label="Twilio SMS (Yedek)"
            desc="Netgsm başarısız olursa Twilio devreye girer" />
        </div>
        <button onClick={() => save(["email_auth_active", "google_active", "netgsm_active", "twilio_active"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Kaydet
        </button>
      </section>

      {/* Slider Başlıkları */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Ana Sayfa Hero</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Başlık</label>
            <input value={settings.hero_title || "Gebze'yi keşfetmeye hazır mısın?"}
              onChange={e => set("hero_title", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Alt Başlık</label>
            <input value={settings.hero_subtitle || "Tarihi rotalar, etkinlikler ve şehir rehberi"}
              onChange={e => set("hero_subtitle", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <button onClick={() => save(["hero_title", "hero_subtitle"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Kaydet
        </button>
      </section>
    </div>
  );
}
