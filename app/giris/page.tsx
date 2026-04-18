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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) {
      setError("Geçerli bir telefon numarası gir (10 hane).");
      return;
    }
    setLoading(true);
    try {
      await api.auth.sendOTP(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("6 haneli doğrulama kodunu gir.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.verifyOTP(phone, otp);
      signIn({ phone, token: res.token, id: res.user_id });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod hatalı veya süresi dolmuş");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-[100svh] flex-col px-5 pt-10"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {step === "phone" ? "Tekrar hoş geldin" : "Doğrulama Kodu"}
        </h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          {step === "phone"
            ? "Telefon numaranı gir, sana bir kod göndereceğiz."
            : `+90 ${phone} numarasına gönderilen 6 haneli kodu gir.`}
        </p>
      </div>

      {step === "phone" && (
        <form onSubmit={submitPhone} className="mt-10 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Telefon
            </label>
            <PhoneInput value={phone} onChange={setPhone} autoFocus />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Kod Gönder"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="mt-10 space-y-4">
          <OtpInput value={otp} onChange={setOtp} autoFocus />

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
            className="w-full text-xs font-medium text-primary hover:underline"
          >
            Numarayı değiştir
          </button>
        </form>
      )}

      <div className="mt-auto pt-8 text-center text-sm">
        <span className="text-muted-foreground">Hesabın yok mu? </span>
        <Link href="/kayit" className="font-semibold text-primary hover:underline">
          Kayıt ol
        </Link>
      </div>
    </div>
  );
}
