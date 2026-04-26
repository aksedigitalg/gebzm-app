"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useGeolocation } from "@/lib/use-geolocation";
import { setConsent } from "@/lib/geolocation-consent";
import type { UserAddress } from "@/lib/types/order";

export const dynamic = "force-dynamic";

export default function AdreslerimPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserAddress | "new" | null>(null);

  const reload = async () => {
    try {
      const list = (await api.user.getAddresses()) as UserAddress[];
      setAddresses(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u?.token) {
      router.replace("/giris");
      return;
    }
    reload();
  }, [router]);

  return (
    <div className="px-5 pb-10 pt-4 lg:pt-6">
      <Link
        href="/profil"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Profilim
      </Link>

      <h1 className="mb-1 text-xl font-bold">Adreslerim</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Sipariş verirken hızlı seçim için adreslerini kaydet
      </p>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">
            Kayıtlı adresin yok
          </p>
        </div>
      )}

      {!loading && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map(a => (
            <div
              key={a.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  {a.is_default && (
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  )}
                  {a.label || "Adres"}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                    aria-label="Düzenle"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Bu adresi silmek istiyor musun?")) return;
                      try {
                        await api.user.deleteAddress(a.id);
                        reload();
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Silinemedi");
                      }
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{a.address}</p>
              {a.contact_phone && (
                <p className="mt-1 text-xs text-muted-foreground">{a.contact_phone}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setEditing("new")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Yeni Adres Ekle
      </button>

      {editing && (
        <AddressDialog
          address={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function AddressDialog({
  address,
  onClose,
  onSaved,
}: {
  address: UserAddress | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const geo = useGeolocation();
  const [label, setLabel] = useState(address?.label || "");
  const [text, setText] = useState(address?.address || "");
  const [district, setDistrict] = useState(address?.district || "");
  const [phone, setPhone] = useState(address?.contact_phone || "");
  const [name, setName] = useState(address?.contact_name || "");
  const [isDefault, setIsDefault] = useState(address?.is_default || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [latLng, setLatLng] = useState<{ lat?: number; lng?: number }>({
    lat: address?.lat,
    lng: address?.lng,
  });

  const submit = async () => {
    if (text.trim().length < 10) {
      setError("Adresi detaylı yaz (min 10 karakter)");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const data = {
        label: label.trim() || "Adres",
        address: text.trim(),
        district: district.trim() || undefined,
        lat: latLng.lat,
        lng: latLng.lng,
        contact_phone: phone.trim() || undefined,
        contact_name: name.trim() || undefined,
        is_default: isDefault,
      };
      if (address) {
        await api.user.updateAddress(address.id, data);
      } else {
        await api.user.createAddress(data);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
      setSubmitting(false);
    }
  };

  const useLocation = async () => {
    setConsent("granted");
    const r = await geo.request();
    if (r.coords) {
      setLatLng({ lat: r.coords.lat, lng: r.coords.lng });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">
            {address ? "Adresi Düzenle" : "Yeni Adres"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <Field label="Etiket (Ev, İş, vs.)">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              maxLength={50}
              placeholder="Ev"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Mahalle / Semt">
            <input
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              maxLength={100}
              placeholder="Cumhuriyet Mah."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field
            label="Adres Detayı *"
            extra={
              <button
                type="button"
                onClick={useLocation}
                className="text-xs text-primary hover:underline"
              >
                📍 Konumumu Kullan
              </button>
            }
          >
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Cadde, sokak, bina, daire no, kapı yönü..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {latLng.lat && (
              <p className="mt-1 text-[11px] text-emerald-600">
                ✓ Konum eklendi
              </p>
            )}
          </Field>
          <Field label="Ad Soyad">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Telefon">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={20}
              placeholder="0 555 555 55 55"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="accent-primary"
            />
            <span>Varsayılan adres yap</span>
          </label>
        </div>

        {error && (
          <div className="mx-5 mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Kaydet
          </button>
        </div>

      </div>
    </div>
  );
}

function Field({
  label,
  extra,
  children,
}: {
  label: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {extra}
      </label>
      {children}
    </div>
  );
}
