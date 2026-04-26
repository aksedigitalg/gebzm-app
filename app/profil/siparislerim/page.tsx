"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type Order,
} from "@/lib/types/order";

export const dynamic = "force-dynamic";

export default function SiparislerimPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"aktif" | "gecmis">("aktif");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u?.token) {
      router.replace("/giris");
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.user
      .getOrders(tab)
      .then(list => {
        if (cancelled) return;
        setOrders((list as Order[]) || []);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Yüklenemedi");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, router]);

  return (
    <div className="px-5 pb-10 pt-4 lg:pt-6">
      <Link
        href="/profil"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Profilim
      </Link>

      <h1 className="mb-1 text-xl font-bold">Siparişlerim</h1>

      {/* Tab */}
      <div className="mb-4 mt-3 flex gap-2 border-b border-border">
        <TabButton active={tab === "aktif"} onClick={() => setTab("aktif")}>
          Aktif
        </TabButton>
        <TabButton active={tab === "gecmis"} onClick={() => setTab("gecmis")}>
          Geçmiş
        </TabButton>
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

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">
            {tab === "aktif" ? "Aktif siparişin yok" : "Geçmiş siparişin yok"}
          </p>
          <Link
            href="/yemek"
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white"
          >
            Yemek Sipariş Et
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(o => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
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
      className="relative px-3 py-2 text-sm font-semibold transition"
      style={{
        color: active ? "var(--primary, #0e7490)" : "#94a3b8",
      }}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-primary" />
      )}
    </button>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isActive = ACTIVE_ORDER_STATUSES.includes(order.status);
  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const date = new Date(order.created_at);
  return (
    <Link
      href={`/profil/siparislerim/${order.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition hover:border-primary"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: ORDER_STATUS_COLOR[order.status] }}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {date.toLocaleDateString("tr-TR")} {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{order.business_name}</p>
          <p className="text-xs text-muted-foreground">
            {itemCount} ürün · {Number(order.total).toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      {isActive && order.estimated_delivery_min && (
        <p className="mt-2 text-[11px] font-medium text-emerald-600">
          ⏱ Tahmini teslimat: ~{order.estimated_delivery_min} dk
        </p>
      )}
    </Link>
  );
}
