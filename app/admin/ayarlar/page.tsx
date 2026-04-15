"use client";

import { Save, Globe, Bell, Shield, DollarSign } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform geneli yapılandırma
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={Globe} title="Genel" description="Platform bilgileri">
          <Field label="Platform Adı" defaultValue="Gebzem" />
          <Field label="Destek E-posta" defaultValue="destek@gebzem.com" />
          <Field label="Varsayılan Dil" defaultValue="Türkçe" />
        </Section>

        <Section icon={Bell} title="Bildirimler" description="E-posta ve push">
          <Toggle label="Yeni işletme başvurusu" defaultChecked />
          <Toggle label="Raporlanan içerik" defaultChecked />
          <Toggle label="Ödeme uyarıları" defaultChecked />
          <Toggle label="Haftalık rapor" />
        </Section>

        <Section icon={Shield} title="Güvenlik" description="Erişim ve yetkiler">
          <Toggle label="İki Faktörlü Doğrulama" defaultChecked />
          <Toggle label="IP Kısıtlaması" />
          <Field label="Oturum Süresi (dk)" defaultValue="60" />
        </Section>

        <Section icon={DollarSign} title="Komisyon & Ödeme" description="Finansal ayarlar">
          <Field label="Platform Komisyon Oranı (%)" defaultValue="8" />
          <Field label="Minimum Sipariş (₺)" defaultValue="50" />
          <Field label="Teslimat Ücreti Üst Limit (₺)" defaultValue="30" />
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
  description,
  children,
}: {
  icon: typeof Save;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
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
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-muted before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow-md before:transition checked:bg-primary checked:before:translate-x-5 relative"
      />
    </label>
  );
}
