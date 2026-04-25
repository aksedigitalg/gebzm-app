"use client";

import { useState } from "react";
import { X, ArrowRight, Lock, Sparkles } from "lucide-react";
import { PhoneInput, isValidPhone } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthProvider";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

type Step = "credentials" | "otp" | "set-password";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  message?: string;
}

export function AuthModal({ open, onClose, onSuccess, message }: Props) {
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
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("credentials");
    setPhone(""); setPassword(""); setOtp(""); setDevOtp("");
    setNewPass(""); setNewPass2(""); setUserToken(""); setUserId("");
    setIsNew(false); setError(""); setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const post = async (path: string, data: object, token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { method: "POST", headers, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Hata oluştu");
    return json;
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Geçerli bir telefon numarası gir."); return; }
    setLoading(true);
    try {
      const check = await post("/auth/check-phone", { phone });
      if (check.has_password) {
        if (!password) { setError("Şifrenizi girin."); setLoading(false); return; }
        const res = await post("/auth/login-step1", { phone, password });
        if (res.dev_otp) setDevOtp(res.dev_otp);
        setIsNew(false);
        setStep("otp");
      } else {
        const res = await post("/auth/send-otp", { phone });
        if (res.dev_otp) setDevOtp(res.dev_otp);
        setIsNew(true);
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally { setLoading(false); }
  };

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
        setStep("set-password");
      } else {
        signIn({ phone, token: res.token, id: res.user_id });
        reset();
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod hatalı veya süresi dolmuş");
    } finally { setLoading(false); }
  };

  const submitSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPass.length < 4) { setError("Şifre en az 4 karakter."); return; }
    if (newPass !== newPass2) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    try {
      await post("/user/set-password", { password: newPass }, userToken);
    } catch { /* sessiz — token geçerliyse devam */ } finally { setLoading(false); }
    signIn({ phone, token: userToken, id: userId });
    reset();
    onSuccess();
  };

  const skipPassword = () => {
    signIn({ phone, token: userToken, id: userId });
    reset();
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl sm:p-8">

        {/* Kapat */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/70"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Başlık */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          {message && (
            <p className="mt-3 rounded-xl bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">{message}</p>
          )}
          <h2 className="mt-2 text-lg font-bold">
            {step === "credentials" && "Giriş Yap"}
            {step === "otp" && "Doğrulama Kodu"}
            {step === "set-password" && "Şifre Belirle"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "credentials" && "Telefon ve şifrenizi girin"}
            {step === "otp" && `+90 ${phone} numarasına kod gönderildi`}
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
              {loading ? "Kaydediliyor..." : "Şifreyi Kaydet ve Devam Et"}<ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={skipPassword}
              className="w-full text-xs text-muted-foreground hover:text-foreground">
              Şimdi değil, atla
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
