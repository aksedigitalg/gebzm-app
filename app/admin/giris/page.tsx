"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";
import { setAdminSession } from "@/lib/panel-auth";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gebzem.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("E-posta ve şifre girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.admin.login(email, password);
      setAdminSession({ email, name: "Yönetici", token: res.token });
    } catch {
      // demo fallback — herhangi şifre kabul
      setAdminSession({ email, name: "Yönetici" });
    }
    router.replace("/admin");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-800/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Admin Paneli</h1>
          <p className="mt-1 text-xs text-slate-400">
            Gebzem yönetim arayüzü
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-600 bg-slate-900/80 px-3 text-sm text-white outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-slate-600 bg-slate-900/80 px-3 text-sm text-white outline-none focus:border-rose-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-center text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Demo:</span> Herhangi bir e-posta ve şifre kabul edilir (prototip).
        </p>
      </div>
    </div>
  );
}
