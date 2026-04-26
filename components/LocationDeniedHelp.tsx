"use client";

import { ShieldAlert, X, Globe, Smartphone } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Tarayıcı izni reddedildiğinde adım adım açma rehberi.
export function LocationDeniedHelp({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-base font-bold">Konum Engellenmiş</h2>
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
          <p className="mb-4 text-sm text-muted-foreground">
            Tarayıcın konum erişimini engellemiş. Aşağıdaki adımları izleyerek
            açabilir veya alternatif olarak{" "}
            <b className="text-foreground">Manuel Mod</b> (✛) butonu ile
            haritaya tıklayarak konumunu kendin seçebilirsin.
          </p>

          {/* Chrome / Edge */}
          <Section icon={<Globe className="h-4 w-4" />} title="Chrome / Edge / Brave">
            <Step n="1">Adres çubuğunun solundaki <b>kilit</b> 🔒 ikonuna tıkla</Step>
            <Step n="2">Açılan menüde <b>"Konum"</b>'u bul</Step>
            <Step n="3"><b>"İzin Ver"</b> seç</Step>
            <Step n="4">Sayfayı <b>yenile</b> (Ctrl+R / F5)</Step>
          </Section>

          {/* Safari */}
          <Section icon={<Globe className="h-4 w-4" />} title="Safari (Mac)">
            <Step n="1">Üst menüden: <b>Safari → Ayarlar → Web Siteleri → Konum</b></Step>
            <Step n="2"><code>gebzem.app</code> satırında <b>"İzin Ver"</b> seç</Step>
            <Step n="3">Sayfayı yenile</Step>
          </Section>

          {/* iOS */}
          <Section icon={<Smartphone className="h-4 w-4" />} title="iPhone Safari">
            <Step n="1">Adres çubuğundaki <b>"Aa"</b> ikonuna tıkla</Step>
            <Step n="2"><b>Web Sitesi Ayarları → Konum → İzin Ver</b></Step>
            <Step n="3">Ayrıca: iPhone <b>Ayarlar → Gizlilik → Konum Servisleri → Safari → Hassas Konum</b> AÇIK olmalı</Step>
            <Step n="4">Sayfayı yenile</Step>
          </Section>

          {/* Firefox */}
          <Section icon={<Globe className="h-4 w-4" />} title="Firefox">
            <Step n="1">Adres çubuğunun solundaki <b>kilit</b> ikonuna tıkla</Step>
            <Step n="2"><b>"Bağlantı Güvenli" → "Daha Fazla"</b> menüsünden izinler</Step>
            <Step n="3"><b>"Konuma Erişim"</b> → <b>"Engellemeyi Kaldır"</b></Step>
            <Step n="4">Sayfayı yenile</Step>
          </Section>
        </div>

        {/* Aksiyon */}
        <div
          className="border-t border-border bg-card px-5 py-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-muted/40 p-3">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
        {icon}
        {title}
      </h3>
      <ol className="space-y-1.5 pl-1">{children}</ol>
    </section>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
        {n}
      </span>
      <span className="flex-1 pt-0.5">{children}</span>
    </li>
  );
}
