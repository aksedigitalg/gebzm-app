"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Building, Clock, CreditCard, Loader2, Save, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { getBusinessSession } from "@/lib/panel-auth";

export default function TeslimatAyarlariPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [acceptsOrders, setAcceptsOrders] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [radiusKm, setRadiusKm] = useState(5);
  const [estimatedMin, setEstimatedMin] = useState(30);

  const [acceptsCash, setAcceptsCash] = useState(true);
  const [acceptsCardAtDoor, setAcceptsCardAtDoor] = useState(true);
  const [acceptsEft, setAcceptsEft] = useState(false);

  const [eftIban, setEftIban] = useState("");
  const [eftBank, setEftBank] = useState("");
  const [eftHolder, setEftHolder] = useState("");

  const [openHour, setOpenHour] = useState(10);
  const [closeHour, setCloseHour] = useState(23);

  useEffect(() => {
    const session = getBusinessSession();
    if (!session?.token) {
      router.replace("/isletme/giris");
      return;
    }
    api.business
      .getDeliverySettings()
      .then(d => {
        setAcceptsOrders(d.accepts_orders === true);
        setDeliveryFee(Number(d.delivery_fee || 0));
        setFreeThreshold(Number(d.free_delivery_threshold || 0));
        setMinOrder(Number(d.min_order_amount || 0));
        setRadiusKm(Number(d.delivery_radius_km || 5));
        setEstimatedMin(Number(d.estimated_delivery_min || 30));
        setAcceptsCash(d.accepts_cash !== false);
        setAcceptsCardAtDoor(d.accepts_card_at_door !== false);
        setAcceptsEft(d.accepts_eft === true);
        setEftIban(String(d.eft_iban || ""));
        setEftBank(String(d.eft_bank_name || ""));
        setEftHolder(String(d.eft_account_holder || ""));
        setOpenHour(Number(d.open_hour ?? 10));
        setCloseHour(Number(d.close_hour ?? 23));
        setLoading(false);
      })
      .catch(() => {
        // Backend hazır değil — default'larla devam
        setLoading(false);
      });
  }, [router]);

  const submit = async () => {
    setSaving(true);
    setSavedNote("");
    setError("");

    // IBAN doğrulama (basit: TR ile başla, 26 karakter)
    if (acceptsEft && eftIban) {
      const cleaned = eftIban.replace(/\s/g, "").toUpperCase();
      if (!/^TR\d{24}$/.test(cleaned)) {
        setError("IBAN formatı geçersiz (TR ile başlayan 26 karakter olmalı)");
        setSaving(false);
        return;
      }
    }

    if (openHour >= closeHour) {
      setError("Açılış saati kapanış saatinden önce olmalı");
      setSaving(false);
      return;
    }

    try {
      await api.business.updateDeliverySettings({
        accepts_orders: acceptsOrders,
        delivery_fee: deliveryFee,
        free_delivery_threshold: freeThreshold > 0 ? freeThreshold : undefined,
        min_order_amount: minOrder,
        delivery_radius_km: radiusKm,
        estimated_delivery_min: estimatedMin,
        accepts_cash: acceptsCash,
        accepts_card_at_door: acceptsCardAtDoor,
        accepts_eft: acceptsEft,
        eft_iban: eftIban.replace(/\s/g, "").toUpperCase(),
        eft_bank_name: eftBank,
        eft_account_holder: eftHolder,
        open_hour: openHour,
        close_hour: closeHour,
      });
      setSavedNote("Ayarlar kaydedildi ✓");
      setTimeout(() => setSavedNote(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Teslimat Ayarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sipariş ücretleri, ödeme yöntemleri ve çalışma saatleri
        </p>
      </header>

      {/* Açık/Kapalı toggle */}
      <Card>
        <Toggle
          label="Online sipariş kabul ediyorum"
          description="Kapalıysan menü görünür ama 'Sipariş Ver' devre dışı olur"
          checked={acceptsOrders}
          onChange={setAcceptsOrders}
        />
      </Card>

      {/* Teslimat */}
      <Section title="Teslimat" icon={Truck}>
        <NumberInput
          label="Teslimat Ücreti (₺)"
          value={deliveryFee}
          onChange={setDeliveryFee}
          min={0}
          step={1}
        />
        <NumberInput
          label="Ücretsiz Teslimat Eşiği (₺) — opsiyonel"
          description="Sipariş bu tutarın üstündeyse teslimat ücretsiz"
          value={freeThreshold}
          onChange={setFreeThreshold}
          min={0}
          step={5}
        />
        <NumberInput
          label="Minimum Sipariş Tutarı (₺)"
          value={minOrder}
          onChange={setMinOrder}
          min={0}
          step={5}
        />
        <NumberInput
          label="Teslimat Yarıçapı (km)"
          description="Bu mesafe dışına teslimat yapma"
          value={radiusKm}
          onChange={setRadiusKm}
          min={0.5}
          max={20}
          step={0.5}
        />
        <NumberInput
          label="Tahmini Teslimat Süresi (dk)"
          description="Müşteriye ortalama bekleme süresi gösterilir"
          value={estimatedMin}
          onChange={setEstimatedMin}
          min={5}
          max={180}
          step={5}
        />
      </Section>

      {/* Çalışma saati */}
      <Section title="Çalışma Saatleri" icon={Clock}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Açılış
            </label>
            <select
              value={openHour}
              onChange={e => setOpenHour(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Kapanış
            </label>
            <select
              value={closeHour}
              onChange={e => setCloseHour(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map(i => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Ödeme yöntemleri */}
      <Section title="Kabul Edilen Ödeme Yöntemleri">
        <div className="space-y-2">
          <PaymentToggle
            icon={Banknote}
            label="Kapıda Nakit"
            checked={acceptsCash}
            onChange={setAcceptsCash}
          />
          <PaymentToggle
            icon={CreditCard}
            label="Kapıda Kart (POS)"
            checked={acceptsCardAtDoor}
            onChange={setAcceptsCardAtDoor}
          />
          <PaymentToggle
            icon={Building}
            label="Havale / EFT"
            checked={acceptsEft}
            onChange={setAcceptsEft}
          />
        </div>

        {acceptsEft && (
          <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Banka Bilgileri (müşteri görür)
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                IBAN
              </label>
              <input
                type="text"
                value={eftIban}
                onChange={e =>
                  setEftIban(e.target.value.toUpperCase().slice(0, 32))
                }
                placeholder="TR12 3456 7890 1234 5678 9012 34"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Banka Adı
              </label>
              <input
                type="text"
                value={eftBank}
                onChange={e => setEftBank(e.target.value.slice(0, 100))}
                placeholder="Ziraat Bankası"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Hesap Sahibi
              </label>
              <input
                type="text"
                value={eftHolder}
                onChange={e => setEftHolder(e.target.value.slice(0, 200))}
                placeholder="Ahmet Lokanta Ltd. Şti."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </Section>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {savedNote && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          {savedNote}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Ayarları Kaydet
      </button>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">{children}</div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Truck;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        {Icon && <Icon className="h-4 w-4 text-primary" />} {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full transition"
        style={{
          backgroundColor: checked ? "#10b981" : "#e5e7eb",
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="ml-0.5 h-5 w-5 rounded-full bg-white shadow transition"
          style={{
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  );
}

function PaymentToggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: typeof Banknote;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
        checked
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function NumberInput({
  label,
  description,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {description && (
        <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
