"use client";

import { useState } from "react";
import { Save, Upload, MapPin, Phone, Clock, FileText } from "lucide-react";

export default function Page() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İşletme Profilim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşterilere görünen profil bilgilerinizi düzenleyin
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Kapak fotoğrafı */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Kapak & Logo</h3>
          <div className="relative flex h-40 items-end overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-700">
            <button
              type="button"
              className="m-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-white"
            >
              <Upload className="h-3.5 w-3.5" />
              Kapak Yükle
            </button>
          </div>
        </div>

        {/* Temel bilgiler */}
        <Section icon={FileText} title="Temel Bilgiler">
          <Field label="İşletme Adı" defaultValue="Gebze Mangal Evi" />
          <Field label="Kategori" defaultValue="Türk Mutfağı · Mangal" />
          <Textarea
            label="Kısa Açıklama"
            defaultValue="Gebze'nin köklü mangal evlerinden. Dana kuşbaşı, kuzu pirzola ve ızgara köftesi meşhur."
          />
        </Section>

        {/* İletişim */}
        <Section icon={MapPin} title="Adres & İletişim">
          <Field label="Adres" defaultValue="Mustafa Paşa Mah., Gebze" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Telefon" defaultValue="0 262 641 11 22" icon={<Phone className="h-4 w-4" />} />
            <Field label="E-posta" defaultValue="info@gebzemangal.com" />
          </div>
        </Section>

        {/* Çalışma saatleri */}
        <Section icon={Clock} title="Çalışma Saatleri">
          {["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map((day) => (
            <div key={day} className="grid grid-cols-[100px_1fr_1fr] items-center gap-3">
              <span className="text-sm font-medium">{day}</span>
              <input
                type="time"
                defaultValue="12:00"
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="time"
                defaultValue="00:00"
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </Section>

        {/* Özellikler */}
        <Section icon={FileText} title="Özellikler">
          <div className="grid gap-2 sm:grid-cols-2">
            {["Açık Hava", "Otopark", "WiFi", "Rezervasyon", "Kredi Kartı", "Engelli Erişim"].map((f, i) => (
              <Toggle key={f} label={f} defaultChecked={i < 4} />
            ))}
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-sm font-semibold text-emerald-600">
              ✓ Değişiklikler kaydedildi
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Save; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, defaultValue, icon }: { label: string; defaultValue: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          type="text"
          defaultValue={defaultValue}
          className={`h-10 w-full rounded-lg border border-border bg-background text-sm outline-none focus:border-primary ${icon ? "pl-9 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function Textarea({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        rows={3}
        defaultValue={defaultValue}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-primary" />
    </label>
  );
}
