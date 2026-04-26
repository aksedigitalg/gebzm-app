"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { adminEventApi, publicApi } from "@/lib/api";
import type { Event, EventCategory } from "@/lib/types/event";
import {
  EVENT_STATUS_COLOR,
  EVENT_STATUS_LABEL,
} from "@/lib/types/event";

const ADMIN_TOKEN_KEY = "gebzem_admin";

function getAdminToken(): string {
  try {
    const raw = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!raw) return "";
    const obj = JSON.parse(raw);
    return obj?.token || "";
  } catch {
    return "";
  }
}

export default function AdminEtkinliklerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const reload = async () => {
    const token = getAdminToken();
    if (!token) {
      setError("Admin oturumu yok");
      setLoading(false);
      return;
    }
    try {
      const [evs, cats] = await Promise.all([
        adminEventApi.list(token).catch(() => []),
        publicApi.getEventCategories().catch(() => []),
      ]);
      setEvents(evs as Event[]);
      setCategories(cats as EventCategory[]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = events.filter(e =>
    !search.trim()
      ? true
      : e.title.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))
  );

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {events.length} toplam ·{" "}
            {events.filter(e => e.status === "yayinda").length} yayında
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni Etkinlik
        </button>
      </header>

      <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Etkinlik ara..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold">Etkinlik yok</p>
          <p className="mt-1 text-xs text-muted-foreground">
            "Yeni Etkinlik" ile ekle
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Etkinlik</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => {
                  const d = new Date(ev.start_at);
                  return (
                    <tr key={ev.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{ev.title}</p>
                        {ev.location_name && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {ev.location_name}
                          </p>
                        )}
                        {(ev.attending_count > 0 || ev.interested_count > 0) && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {ev.attending_count} katılıyor ·{" "}
                            {ev.interested_count} ilgileniyor
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {d.toLocaleDateString("tr-TR")}
                        <br />
                        <span className="text-muted-foreground">
                          {d.toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ev.category_label || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{
                            backgroundColor: EVENT_STATUS_COLOR[ev.status],
                          }}
                        >
                          {EVENT_STATUS_LABEL[ev.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {ev.status === "yayinda" && (
                            <Link
                              href={`/etkinlikler/${ev.slug}`}
                              target="_blank"
                              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                              aria-label="Görüntüle"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingId(ev.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                            aria-label="Düzenle"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`"${ev.title}" silinsin mi?`)) return;
                              try {
                                await adminEventApi.delete(ev.id, getAdminToken());
                                reload();
                              } catch (err) {
                                alert(
                                  err instanceof Error
                                    ? err.message
                                    : "Silinemedi"
                                );
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"
                            aria-label="Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingId && (
        <EventFormDialog
          eventId={editingId === "new" ? null : editingId}
          categories={categories}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function EventFormDialog({
  eventId,
  categories,
  onClose,
  onSaved,
}: {
  eventId: string | null;
  categories: EventCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!eventId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [categoryKey, setCategoryKey] = useState(categories[0]?.key || "");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<"taslak" | "yayinda">("yayinda");

  useEffect(() => {
    if (!eventId) return;
    const token = getAdminToken();
    adminEventApi
      .get(eventId, token)
      .then(data => {
        const e = data as unknown as Event;
        setTitle(e.title || "");
        setCategoryKey(e.category_key || "");
        setDescription(e.description || "");
        setPhotoUrl(e.photo_url || "");
        setCoverUrl(e.cover_url || "");
        setStartAt(toLocalInput(e.start_at));
        setEndAt(e.end_at ? toLocalInput(e.end_at) : "");
        setLocationName(e.location_name || "");
        setAddress(e.address || "");
        setLat(e.lat != null ? String(e.lat) : "");
        setLng(e.lng != null ? String(e.lng) : "");
        setOrganizer(e.organizer || "");
        setContactPhone(e.contact_phone || "");
        setContactUrl(e.contact_url || "");
        setTicketUrl(e.ticket_url || "");
        setPrice(Number(e.price || 0));
        setStatus(e.status === "taslak" ? "taslak" : "yayinda");
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Yüklenemedi");
        setLoading(false);
      });
  }, [eventId]);

  const submit = async () => {
    if (title.trim().length < 3) {
      setError("Başlık en az 3 karakter");
      return;
    }
    if (!startAt) {
      setError("Başlangıç tarihi zorunlu");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const token = getAdminToken();
      const data = {
        title: title.trim(),
        category_key: categoryKey || undefined,
        description: description.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        cover_url: coverUrl.trim() || undefined,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : undefined,
        location_name: locationName.trim() || undefined,
        address: address.trim() || undefined,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        organizer: organizer.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        contact_url: contactUrl.trim() || undefined,
        ticket_url: ticketUrl.trim() || undefined,
        price: price || 0,
        status,
      };
      if (isEdit && eventId) {
        await adminEventApi.update(eventId, data, token);
      } else {
        await adminEventApi.create(data, token);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">
            {isEdit ? "Etkinlik Düzenle" : "Yeni Etkinlik"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            <Field label="Başlık *">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 200))}
                className={inputCls}
                placeholder="Konser adı, festival vs."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori">
                <select
                  value={categoryKey}
                  onChange={e => setCategoryKey(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Seç —</option>
                  {categories.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Durum">
                <select
                  value={status}
                  onChange={e =>
                    setStatus(e.target.value as "taslak" | "yayinda")
                  }
                  className={inputCls}
                >
                  <option value="yayinda">Yayında</option>
                  <option value="taslak">Taslak</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Başlangıç *">
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Bitiş (opsiyonel)">
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={e => setEndAt(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Açıklama">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 5000))}
                rows={4}
                className={`${inputCls} resize-y`}
                placeholder="Etkinlik hakkında detaylar..."
              />
            </Field>

            <Field label="Kapak Foto URL">
              <input
                type="url"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
            <Field label="Tanıtım Foto URL (kart için)">
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>

            <Field label="Mekan Adı">
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value.slice(0, 200))}
                className={inputCls}
                placeholder="Gebze Cumhuriyet Parkı"
              />
            </Field>
            <Field label="Adres">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value.slice(0, 500))}
                className={inputCls}
                placeholder="Gebze, Kocaeli"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Enlem (lat)">
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  className={inputCls}
                  placeholder="40.8030"
                />
              </Field>
              <Field label="Boylam (lng)">
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  className={inputCls}
                  placeholder="29.4310"
                />
              </Field>
            </div>

            <Field label="Organizatör">
              <input
                type="text"
                value={organizer}
                onChange={e => setOrganizer(e.target.value.slice(0, 200))}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value.slice(0, 20))}
                  className={inputCls}
                  placeholder="0555 555 55 55"
                />
              </Field>
              <Field label="Bilet Fiyatı (TL, 0=ücretsiz)">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Web Sitesi URL">
              <input
                type="url"
                value={contactUrl}
                onChange={e => setContactUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
            <Field label="Bilet Linki">
              <input
                type="url"
                value={ticketUrl}
                onChange={e => setTicketUrl(e.target.value)}
                className={inputCls}
                placeholder="https://biletinial.com/..."
              />
            </Field>
          </div>
        )}

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
            disabled={submitting || loading}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
