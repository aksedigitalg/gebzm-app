"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  type Order,
} from "@/lib/types/order";

export const dynamic = "force-dynamic";

export default function SiparisDetayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  const reload = async () => {
    try {
      const data = (await api.user.getOrder(id)) as unknown as Order;
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
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
    if (!id) return;
    setLoading(true);
    reload();
    // Aktif siparişler için 15sn polling (WebSocket olana kadar)
    const interval = setInterval(() => {
      reload();
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="px-5 py-10">
        <Link
          href="/profil/siparislerim"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </Link>
        <p className="text-sm text-rose-600">{error || "Sipariş bulunamadı"}</p>
      </div>
    );
  }

  const canCancel = order.status === "bekliyor";
  const canRate = order.status === "teslim_edildi" && !order.rating;

  const itemsSubtotal = (order.items || []).reduce(
    (s, i) => s + Number(i.subtotal || i.price * i.quantity),
    0
  );

  return (
    <div className="px-5 pb-10 pt-4 lg:pt-6">
      <Link
        href="/profil/siparislerim"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Siparişlerim
      </Link>

      <h1 className="mb-1 text-xl font-bold">Sipariş #{order.id}</h1>
      <p className="mb-4 text-xs text-muted-foreground">
        {new Date(order.created_at).toLocaleString("tr-TR")}
      </p>

      {/* Timeline */}
      <div className="mb-4">
        <OrderStatusTimeline
          status={order.status}
          estimatedDeliveryMin={order.estimated_delivery_min}
        />
      </div>

      {/* İptal nedeni */}
      {order.status === "iptal" && order.cancelled_reason && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <b>İptal sebebi:</b> {order.cancelled_reason}
        </div>
      )}

      {/* Restoran */}
      <Section title="İşletme">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">{order.business_name}</p>
            {order.business_phone && (
              <a
                href={`tel:${order.business_phone.replace(/\s/g, "")}`}
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Phone className="h-3 w-3" /> {order.business_phone}
              </a>
            )}
          </div>
          <Link
            href={`/profil/mesajlar?biz=${order.business_id}`}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold transition hover:bg-muted/70"
          >
            <MessageCircle className="h-3 w-3" />
            Mesaj
          </Link>
        </div>
      </Section>

      {/* Ürünler */}
      <Section title={`Ürünler · ${(order.items || []).length} adet`}>
        <div className="space-y-2">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {item.quantity}× {item.name}
                </p>
                {item.note && (
                  <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                    Not: {item.note}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-semibold">
                {Number(item.subtotal || item.price * item.quantity).toLocaleString(
                  "tr-TR",
                  { maximumFractionDigits: 2 }
                )}{" "}
                ₺
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Adres */}
      <Section title="Teslimat Adresi">
        <p className="flex items-start gap-1.5 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{order.delivery_address}</span>
        </p>
        {order.contact_phone && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {order.contact_phone}
            {order.contact_name && <span>· {order.contact_name}</span>}
          </p>
        )}
      </Section>

      {/* Ödeme + Toplam */}
      <Section title="Ödeme">
        <div className="mb-3 flex items-center gap-2">
          <PaymentIcon method={order.payment_method} />
          <span className="text-sm font-semibold">
            {PAYMENT_METHOD_LABEL[order.payment_method]}
          </span>
        </div>
        <div className="space-y-1 text-sm">
          <Row label="Ürünler" value={`${itemsSubtotal.toLocaleString("tr-TR")} ₺`} />
          <Row
            label="Teslimat Ücreti"
            value={
              Number(order.delivery_fee) === 0
                ? "Ücretsiz"
                : `${Number(order.delivery_fee).toLocaleString("tr-TR")} ₺`
            }
          />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-bold">Toplam</span>
            <span className="text-lg font-extrabold text-primary">
              {Number(order.total).toLocaleString("tr-TR")} ₺
            </span>
          </div>
        </div>
      </Section>

      {/* Not */}
      {order.user_note && (
        <Section title="Notum">
          <p className="text-sm">{order.user_note}</p>
        </Section>
      )}

      {/* Aksiyon butonları */}
      <div className="mt-5 space-y-2">
        {canCancel && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <X className="h-4 w-4" /> Siparişi İptal Et
          </button>
        )}
        {canRate && (
          <button
            type="button"
            onClick={() => setRateOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white"
          >
            <Star className="h-4 w-4" /> Değerlendir
          </button>
        )}
        {order.rating && (
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="mb-1 flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className="h-5 w-5"
                  fill={i <= order.rating! ? "#fbbf24" : "none"}
                  color={i <= order.rating! ? "#fbbf24" : "#d4d4d8"}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Değerlendirmen kaydedildi
              {order.rating_comment && `: "${order.rating_comment}"`}
            </p>
          </div>
        )}
      </div>

      {cancelOpen && (
        <CancelDialog
          onClose={() => setCancelOpen(false)}
          onConfirm={async (reason) => {
            try {
              await api.user.cancelOrder(order.id, reason);
              setCancelOpen(false);
              reload();
            } catch (err) {
              alert(err instanceof Error ? err.message : "İptal edilemedi");
            }
          }}
        />
      )}

      {rateOpen && (
        <RateDialog
          onClose={() => setRateOpen(false)}
          onConfirm={async (rating, comment) => {
            try {
              await api.user.rateOrder(order.id, rating, comment);
              setRateOpen(false);
              reload();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Kaydedilemedi");
            }
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PaymentIcon({ method }: { method: Order["payment_method"] }) {
  const map = { nakit: Banknote, kart_kapida: CreditCard, eft: Building };
  const Icon = map[method];
  return <Icon className="h-5 w-5 text-primary" />;
}

function CancelDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-2 text-base font-bold">Siparişi iptal et</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          İptal nedeni (opsiyonel):
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="Örn: yanlış adres yazdım"
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(reason.trim());
              setSubmitting(false);
            }}
            disabled={submitting}
            className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "İptal ediliyor..." : "İptal Et"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RateDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-3 text-base font-bold text-center">Bu siparişi değerlendir</h3>
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              aria-label={`${i} yıldız`}
            >
              <Star
                className="h-9 w-9 transition active:scale-90"
                fill={i <= rating ? "#fbbf24" : "none"}
                color={i <= rating ? "#fbbf24" : "#d4d4d8"}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Yorumun (opsiyonel)..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(rating, comment.trim());
              setSubmitting(false);
            }}
            disabled={submitting}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
