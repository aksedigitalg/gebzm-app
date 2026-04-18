"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Store, Search, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

type Step = "search" | "select" | "verify" | "reset" | "done";

interface BizResult {
  id: string;
  name: string;
  type: string;
  phone_hint: string; // son 3 hane gösterilecek
}

function maskPhone(phone: string) {
  if (!phone) return "***";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "***";
  return "*".repeat(clean.length - 3) + clean.slice(-3);
}

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BizResult[]>([]);
  const [selected, setSelected] = useState<BizResult | null>(null);
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/business/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
        setStep("select");
      } else {
        setError("İşletme bulunamadı. Farklı bir isim deneyin.");
      }
    } catch {
      setError("Arama başarısız. Lütfen tekrar deneyin.");
    } finally { setLoading(false); }
  };

  const sendResetOtp = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/business/reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: selected.id }),
      });
      if (res.ok) {
        setStep("verify");
      } else {
        const d = await res.json();
        setError(d.error || "Hata oluştu");
      }
    } catch { setError("Bağlantı hatası"); }
    finally { setLoading(false); }
  };

  const verifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) { setError("Doğrulama kodu eksik."); return; }
    if (newPass.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (newPass !== newPass2) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/business/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: selected?.id, otp, new_password: newPass }),
      });
      if (res.ok) {
        setStep("done");
      } else {
        const d = await res.json();
        setError(d.error || "Kod hatalı veya süresi dolmuş");
      }
    } catch { setError("Bağlantı hatası"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-xl font-bold">Şifre Sıfırla</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "search" && "İşletme adını girerek hesabını bul"}
            {step === "select" && "Hesabını seç"}
            {step === "verify" && "Telefona gönderilen kodu gir"}
            {step === "reset" && "Yeni şifreni belirle"}
            {step === "done" && "Şifren başarıyla sıfırlandı"}
          </p>
        </div>

        {/* Adım 1: Ara */}
        {step === "search" && (
          <form onSubmit={searchBusiness} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">İşletme Adı</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Örn: Berna Kuaför" autoFocus
                  className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading || !query.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Aranıyor..." : "İşletmeyi Bul"}<ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/isletme/giris" className="font-semibold text-primary hover:underline">Girişe dön</Link>
            </p>
          </form>
        )}

        {/* Adım 2: Seç */}
        {step === "select" && (
          <div className="space-y-3">
            {results.map((r) => (
              <button key={r.id} onClick={() => { setSelected(r); sendResetOtp(); }}
                className={`w-full rounded-xl border p-3 text-left transition hover:border-primary hover:bg-primary/5 ${selected?.id === r.id ? "border-primary bg-primary/5" : "border-border"}`}>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">Telefon: {maskPhone(r.phone_hint)}</p>
              </button>
            ))}
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button onClick={() => setStep("search")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />Geri
            </button>
          </div>
        )}

        {/* Adım 3: OTP */}
        {step === "verify" && selected && (
          <form onSubmit={(e) => { e.preventDefault(); setStep("reset"); }} className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <strong>{selected.name}</strong> hesabı için {maskPhone(selected.phone_hint)} numaralı telefona SMS gönderildi.
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Doğrulama Kodu</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 haneli kod" maxLength={6}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary text-center tracking-widest font-mono" />
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={otp.length < 6}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              Devam Et<ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Adım 4: Yeni şifre */}
        {step === "reset" && (
          <form onSubmit={verifyAndReset} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Yeni Şifre</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-10 text-sm outline-none focus:border-primary" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre Tekrar</label>
              <input type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} placeholder="••••••"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
            </button>
          </form>
        )}

        {/* Tamamlandı */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.5} />
            <p className="mt-4 text-base font-bold">Şifren Sıfırlandı!</p>
            <p className="mt-1 text-xs text-muted-foreground">Yeni şifrenle giriş yapabilirsin.</p>
            <button onClick={() => router.push("/isletme/giris")}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Giriş Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
