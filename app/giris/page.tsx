"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthProvider";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

// Giriş akışı:
// Mevcut kullanıcı (şifresi var): Telefon + Şifre gir → OTP gelir → OTP gir → Giriş
// Yeni kullanıcı: Telefon gir → OTP gelir → OTP gir → Şifre belirle → Giriş

type Step = "credentials" | "otp" | "set-password";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [userToken, setUserToken] = useState("");
  const [userId, setUserId] = useState("");
  const [isNew, setIsNew] = useState(false); // yeni kullanıcı mı
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const post = async (path: string, data: object, token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { method: "POST", headers, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Hata oluştu");
    return json;
  };

  // Adım 1: Telefon + şifre gönder
  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Geçerli bir telefon numarası gir."); return; }

    setLoading(true);
    try {
      // Kullanıcı var mı + şifresi var mı kontrol et
      const check = await post("/auth/check-phone", { phone });

      if (check.has_password) {
        // Şifresi var → şifre kontrolü yap + OTP gönder
        if (!password) { setError("Şifrenizi girin."); setLoading(false); return; }
        const res = await post("/auth/login-step1", { phone, password });
        if (res.dev_otp) setDevOtp(res.dev_otp);
        setIsNew(false);
        setStep("otp");
      } else {
        // Yeni kullanıcı veya şifresi yok → direkt OTP gönder
        const res = await post("/auth/send-otp", { phone });
        if (res.dev_otp) setDevOtp(res.dev_otp);
        setIsNew(true);
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally { setLoading(false); }
  };

  // Adım 2: OTP doğrula
  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("6 haneli kodu gir."); return; }
    setLoading(true);
    try {
      const res = await post("/auth/verify-otp", { phone, code: otp });
      setUserToken(res.token);
      setUserId(res.user_id);
      if (isNew) {
        setStep("set-password"); // Yeni kullanıcı → şifre belirlesin
      } else {
        signIn({ phone, token: res.token, id: res.user_id });
        router.replace("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod hatalı veya süresi dolmuş");
    } finally { setLoading(false); }
  };

  // Adım 3: Şifre belirle (yeni kullanıcı)
  const submitSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPass.length < 4) { setError("Şifre en az 4 karakter."); return; }
    if (newPass !== newPass2) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    try {
      await post("/user/set-password", { password: newPass }, userToken);
      signIn({ phone, token: userToken, id: userId });
      router.replace("/");
    } catch {
      signIn({ phone, token: userToken, id: userId });
      router.replace("/");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">
            {step === "credentials" && "Giriş Yap"}
            {step === "otp" && "Doğrulama Kodu"}
            {step === "set-password" && "Şifre Belirle"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {step === "credentials" && "Telefon ve şifrenizi girin"}
            {step === "otp" && `+90 ${phone} numarasına gönderilen kodu gir`}
            {step === "set-password" && "Sonraki girişlerde kullanmak için şifre belirle"}
          </p>
        </div>

        {/* Adım 1: Telefon + Şifre */}
        {step === "credentials" && (
          <form onSubmit={submitCredentials} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon</label>
              <PhoneInput value={phone} onChange={setPhone} autoFocus />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Şifre <span className="text-muted-foreground/60">(ilk girişte boş bırakın)</span>
              </label>
              <PasswordInput value={password} onChange={setPassword} placeholder="Şifreniz" />
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Kontrol ediliyor..." : "Kod Gönder"}<ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link href="/kayit" className="font-semibold text-primary hover:underline">Kayıt ol</Link>
            </p>
          </form>
        )}

        {/* Adım 2: OTP */}
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
              {loading ? "Doğrulanıyor..." : "Giriş Yap"}<ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => { setStep("credentials"); setOtp(""); setDevOtp(""); setError(""); }}
              className="w-full text-xs font-medium text-primary hover:underline">
              Geri dön
            </button>
          </form>
        )}

        {/* Adım 3: Şifre belirle */}
        {step === "set-password" && (
          <form onSubmit={submitSetPassword} className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Bir sonraki girişte bu şifre ile direkt OTP alabilirsiniz.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre</label>
              <PasswordInput value={newPass} onChange={setNewPass} autoFocus />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre Tekrar</label>
              <PasswordInput value={newPass2} onChange={setNewPass2} placeholder="Şifre tekrar" />
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Kaydediliyor..." : "Şifreyi Kaydet ve Giriş Yap"}<ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => {
              signIn({ phone, token: userToken, id: userId });
              router.replace("/");
            }} className="w-full text-xs text-muted-foreground hover:text-foreground">
              Şimdi değil, atla
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
