"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Geçerli bir telefon numarası gir (10 hane)."); return; }
    setLoading(true);
    try {
      const res = await api.auth.sendOTP(phone) as { message: string; dev_otp?: string };
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally { setLoading(false); }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("6 haneli kodu gir."); return; }
    setLoading(true);
    try {
      const res = await api.auth.verifyOTP(phone, otp);
      signIn({ phone, token: res.token, id: res.user_id });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod hatalı veya süresi dolmuş");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Kart */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          {/* Logo + başlık */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              {step === "phone" ? "Hoş geldin" : "Doğrulama Kodu"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step === "phone"
                ? "Gebzem hesabına giriş yap"
                : `+90 ${phone} numarasına gönderilen kodu gir`}
            </p>
          </div>

          {/* Telefon adımı */}
          {step === "phone" && (
            <form onSubmit={submitPhone} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon Numarası</label>
                <PhoneInput value={phone} onChange={setPhone} autoFocus />
              </div>
              {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Gönderiliyor..." : "Kod Gönder"}{!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* OTP adımı */}
          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} autoFocus />
              {devOtp && (
                <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-700">
                  Test kodu: <span className="font-mono tracking-widest">{devOtp}</span>
                </p>
              )}
              {!devOtp && (
                <p className="text-center text-xs text-muted-foreground">
                  Demo için <span className="font-bold font-mono">111111</span>
                </p>
              )}
              {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Doğrulanıyor..." : "Giriş Yap"}{!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => { setStep("phone"); setOtp(""); setDevOtp(""); setError(""); }}
                className="w-full text-xs font-medium text-primary hover:underline">
                Numarayı değiştir
              </button>
            </form>
          )}

          {/* Alt link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="font-semibold text-primary hover:underline">Kayıt ol</Link>
          </p>
        </div>

        {/* Alt bilgi */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Giriş yaparak{" "}
          <Link href="/hakkinda" className="hover:underline">Kullanım Koşulları</Link>'nı kabul etmiş olursun.
        </p>
      </div>
    </div>
  );
}
