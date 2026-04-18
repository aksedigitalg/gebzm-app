"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Phone, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { getUser, setUser } from "@/lib/auth";
import Link from "next/link";

export default function ProfilDuzenlePage() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) return;
    const n = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    setName(n || "");
    api.user.getMe().then((data) => {
      const d = data as Record<string, string>;
      if (d.name) setName(d.name);
      if (d.email) setEmail(d.email);
    }).catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    setLoading(true);
    try {
      await api.user.updateMe({ name, email });
      const parts = name.trim().split(" ");
      const u = getUser();
      if (u) {
        const updated = { ...u, firstName: parts[0], lastName: parts.slice(1).join(" ") };
        setUser(updated);
        signIn(updated);
      }
      setMsg("Profil güncellendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally { setLoading(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    if (newPassword !== newPassword2) { setError("Şifreler eşleşmiyor."); return; }
    if (newPassword.length < 4) { setError("En az 4 karakter."); return; }
    setLoading(true);
    try {
      const u = getUser();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${u?.token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      }).then(r => r.json()).then(d => { if (d.error) throw new Error(d.error); });
      setMsg("Şifre güncellendi.");
      setOldPassword(""); setNewPassword(""); setNewPassword2("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-base font-semibold">Profili Düzenle</h1>
      </div>

      <div className="px-5 pt-5">
        {/* Tab */}
        <div className="mb-5 flex rounded-xl border border-border bg-muted/30 p-1">
          <button onClick={() => { setTab("profile"); setMsg(""); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${tab === "profile" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <User className="h-3.5 w-3.5" />Bilgiler
          </button>
          <button onClick={() => { setTab("password"); setMsg(""); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${tab === "password" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <Lock className="h-3.5 w-3.5" />Şifre
          </button>
        </div>

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ad Soyad</label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <User className="h-4 w-4 text-muted-foreground" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ad Soyad"
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta</label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta"
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon</label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="h-11 flex items-center text-sm text-muted-foreground">+90 {user?.phone} (değiştirilemez)</span>
              </label>
            </div>
            {msg && <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600">{msg}</p>}
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              <Save className="h-4 w-4" />{loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={savePassword} className="space-y-4">
            {["Mevcut Şifre", "Yeni Şifre", "Yeni Şifre (Tekrar)"].map((label, i) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
                <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input type="password" placeholder="••••••••"
                    value={i === 0 ? oldPassword : i === 1 ? newPassword : newPassword2}
                    onChange={e => i === 0 ? setOldPassword(e.target.value) : i === 1 ? setNewPassword(e.target.value) : setNewPassword2(e.target.value)}
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                </label>
              </div>
            ))}
            {msg && <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600">{msg}</p>}
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              <Save className="h-4 w-4" />{loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
