"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useGeolocation } from "@/lib/use-geolocation";
import { setConsent } from "@/lib/geolocation-consent";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
  type UserAddress,
} from "@/lib/types/order";

export const dynamic = "force-dynamic";

export default function OdemePage() {
  const router = useRouter();
  const { cart, total, clear } = useCart();
  const geo = useGeolocation();

  const [loggedIn, setLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState(false);

  // Form
  const [addressText, setAddressText] = useState("");
  const [district, setDistrict] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("nakit");
  const [userNote, setUserNote] = useState("");

  // Kayıtlı adresler
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");

  // Delivery settings
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [acceptsCash, setAcceptsCash] = useState(true);
  const [acceptsCardAtDoor, setAcceptsCardAtDoor] = useState(true);
  const [acceptsEft, setAcceptsEft] = useState(false);
  const [eftIban, setEftIban] = useState("");
  const [eftBank, setEftBank] = useState("");
  const [eftHolder, setEftHolder] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Login kontrolü
  useEffect(() => {
    const user = getUser();
    if (!user?.token) {
      setAuthModal(true);
      return;
    }
    setLoggedIn(true);
    setContactPhone(user.phone || "");
    setContactName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
  }, []);

  // Kayıtlı adresler + delivery settings yükle
  useEffect(() => {
    if (!loggedIn || !cart) return;
    let cancelled = false;
    (async () => {
      try {
        const addrs = (await api.user.getAddresses().catch(() => [])) as UserAddress[];
        if (!cancelled) {
          setSavedAddresses(addrs);
          const def = addrs.find(a => a.is_default);
          if (def) {
            setSelectedAddressId(def.id);
            setAddressText(def.address);
            setDistrict(def.district || "");
            if (def.contact_name) setContactName(def.contact_name);
            if (def.contact_phone) setContactPhone(def.contact_phone);
          }
        }
      } catch {
        /* ignore */
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1"}/businesses/${cart.businessId}/delivery`;
        const res = await fetch(url);
        if (res.ok) {
          const d = await res.json();
          if (!cancelled) {
            setDeliveryFee(Number(d.delivery_fee || 0));
            setMinOrder(Number(d.min_order_amount || 0));
            setAcceptsCash(d.accepts_cash !== false);
            setAcceptsCardAtDoor(d.accepts_card_at_door !== false);
            setAcceptsEft(d.accepts_eft === true);
            setEftIban(String(d.eft_iban || ""));
            setEftBank(String(d.eft_bank_name || ""));
            setEftHolder(String(d.eft_account_holder || ""));
            // Varsayılan ödeme yöntemini kabul edilen ilk yönteme ayarla
            if (d.accepts_cash === false && d.accepts_card_at_door !== false) {
              setPaymentMethod("kart_kapida");
            } else if (
              d.accepts_cash === false &&
              d.accepts_card_at_door === false &&
              d.accepts_eft
            ) {
              setPaymentMethod("eft");
            }
          }
        }
      } catch {
        /* backend hazır değilse default'lar kullanılır */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, cart]);

  // Sepet boşsa anasayfaya dön
  useEffect(() => {
    if (loggedIn && (!cart || cart.items.length === 0)) {
      router.replace("/");
    }
  }, [cart, loggedIn, router]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setAddressText("");
      setDistrict("");
      return;
    }
    const a = savedAddresses.find(a => a.id === id);
    if (a) {
      setAddressText(a.address);
      setDistrict(a.district || "");
      if (a.contact_name) setContactName(a.contact_name);
      if (a.contact_phone) setContactPhone(a.contact_phone);
    }
  };

  const handleUseLocation = async () => {
    setConsent("granted");
    const result = await geo.request();
    if (result.coords) {
      // Konum alındı — adres metni yoksa kullanıcıya yardım için "konum kullanıldı"
      // (gerçek adres reverse geocoding ileride)
    }
  };

  const subtotal = total;
  const grandTotal = subtotal + deliveryFee;
  const minNotMet = minOrder > 0 && subtotal < minOrder;

  const submit = async () => {
    if (submitting || !cart) return;
    setError("");

    if (!addressText.trim() || addressText.trim().length < 10) {
      setError("Lütfen teslimat adresini detaylı gir (min 10 karakter)");
      return;
    }
    if (!contactPhone.trim()) {
      setError("Telefon numarası zorunlu");
      return;
    }
    if (minNotMet) {
      setError(`Minimum sipariş tutarı ${minOrder} ₺`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.user.createOrder({
        business_id: cart.businessId,
        items: cart.items.map(i => ({
          menu_item_id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          note: i.note,
        })),
        payment_method: paymentMethod,
        delivery_address: addressText.trim(),
        delivery_lat: geo.coords?.lat,
        delivery_lng: geo.coords?.lng,
        delivery_district: district.trim() || undefined,
        contact_phone: contactPhone.trim(),
        contact_name: contactName.trim() || undefined,
        user_note: userNote.trim() || undefined,
      });

      // Yeni adres kaydet (opsiyonel)
      if (saveNewAddress && selectedAddressId === "new") {
        try {
          await api.user.createAddress({
            label: newAddressLabel.trim() || "Adresim",
            address: addressText.trim(),
            district: district.trim() || undefined,
            lat: geo.coords?.lat,
            lng: geo.coords?.lng,
            contact_phone: contactPhone.trim(),
            contact_name: contactName.trim() || undefined,
            is_default: savedAddresses.length === 0,
          });
        } catch {
          /* sipariş kaydedildi, adres kaydı başarısız — sessiz */
        }
      }

      clear();
      router.replace(`/profil/siparislerim/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş oluşturulamadı");
      setSubmitting(false);
    }
  };

  if (!cart) return null;

  return (
    <div className="px-5 pb-10 pt-4 lg:pt-6">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Geri
      </Link>

      <h1 className="mb-1 text-xl font-bold">Sipariş Onayı</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {cart.businessName} · {cart.items.length} ürün
      </p>

      {/* Adres */}
      <Section title="Teslimat Adresi" icon={MapPin}>
        {savedAddresses.length > 0 && (
          <div className="space-y-2">
            {savedAddresses.map(a => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  selectedAddressId === a.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === a.id}
                  onChange={() => handleSelectAddress(a.id)}
                  className="mt-1 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {a.label || "Adres"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {a.address}
                  </p>
                </div>
              </label>
            ))}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                selectedAddressId === "new"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === "new"}
                onChange={() => handleSelectAddress("new")}
                className="accent-primary"
              />
              <span className="text-sm font-semibold">+ Yeni adres</span>
            </label>
          </div>
        )}

        {selectedAddressId === "new" && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Mahalle / Semt
              </label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder="Cumhuriyet Mah."
                maxLength={100}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Adres Detayı *</span>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="text-primary hover:underline"
                >
                  📍 Konumumu Kullan
                </button>
              </label>
              <textarea
                value={addressText}
                onChange={e => setAddressText(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Cadde, sokak, bina, daire no, kapı yönü..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {geo.coords && (
                <p className="mt-1 text-[11px] text-emerald-600">
                  ✓ Konum eklendi (kurye için)
                </p>
              )}
            </div>
            {savedAddresses.length === 0 || true ? (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={saveNewAddress}
                  onChange={e => setSaveNewAddress(e.target.checked)}
                  className="accent-primary"
                />
                <span>Bu adresi kaydet</span>
                {saveNewAddress && (
                  <input
                    type="text"
                    value={newAddressLabel}
                    onChange={e => setNewAddressLabel(e.target.value)}
                    placeholder="Ev, İş..."
                    maxLength={50}
                    className="ml-2 flex-1 rounded border border-border bg-background px-2 py-0.5 text-xs"
                  />
                )}
              </label>
            ) : null}
          </div>
        )}
      </Section>

      {/* İletişim */}
      <Section title="İletişim Bilgileri" icon={User}>
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Ad Soyad
            </label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Telefon *
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                maxLength={20}
                placeholder="0 555 555 55 55"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Ödeme yöntemi */}
      <Section title="Ödeme Yöntemi" icon={Banknote}>
        <div className="space-y-2">
          {acceptsCash && (
            <PaymentOption
              method="nakit"
              label="Kapıda Nakit"
              description="Kurye nakit alır"
              icon={Banknote}
              checked={paymentMethod === "nakit"}
              onChange={() => setPaymentMethod("nakit")}
            />
          )}
          {acceptsCardAtDoor && (
            <PaymentOption
              method="kart_kapida"
              label="Kapıda Kart"
              description="POS cihazıyla kart"
              icon={CreditCard}
              checked={paymentMethod === "kart_kapida"}
              onChange={() => setPaymentMethod("kart_kapida")}
            />
          )}
          {acceptsEft && (
            <PaymentOption
              method="eft"
              label="Havale / EFT"
              description="Sipariş onayı sonrası IBAN bilgisi gösterilir"
              icon={Building}
              checked={paymentMethod === "eft"}
              onChange={() => setPaymentMethod("eft")}
            />
          )}
        </div>
        {paymentMethod === "eft" && eftIban && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              IBAN Bilgileri (sipariş onaylandığında ödeme yapın):
            </p>
            <p className="mt-1 font-mono text-[11px]">
              {eftIban}
              <br />
              {eftBank} · {eftHolder}
            </p>
          </div>
        )}
      </Section>

      {/* Not */}
      <Section title="Sipariş Notu (opsiyonel)" icon={ShoppingBag}>
        <textarea
          value={userNote}
          onChange={e => setUserNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Örn: kapı zilini çalmasın, çatal-kaşık dahil olmasın..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </Section>

      {/* Toplam */}
      <div className="mb-3 rounded-2xl border border-border bg-card p-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Ürünler</span>
          <span>{subtotal.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺</span>
        </div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Teslimat Ücreti</span>
          <span>
            {deliveryFee === 0
              ? "Ücretsiz"
              : `${deliveryFee.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex items-center justify-between">
          <span className="text-base font-bold">Toplam</span>
          <span className="text-lg font-extrabold text-primary">
            {grandTotal.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {minNotMet && (
        <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Minimum sipariş tutarına {(minOrder - subtotal).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺ kaldı.
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || minNotMet}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sipariş gönderiliyor...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Siparişi Onayla · {grandTotal.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
          </>
        )}
      </button>

      {/* Login modal — eğer login yoksa açık kalır */}
      <AuthModal
        open={authModal && !loggedIn}
        onClose={() => router.replace("/")}
        onSuccess={() => {
          setAuthModal(false);
          const u = getUser();
          if (u) {
            setLoggedIn(true);
            setContactPhone(u.phone || "");
            setContactName(`${u.firstName || ""} ${u.lastName || ""}`.trim());
          }
        }}
        message="Sipariş vermek için giriş yapın"
      />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      {children}
    </section>
  );
}

function PaymentOption({
  method,
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  method: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
        checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={onChange}
        className="accent-primary"
      />
      <Icon className="h-5 w-5 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}
