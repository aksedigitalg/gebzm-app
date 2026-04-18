"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Shield, Smartphone, LogOut, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function GuvenlikPage() {
  const { signOut } = useAuth();
  const [logoutAll, setLogoutAll] = useState(false);

  return (
    <>
      <PageHeader title="Güvenlik" back="/profil" />
      <div className="space-y-4 px-5 pb-8 pt-4">
        {/* Güvenlik durumu */}
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Hesabınız güvende</p>
            <p className="text-xs text-muted-foreground">OTP doğrulama aktif</p>
          </div>
        </div>

        {/* OTP */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">SMS Doğrulama</p>
                <p className="text-xs text-muted-foreground">Her girişte telefon doğrulaması</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">Aktif</span>
          </div>
        </div>

        {/* Güvenlik önerileri */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" />Güvenlik Önerileri
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Telefon numaranızı kimseyle paylaşmayın",
              "Doğrulama kodlarını kimseyle paylaşmayın",
              "Güvenmediğiniz cihazlarda giriş yapmayın",
              "Şüpheli bir durum fark ederseniz bize bildirin",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Tüm cihazlardan çıkış */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Tüm Cihazlardan Çıkış</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hesabınıza yetkisiz erişim şüphesi varsa tüm cihazlardan çıkış yapın.
              </p>
              {!logoutAll ? (
                <button onClick={() => setLogoutAll(true)}
                  className="mt-3 rounded-full border border-amber-400 px-4 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:text-amber-400">
                  Tüm Cihazlardan Çık
                </button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={signOut}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600">
                    Onayla
                  </button>
                  <button onClick={() => setLogoutAll(false)}
                    className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition hover:bg-muted">
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hesap silme */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <LogOut className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold">Hesabı Sil</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hesabınızı kalıcı olarak silmek için destek@gebzem.app adresine yazın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
