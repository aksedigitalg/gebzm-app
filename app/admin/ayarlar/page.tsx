"use client";

import { useEffect, useState } from "react";
import { Save, MessageSquare, Mail, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminSession } from "@/lib/panel-auth";

export default function Page() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    api.admin.getSettings(t).then((data) => {
      setSettings(data as Record<string, string>);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async (keys: string[]) => {
    const subset: Record<string, string> = {};
    keys.forEach((k) => { subset[k] = settings[k] || ""; });
    try {
      await api.admin.updateSettings(subset, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Kayıt başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform entegrasyonları ve yapılandırma</p>
      </header>

      {saved && (
        <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600">
          Ayarlar kaydedildi
        </div>
      )}

      {/* Netgsm SMS */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Netgsm SMS</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${settings.netgsm_active === "true" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}>
              {settings.netgsm_active === "true" ? "Aktif" : "Pasif"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs text-muted-foreground">Aktif</span>
            <input type="checkbox" checked={settings.netgsm_active === "true"}
              onChange={(e) => set("netgsm_active", e.target.checked ? "true" : "false")}
              className="h-4 w-4 accent-primary" />
          </label>
        </div>
        <div className="space-y-3">
          <Field label="Kullanıcı Kodu (Usercode)" value={settings.netgsm_usercode || ""}
            onChange={(v) => set("netgsm_usercode", v)} placeholder="Netgsm API kullanıcı adı" />
          <Field label="Şifre" value={settings.netgsm_password || ""}
            onChange={(v) => set("netgsm_password", v)} placeholder="Netgsm API şifresi" type="password" />
          <Field label="SMS Başlığı (Header)" value={settings.netgsm_header || "GEBZEM"}
            onChange={(v) => set("netgsm_header", v)} placeholder="GEBZEM (maks 11 karakter)" />
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Netgsm panelinden API kullanıcısı oluştur → Abonelik İşlemleri → Alt Kullanıcı Hesapları → Tip: API Kullanıcısı
        </div>
        <button onClick={() => save(["netgsm_usercode", "netgsm_password", "netgsm_header", "netgsm_active"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Kaydet
        </button>
      </section>

      {/* Resend Email */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Resend (E-posta)</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${settings.resend_active === "true" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}>
              {settings.resend_active === "true" ? "Aktif" : "Pasif"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs text-muted-foreground">Aktif</span>
            <input type="checkbox" checked={settings.resend_active === "true"}
              onChange={(e) => set("resend_active", e.target.checked ? "true" : "false")}
              className="h-4 w-4 accent-primary" />
          </label>
        </div>
        <Field label="Resend API Key" value={settings.resend_api_key || ""}
          onChange={(v) => set("resend_api_key", v)} placeholder="re_xxxxxxxxxx" type="password" />
        <button onClick={() => save(["resend_api_key", "resend_active"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Kaydet
        </button>
      </section>

      {/* Google OAuth */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Google OAuth</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${settings.google_active === "true" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}>
              {settings.google_active === "true" ? "Aktif" : "Pasif"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs text-muted-foreground">Aktif</span>
            <input type="checkbox" checked={settings.google_active === "true"}
              onChange={(e) => set("google_active", e.target.checked ? "true" : "false")}
              className="h-4 w-4 accent-primary" />
          </label>
        </div>
        <div className="space-y-3">
          <Field label="Client ID" value={settings.google_client_id || ""}
            onChange={(v) => set("google_client_id", v)} placeholder="xxxxx.apps.googleusercontent.com" />
          <Field label="Client Secret" value={settings.google_client_secret || ""}
            onChange={(v) => set("google_client_secret", v)} placeholder="GOCSPX-xxxxxxxxxx" type="password" />
        </div>
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Callback URL: <code className="font-mono">https://gebzem.app/api/v1/auth/google/callback</code>
        </div>
        <button onClick={() => save(["google_client_id", "google_client_secret", "google_active"])}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-3.5 w-3.5" />Kaydet
        </button>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
    </div>
  );
}
