"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react";
import { businessTypes, type BusinessTypeId } from "@/lib/business-types";
import { api } from "@/lib/api";

type Step = "info" | "type" | "done";

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [typeId, setTypeId] = useState<BusinessTypeId>("restoran");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeList = Object.values(businessTypes);

  const submitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("İşletme adı gerekli."); return; }
    if (!email.includes("@")) { setError("Geçerli bir email gir."); return; }
    if (!phone || phone.replace(/\D/g, "").length < 10) { setError("Geçerli bir telefon gir."); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (password !== password2) { setError("Şifreler eşleşmiyor."); return; }
    setStep("type");
  };

  const submitRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await api.auth.businessRegister({ name, type: typeId, email, password, phone });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız. Bu email zaten kullanılıyor olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl">

        {/* Logo + Başlık */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-xl font-bold">İşletme Başvurusu</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "info" ? "Temel bilgilerinizi doldurun" :
             step === "type" ? "İşletme türünüzü seçin" :
             "Başvurunuz alındı!"}
          </p>
        </div>

        {/* Adım 1 — Bilgiler */}
        {step === "info" && (
          <form onSubmit={submitInfo} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">İşletme Adı *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Berna Kuaför"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="isletme@ornek.com"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0 5XX XXX XX XX"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre *</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="En az 6 karakter"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre Tekrar *</label>
              <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="••••••"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90">
              Devam Et <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Zaten hesabın var mı?{" "}
              <Link href="/isletme/giris" className="font-semibold text-primary hover:underline">Giriş yap</Link>
            </p>
          </form>
        )}

        {/* Adım 2 — Tür Seçimi */}
        {step === "type" && (
          <div className="space-y-4">
            <button onClick={() => setStep("info")}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />Geri dön
            </button>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto no-scrollbar">
              {typeList.map((t) => {
                const Icon = t.icon;
                const selected = typeId === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setTypeId(t.id)}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"}`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-white`}>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button onClick={submitRegister} disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Başvuru gönderiliyor..." : "Başvuruyu Tamamla"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Adım 3 — Tamamlandı */}
        {step === "done" && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
            </div>
            <h2 className="mt-5 text-lg font-bold">Başvurunuz Alındı!</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              <strong>{name}</strong> için başvurunuz iletildi. Admin onayından sonra paneliniz aktifleşecek.
            </p>
            <div className="mt-4 w-full rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              Onay süreci genellikle 24 saat içinde tamamlanır. Giriş bilgilerinizi saklayın.
            </div>
            <div className="mt-6 flex gap-3 w-full">
              <Link href="/isletme/giris"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Giriş Yap
              </Link>
              <Link href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted">
                Ana Sayfa
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
