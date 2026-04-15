"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, Sparkles } from "lucide-react";
import { setBusinessSession } from "@/lib/panel-auth";
import { businessTypes, type BusinessTypeId } from "@/lib/business-types";

const defaultNames: Record<BusinessTypeId, string> = {
  restoran: "Gebze Mangal Evi",
  yemek: "Köşeoğlu Kebap",
  kafe: "Kafe Tarih",
  market: "Gebze Market",
  magaza: "Gebze Moda",
  doktor: "Dr. Ayşe Yıldız Kliniği",
  kuafor: "Berna Kuaför",
  usta: "Mehmet Usta Tesisat",
  emlakci: "Yaşar Emlak",
  galerici: "Gebze Oto Galeri",
};

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("isletme@gebzem.com");
  const [password, setPassword] = useState("");
  const [typeId, setTypeId] = useState<BusinessTypeId>("restoran");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setBusinessSession({
      id: `biz-${typeId}`,
      name: defaultNames[typeId],
      type: typeId,
      email,
    });
    router.replace("/isletme");
  };

  const typeList = Object.values(businessTypes);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
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

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              İşletme Türü
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar">
              {typeList.map((t) => {
                const Icon = t.icon;
                const selected = typeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeId(t.id)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-white`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">{t.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
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

        <div className="mt-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold">İşletmenizi henüz eklemediniz mi?</p>
              <Link href="#" className="mt-1 inline-block text-[11px] font-semibold text-primary hover:underline">
                İşletme Başvurusu →
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Demo: Herhangi bir e-posta/şifre kabul edilir (prototip)
        </p>
      </div>
    </div>
  );
}
