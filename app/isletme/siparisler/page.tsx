"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChefHat,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { getBusinessSession } from "@/lib/panel-auth";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/types/order";

const POLL_INTERVAL_MS = 10_000;

export default function IsletmeSiparislerPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"yeni" | "aktif" | "tamamlandi">("yeni");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Login kontrolü
  useEffect(() => {
    const session = getBusinessSession();
    if (!session?.token) router.replace("/isletme/giris");
  }, [router]);

  const reload = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = (await api.business.getOrders(filter)) as Order[];
      const safeList = list || [];
      setOrders(safeList);

      // Yeni sipariş tespiti — yalnızca "yeni" sekmesinde
      if (filter === "yeni") {
        const incomingIds = safeList.map(o => o.id);
        if (!initializedRef.current) {
          // İlk yüklemede sadece ID setini doldur, ses çalma
          seenIdsRef.current = new Set(incomingIds);
          initializedRef.current = true;
        } else {
          const fresh = incomingIds.filter(id => !seenIdsRef.current.has(id));
          if (fresh.length > 0 && soundEnabledRef.current) {
            playOrderRing();
            notifyDesktop(fresh.length);
          }
          // Set'i sadece mevcut ID'lerle güncelle (silinmiş/durumu değişmiş olanlar düşer)
          seenIdsRef.current = new Set(incomingIds);
        }
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Filtre değişince state'i sıfırla — başka sekmeden "yeni"ye geçince yanlış ses çalmasın
  useEffect(() => {
    initializedRef.current = false;
    seenIdsRef.current = new Set();
    reload();
    const t = setInterval(() => reload(true), POLL_INTERVAL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      // İlk gesture: AudioContext'i başlat ve Notification iznini iste
      playBeepShort();
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  };

  type ActionStatus = Exclude<OrderStatus, "bekliyor">;
  const updateStatus = async (id: string, status: ActionStatus) => {
    try {
      await api.business.updateOrderStatus(id, status);
      reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sipariş güncellenemedi";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Siparişler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gelen siparişler {orders.length > 0 && `(${orders.length})`}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
            soundEnabled
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
              : "border-border bg-card text-muted-foreground"
          }`}
          title={soundEnabled ? "Sesli bildirim açık" : "Sesli bildirim kapalı (tıklayarak aç)"}
          aria-label="Ses"
        >
          <Bell className="h-4 w-4" />
        </button>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <FilterTab active={filter === "yeni"} onClick={() => setFilter("yeni")}>
          Yeni
        </FilterTab>
        <FilterTab active={filter === "aktif"} onClick={() => setFilter("aktif")}>
          Hazırlık / Yolda
        </FilterTab>
        <FilterTab
          active={filter === "tamamlandi"}
          onClick={() => setFilter("tamamlandi")}
        >
          Tamamlandı
        </FilterTab>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold">Sipariş yok</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {filter === "yeni"
              ? "Yeni sipariş geldiğinde burada görünür"
              : "Bu kategoride sipariş yok"}
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(o => (
            <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold transition"
      style={{
        backgroundColor: active ? "var(--primary, #0e7490)" : "transparent",
        color: active ? "white" : "var(--muted-foreground, #64748b)",
        border: active ? "none" : "1px solid var(--border, #e5e7eb)",
      }}
    >
      {children}
    </button>
  );
}

function OrderCard({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, status: Exclude<OrderStatus, "bekliyor">) => void;
}) {
  const itemCount = (order.items || []).reduce((s, i) => s + i.quantity, 0);
  const date = new Date(order.created_at);
  const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60_000);

  const nextActions = getNextActions(order.status);

  return (
    <div
      className="rounded-2xl border-2 p-4 shadow-sm"
      style={{
        borderColor:
          order.status === "bekliyor"
            ? ORDER_STATUS_COLOR.bekliyor
            : "var(--border, #e5e7eb)",
        backgroundColor: order.status === "bekliyor" ? "rgb(254 243 199 / 0.4)" : "white",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: ORDER_STATUS_COLOR[order.status] }}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            #{order.id} · {minutesAgo < 1 ? "şimdi" : `${minutesAgo} dk önce`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-extrabold">
            {Number(order.total).toLocaleString("tr-TR")} ₺
          </p>
          <p className="text-[10px] text-muted-foreground">
            {PAYMENT_METHOD_LABEL[order.payment_method]}
          </p>
        </div>
      </div>

      {/* Müşteri */}
      <div className="mb-3 rounded-lg bg-muted/40 p-2.5 text-xs">
        <p className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 shrink-0 text-primary" />
          <span className="font-semibold">{order.contact_phone}</span>
          {order.contact_name && (
            <span className="text-muted-foreground">· {order.contact_name}</span>
          )}
        </p>
        <p className="mt-1 flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
          <span>{order.delivery_address}</span>
        </p>
      </div>

      {/* Ürünler */}
      <div className="mb-3 space-y-1 text-xs">
        {(order.items || []).map((it, i) => (
          <div key={i} className="flex justify-between">
            <span>
              <b>{it.quantity}×</b> {it.name}
              {it.note && (
                <span className="ml-1 italic text-amber-700 dark:text-amber-400">
                  ({it.note})
                </span>
              )}
            </span>
            <span className="text-muted-foreground">
              {Number(it.subtotal || it.price * it.quantity).toLocaleString("tr-TR")} ₺
            </span>
          </div>
        ))}
        {itemCount > 5 && (
          <p className="text-[11px] text-muted-foreground">
            Toplam {itemCount} ürün
          </p>
        )}
      </div>

      {order.user_note && (
        <div className="mb-3 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <b>Müşteri notu:</b> {order.user_note}
        </div>
      )}

      {/* Aksiyonlar */}
      {nextActions.length > 0 && (
        <div className="flex gap-2">
          {nextActions.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (a.confirm && !confirm(a.confirm)) return;
                onUpdate(order.id, a.status);
              }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-xs font-bold transition active:scale-95 ${
                a.style === "primary"
                  ? "bg-primary text-white hover:opacity-90"
                  : a.style === "danger"
                    ? "bg-rose-600 text-white hover:opacity-90"
                    : "border border-border bg-card hover:bg-muted"
              }`}
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NextAction {
  status: Exclude<OrderStatus, "bekliyor">;
  label: string;
  icon: typeof Check;
  style: "primary" | "danger" | "default";
  confirm?: string;
}

function getNextActions(status: OrderStatus): NextAction[] {
  switch (status) {
    case "bekliyor":
      return [
        {
          status: "iptal",
          label: "Reddet",
          icon: X,
          style: "danger",
          confirm: "Siparişi reddetmek istediğine emin misin?",
        },
        { status: "onaylandi", label: "Kabul Et", icon: Check, style: "primary" },
      ];
    case "onaylandi":
      return [
        { status: "hazirlaniyor", label: "Hazırlanıyor", icon: ChefHat, style: "primary" },
      ];
    case "hazirlaniyor":
      return [{ status: "hazir", label: "Hazır", icon: Package, style: "primary" }];
    case "hazir":
      return [{ status: "yolda", label: "Yola Çıktı", icon: Truck, style: "primary" }];
    case "yolda":
      return [
        { status: "teslim_edildi", label: "Teslim Edildi", icon: Check, style: "primary" },
      ];
    default:
      return [];
  }
}

// Web Audio API ile zil sesi: 3 ardışık ding-dong
let _audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  try {
    if (!_audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      _audioCtx = new Ctor();
    }
    if (_audioCtx.state === "suspended") _audioCtx.resume().catch(() => {});
    return _audioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, start: number, duration: number, vol = 0.35) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playBeepShort() {
  // Toggle açıldığında "tık" sesi (gesture'ı tüket + AudioContext başlat)
  playTone(660, 0, 0.12, 0.2);
}

function playOrderRing() {
  // Zil sesi: ding-dong x 3 (1.8sn)
  for (let i = 0; i < 3; i++) {
    const t = i * 0.6;
    playTone(880, t, 0.25, 0.4);
    playTone(660, t + 0.28, 0.3, 0.4);
  }
}

function notifyDesktop(count: number) {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const n = new Notification("Yeni sipariş!", {
      body: count === 1 ? "1 yeni sipariş geldi" : `${count} yeni sipariş geldi`,
      icon: "/icon-192.png",
      tag: "new-order",
      requireInteraction: false,
    });
    setTimeout(() => n.close(), 6000);
  } catch {
    // sessizce yut
  }
}
