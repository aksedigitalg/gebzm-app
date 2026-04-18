"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Eye, EyeOff } from "lucide-react";
import { setBusinessSession } from "@/lib/panel-auth";
import { api } from "@/lib/api";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email ve şifre gerekli."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.businessLogin(email, password);
      setBusinessSession({
        id: res.business_id,
        name: res.name || email,
        type: res.type,
        email,
        token: res.token,
      });
      router.replace("/isletme");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email veya şifre hatalı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold">İşletme Paneli</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Gebzem'de işletmenizi yönetin
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="isletme@ornek.com"
              autoFocus
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center text-xs text-muted-foreground">
          <p>
            <a href="/isletme/sifre-sifirla" className="font-semibold text-primary hover:underline">Şifremi Unuttum</a>
          </p>
          <p>Hesabınız yok mu?{" "}
            <a href="/isletme/kayit" className="font-semibold text-primary hover:underline">İşletme Başvurusu</a>
          </p>
        </div>
      </div>
    </div>
  );
}
