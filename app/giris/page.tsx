"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) {
      setError("Geçerli bir telefon numarası gir (10 hane).");
      return;
    }
    if (password.length < 4) {
      setError("Şifre en az 4 karakter olmalı.");
      return;
    }
    setLoading(true);
    // mock: 800ms bekle, sonra ana sayfaya git
    await new Promise((r) => setTimeout(r, 800));
    signIn({ phone });
    router.replace("/");
  };

  return (
    <div className="flex min-h-[100svh] flex-col px-6 pt-12">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Tekrar hoş geldin
        </h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Hesabına giriş yaparak Gebzem&apos;in tüm özelliklerine eriş.
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Telefon
          </label>
          <PhoneInput value={phone} onChange={setPhone} autoFocus />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Şifre
            </label>
            <Link
              href="/sifremi-unuttum"
              className="text-xs font-medium text-primary hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
          <PasswordInput value={password} onChange={setPassword} />
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
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-auto pb-10 pt-8 text-center text-sm">
        <span className="text-muted-foreground">Hesabın yok mu? </span>
        <Link
          href="/kayit"
          className="font-semibold text-primary hover:underline"
        >
          Kayıt ol
        </Link>
      </div>
    </div>
  );
}
