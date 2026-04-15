"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, Sparkles } from "lucide-react";
import { setBusinessSession } from "@/lib/panel-auth";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("isletme@gebzem.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusinessSession({
      id: "biz-demo-1",
      name: "Gebze Mangal Evi",
      type: "Restoran",
      email,
    });
    router.replace("/isletme");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold">İşletme Paneli</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Gebzem'de işletmenizi yönetin
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold">İşletmenizi henüz eklemediniz mi?</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Gebzem'de ücretsiz işletme profili oluşturun.
              </p>
              <Link href="#" className="mt-2 inline-block text-[11px] font-semibold text-primary hover:underline">
                İşletme Başvurusu →
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Demo: Herhangi bir e-posta ve şifre kabul edilir (prototip).
        </p>
      </div>
    </div>
  );
}
