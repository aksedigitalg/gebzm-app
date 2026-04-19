"use client";

import { useEffect, useState, useRef } from "react";
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react";
import { getBusinessSession } from "@/lib/panel-auth";

export default function QRMenuPage() {
  const [session, setSession] = useState<ReturnType<typeof getBusinessSession>>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setSession(getBusinessSession());
  }, []);

  const menuUrl = session?.id ? `https://gebzem.app/restoran/${session.id}` : "";
  const qrUrl = menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}&color=0e7490&bgcolor=ffffff&margin=20` : "";

  const copy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "gebzem-qr-menu.png";
    link.click();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">QR Menü</h1>
        <p className="mt-1 text-sm text-muted-foreground">Müşterileriniz QR kodu okutarak menünüze ulaşabilir</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Kod */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8">
          {qrUrl ? (
            <>
              <div className="rounded-2xl border-4 border-primary/20 p-2 shadow-lg">
                <img ref={qrRef} src={qrUrl} alt="QR Menu" className="h-52 w-52" />
              </div>
              <p className="mt-4 text-xs font-semibold text-muted-foreground">GEBZEM MENÜ</p>
              <p className="text-xs text-muted-foreground">{session?.name}</p>
              <div className="mt-5 flex gap-3">
                <button onClick={download}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                  <Download className="h-4 w-4" />İndir
                </button>
                <button onClick={copy}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted">
                  {copied ? <><Check className="h-4 w-4 text-emerald-500" />Kopyalandı</> : <><Copy className="h-4 w-4" />Link Kopyala</>}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <QrCode className="mx-auto h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
              <p className="mt-3 text-sm text-muted-foreground">QR kod yükleniyor...</p>
            </div>
          )}
        </div>

        {/* Kullanım Kılavuzu */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Menü Linki</h3>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <p className="flex-1 truncate text-xs text-muted-foreground">{menuUrl || "Yükleniyor..."}</p>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Nasıl Kullanılır?</h3>
            <ol className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "QR kodu indirin veya yazdırın",
                "Masalara, kapılara veya menü standlarına yerleştirin",
                "Müşteriler kamerasını QR'a tutarak menüye ulaşır",
                "Menünüzü güncellediğinizde QR aynı kalır",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-primary">İpucu</p>
            <p className="mt-1">Menü → Ürün Ekle sayfasından menünüzü doldurun. QR kodu okutan müşteriler güncel menünüzü görecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
