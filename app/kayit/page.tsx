"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, User, CheckCircle2 } from "lucide-react";
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
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
        { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, email: "" }) }
      );
    } catch { /* profil güncellemesi zorunlu değil */ }
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="flex h-[100svh] flex-col px-5 pt-5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
      <div className="flex items-center justify-between">
        <button
          onClick={step === "phone" ? () => router.push("/giris") : goBack}
          disabled={step === "done"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <StepIndicator total={3} current={stepIndex} />
        <div className="w-9" />
      </div>

      {step === "phone" && (
        <form onSubmit={submitPhone} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Hesap oluştur</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Telefon numaranı gir, doğrulama kodu gönderelim.
          </p>
          <div className="mt-8">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon</label>
            <PhoneInput value={phone} onChange={setPhone} autoFocus />
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <div className="mt-auto pt-8">
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Gönderiliyor..." : "Kod Gönder"}{!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hesabın var mı?{" "}
              <Link href="/giris" className="font-semibold text-primary hover:underline">Giriş yap</Link>
            </p>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Doğrulama Kodu</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            +90 {phone} numarasına gönderilen kodu gir.
          </p>
          <div className="mt-8">
            <OtpInput value={otp} onChange={setOtp} autoFocus />
          </div>
          {devOtp && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-700">
              Test kodu: <span className="font-mono tracking-widest">{devOtp}</span>
            </p>
          )}
          {!devOtp && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Demo için <span className="font-bold font-mono">111111</span> girebilirsin
            </p>
          )}
          {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <div className="mt-auto pt-8">
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Doğrulanıyor..." : "Doğrula"}{!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={submitProfile} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Adın ne?</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Son adım — adını gir.</p>
          <div className="mt-8">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ad Soyad</label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
              <User className="h-5 w-5 text-muted-foreground" />
              <input type="text" autoFocus placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)}
                className="h-12 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground" />
            </label>
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <div className="mt-auto pt-8">
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Kaydediliyor..." : "Hesabı Oluştur"}{!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Hoş geldin{name ? ` ${name.split(" ")[0]}` : ""}!</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Hesabın oluşturuldu. Gebze'yi keşfetmeye başlayabilirsin.
          </p>
          <button
            onClick={() => { signIn({ phone, token, id: userId }); router.replace("/"); }}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Ana sayfaya git <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
