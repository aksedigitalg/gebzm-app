"use client";

import { useEffect, useState } from "react";
import { Save, Shield } from "lucide-react";
import { getAdminSession } from "@/lib/panel-auth";

export default function Page() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    setEmail(session?.email || "");
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    if (newPassword && newPassword !== newPassword2) {
      setError("Yeni şifreler eşleşmiyor."); return;
    }
    if (!oldPassword) { setError("Mevcut şifrenizi girin."); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email, old_password: oldPassword, new_password: newPassword || undefined }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Hata"); }
      else {
        setMsg(data.message);
        setOldPassword(""); setNewPassword(""); setNewPassword2("");
      }
    } catch { setError("Bağlantı hatası"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Admin Profili</h1>
        <p className="mt-1 text-sm text-muted-foreground">E-posta ve şifre değiştir</p>
      </header>

      <form onSubmit={save} className="space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Hesap Bilgileri</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Mevcut Şifre</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Yeni Şifre (değiştirmek için)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Boş bırakırsan değişmez"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            {newPassword && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Yeni Şifre (Tekrar)</label>
                <input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              </div>
            )}
          </div>
        </section>

        {msg && <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600">{msg}</p>}
        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
