"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User, CheckCircle2, ChevronLeft } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

type Step = "phone" | "otp" | "profile" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const stepIndex = { phone: 0, otp: 1, profile: 2, done: 2 }[step];

  const goBack = () => {
    setError("");
    if (step === "otp") setStep("phone");
    else if (step === "profile") setStep("otp");
  };

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
      setToken(res.token);
      setUserId(res.user_id);
      setStep("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod hatalı veya süresi dolmuş");
    } finally { setLoading(false); }
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Adını yaz."); return; }
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email: "" }),
      });
    } catch { }
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">

          {/* Üst bar */}
          {step !== "done" && (
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={step === "phone" ? () => router.push("/giris") : goBack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <StepIndicator total={3} current={stepIndex} />
              <div className="w-9" />
            </div>
          )}

          {/* Telefon */}
          {step === "phone" && (
            <form onSubmit={submitPhone} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold">Hesap oluştur</h1>
                <p className="mt-1 text-sm text-muted-foreground">Telefon numaranı gir, doğrulama kodu gönderelim.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon Numarası</label>
                <PhoneInput value={phone} onChange={setPhone} autoFocus />
              </div>
              {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Gönderiliyor..." : "Kod Gönder"}{!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Hesabın var mı?{" "}
                <Link href="/giris" className="font-semibold text-primary hover:underline">Giriş yap</Link>
              </p>
            </form>
          )}

          {/* OTP */}
          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold">Doğrulama Kodu</h1>
                <p className="mt-1 text-sm text-muted-foreground">+90 {phone} numarasına gönderilen kodu gir.</p>
              </div>
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
                {loading ? "Doğrulanıyor..." : "Doğrula"}{!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Profil */}
          {step === "profile" && (
            <form onSubmit={submitProfile} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold">Adın ne?</h1>
                <p className="mt-1 text-sm text-muted-foreground">Son adım — adını gir.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ad Soyad</label>
                <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <input type="text" autoFocus placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground" />
                </label>
              </div>
              {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Kaydediliyor..." : "Hesabı Oluştur"}{!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Tamamlandı */}
          {step === "done" && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                Hoş geldin{name ? ` ${name.split(" ")[0]}` : ""}!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hesabın oluşturuldu. Gebze'yi keşfetmeye başlayabilirsin.
              </p>
              <button
                onClick={() => { signIn({ phone, token, id: userId }); router.replace("/"); }}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Ana sayfaya git <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Kayıt olarak{" "}
          <Link href="/hakkinda" className="hover:underline">Kullanım Koşulları</Link>'nı kabul etmiş olursun.
        </p>
      </div>
    </div>
  );
}
