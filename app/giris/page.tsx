"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Phone, Mail } from "lucide-react";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

type Mode = "phone" | "email";
type Step = "input" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Geçerli bir telefon numarası gir."); return; }
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
      setError(err instanceof Error ? err.message : "Kod hatalı");
    } finally { setLoading(false); }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email ve şifre gerekli."); return; }
    setLoading(true);
    try {
      const res = await api.auth.emailLogin(email, password);
      signIn({ token: res.token, id: res.user_id } as Parameters<typeof signIn>[0]);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email veya şifre hatalı");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-[100svh] flex-col px-5 pt-10"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Tekrar hoş geldin</h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Gebzem hesabına giriş yap
        </p>
      </div>

      {/* Mod seçici */}
      {step === "input" && (
        <div className="mt-8 flex rounded-xl border border-border bg-muted/30 p-1">
          <button onClick={() => { setMode("phone"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${mode === "phone" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <Phone className="h-3.5 w-3.5" />Telefon
          </button>
          <button onClick={() => { setMode("email"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${mode === "email" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <Mail className="h-3.5 w-3.5" />E-posta
          </button>
        </div>
      )}

      {/* Telefon OTP adım 1 */}
      {mode === "phone" && step === "input" && (
        <form onSubmit={submitPhone} className="mt-6 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon</label>
            <PhoneInput value={phone} onChange={setPhone} autoFocus />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Gönderiliyor..." : "Kod Gönder"}{!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {/* Telefon OTP adım 2 */}
      {mode === "phone" && step === "otp" && (
        <form onSubmit={submitOtp} className="mt-6 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            +90 {phone} numarasına kod gönderildi
          </p>
          <OtpInput value={otp} onChange={setOtp} autoFocus />
          {devOtp && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-700">
              Test kodu: {devOtp}
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Demo için <span className="font-bold">111111</span> girebilirsin
          </p>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}{!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => { setStep("input"); setOtp(""); setDevOtp(""); setError(""); }}
            className="w-full text-xs font-medium text-primary hover:underline">
            Numarayı değiştir
          </button>
        </form>
      )}

      {/* Email girişi */}
      {mode === "email" && (
        <form onSubmit={submitEmail} className="mt-6 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
              className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre</label>
            <PasswordInput value={password} onChange={setPassword} />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}{!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      <div className="mt-auto pt-8 text-center text-sm">
        <span className="text-muted-foreground">Hesabın yok mu? </span>
        <Link href="/kayit" className="font-semibold text-primary hover:underline">Kayıt ol</Link>
      </div>
    </div>
  );
}
