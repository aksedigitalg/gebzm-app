"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, X } from "lucide-react";
import { setConsent } from "@/lib/geolocation-consent";

interface Props {
  open: boolean;
  onClose: () => void;
  // Kullanıcı rıza verdiğinde tetiklenir — burada konum istenmeli
  onAccept: () => void;
}

export function LocationConsentDialog({ open, onClose, onAccept }: Props) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!open) setAgreed(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">Konum Kullanımı</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* AYDINLATMA — KVKK 2026/347 ilke kararı: aydınlatma ve rıza ayrı başlık */}
          <section className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-foreground">
              Bilgilendirme (Aydınlatma)
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <b className="text-foreground">Akse Dijital Reklam ve Yazılım</b> (
              <Link href="https://gebzem.app" className="underline" target="_blank">
                gebzem.app
              </Link>
              ) olarak, konum bilgini sadece sana yakın yerleri haritada
              göstermek ve listeleri uzaklığa göre sıralamak için kullanıyoruz.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  Konum verin <b>tarayıcında</b> tutulur, sunucumuza
                  gönderilmez.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  <b>30 dakika</b> sonra otomatik silinir.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  İstediğin zaman tarayıcı ayarlarından veya profilinden
                  geri çekebilirsin.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  Üçüncü kişilerle <b>paylaşılmaz</b>.
                </span>
              </li>
            </ul>
            <Link
              href="/gizlilik/konum"
              target="_blank"
              className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Detaylı KVKK aydınlatma metnini oku →
            </Link>
          </section>

          {/* RIZA — ayrı başlık altında */}
          <section className="rounded-2xl border border-border bg-muted/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Açık Rıza</h3>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
              />
              <span className="text-xs leading-relaxed text-foreground">
                Konum bilgimin yukarıda belirtilen amaçlarla işlenmesine
                <b> açık rıza veriyorum</b>. Bu rızayı istediğim zaman geri
                çekebileceğimi biliyorum.
              </span>
            </label>
          </section>
        </div>

        {/* Aksiyon */}
        <div
          className="flex gap-2 border-t border-border bg-card px-5 py-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={() => {
              setConsent("denied");
              onClose();
            }}
            className="flex-1 rounded-full border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={() => {
              setConsent("granted");
              onAccept();
            }}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
