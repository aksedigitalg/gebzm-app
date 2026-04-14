"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { PasswordInput } from "@/components/PasswordInput";
import { OtpInput } from "@/components/OtpInput";

type Step = "phone" | "otp" | "new" | "done";

export default function ForgotPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const stepIndex = { phone: 0, otp: 1, new: 2, done: 2 }[step];

  const goBack = () => {
    setError("");
    if (step === "otp") setStep("phone");
    else if (step === "new") setStep("otp");
  };

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) {
      setError("Geçerli bir telefon numarası gir.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setStep("otp");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("6 haneli doğrulama kodunu gir.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setStep("new");
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 4) {
      setError("Şifre en az 4 karakter olmalı.");
      return;
    }
    if (password !== passwordRepeat) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="flex min-h-[100svh] flex-col px-6 pt-5 pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={step === "phone" ? () => router.push("/giris") : goBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          aria-label="Geri"
          disabled={step === "done"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <StepIndicator total={3} current={stepIndex} />
        <div className="w-9" />
      </div>

      {step === "phone" && (
        <form onSubmit={submitPhone} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Şifreni mi unuttun?</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Hesabına kayıtlı telefon numaranı gir, sana doğrulama kodu gönderelim.
          </p>

          <div className="mt-8">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Telefon
            </label>
            <PhoneInput value={phone} onChange={setPhone} autoFocus />
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Gönderiliyor..." : "Kod Gönder"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hatırladın mı?{" "}
              <Link href="/giris" className="font-semibold text-primary hover:underline">
                Giriş yap
              </Link>
            </p>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Doğrulama Kodu</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            +90 {phone} numarasına gönderilen 6 haneli kodu gir.
          </p>

          <div className="mt-8">
            <OtpInput value={otp} onChange={setOtp} autoFocus />
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Numarayı değiştir
          </button>

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Doğrulanıyor..." : "Doğrula"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}

      {step === "new" && (
        <form onSubmit={submitNewPassword} className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Yeni Şifre</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Hesabın için yeni bir şifre belirle.
          </p>

          <div className="mt-8 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Yeni Şifre
              </label>
              <PasswordInput value={password} onChange={setPassword} autoFocus />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Yeni Şifre (Tekrar)
              </label>
              <PasswordInput
                value={passwordRepeat}
                onChange={setPasswordRepeat}
                placeholder="Şifre tekrar"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Şifren Güncellendi</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Yeni şifrenle artık giriş yapabilirsin.
          </p>
          <button
            onClick={() => router.push("/giris")}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Giriş Sayfasına Dön
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
