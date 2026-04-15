"use client";

import { Save, Bell, CreditCard, Lock } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Hesap Ayarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          İşletme hesap tercihleriniz
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={Bell} title="Bildirimler">
          <Toggle label="Yeni rezervasyon" defaultChecked />
          <Toggle label="Yeni mesaj" defaultChecked />
          <Toggle label="Yeni yorum" defaultChecked />
          <Toggle label="Pazarlama e-postaları" />
        </Section>

        <Section icon={CreditCard} title="Ödeme & Fatura">
          <Field label="Fatura Adı" defaultValue="Gebze Mangal Evi Gıda San. Tic. Ltd. Şti." />
          <Field label="Vergi No" defaultValue="1234567890" />
          <Field label="IBAN" defaultValue="TR00 0000 0000 0000 0000 0000 00" />
        </Section>

        <Section icon={Lock} title="Güvenlik">
          <Field label="Mevcut Şifre" type="password" defaultValue="" />
          <Field label="Yeni Şifre" type="password" defaultValue="" />
          <Toggle label="İki Faktörlü Doğrulama" />
        </Section>

        <Section icon={Save} title="Abonelik">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
            <p className="text-sm font-semibold">Premium Plan</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sonraki yenileme: 15 Mayıs 2026
            </p>
            <p className="mt-2 text-2xl font-bold text-primary">₺299/ay</p>
            <button className="mt-3 w-full rounded-lg border border-border bg-card py-2 text-xs font-semibold transition hover:bg-muted">
              Planı Yönet
            </button>
          </div>
        </Section>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Save;
  title: string;
  children: React.ReactNode;
}) {
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

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-primary" />
    </label>
  );
}
