"use client";

import { useState } from "react";
import { Clock, MapPin, Phone, Package, Check } from "lucide-react";

type OrderStatus = "pending" | "preparing" | "delivering" | "delivered" | "cancelled";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
  note?: string;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: string;
}

const initial: Order[] = [
  {
    id: "S-14823",
    customerName: "Ahmet Yılmaz",
    phone: "+90 555 111 22 33",
    items: [
      { name: "Domates", qty: 2, price: 32 },
      { name: "Süt 1L", qty: 3, price: 45 },
      { name: "Ekmek", qty: 1, price: 10 },
    ],
    total: 209,
    address: "Hacı Halil Mah. Örnek Sok. No:15 D:5",
    note: "Kapıya bırakın",
    placedAt: "5 dk önce",
    status: "pending",
    paymentMethod: "Online Ödeme",
  },
  {
    id: "S-14822",
    customerName: "Elif Kaya",
    phone: "+90 532 444 55 66",
    items: [
      { name: "Ayçiçek Yağı 5L", qty: 1, price: 185 },
      { name: "Pirinç 2kg", qty: 2, price: 165 },
    ],
    total: 515,
    address: "İstasyon Mah. Gebze",
    placedAt: "20 dk önce",
    status: "preparing",
    paymentMethod: "Kapıda Nakit",
  },
  {
    id: "S-14821",
    customerName: "Mert Demir",
    phone: "+90 543 777 88 99",
    items: [{ name: "Bebek Bezi 44'lü", qty: 2, price: 495 }],
    total: 990,
    address: "Mustafa Paşa Mah. Gebze",
    placedAt: "45 dk önce",
    status: "delivering",
    paymentMethod: "Online Ödeme",
  },
  {
    id: "S-14820",
    customerName: "Zeynep Şahin",
    phone: "+90 505 222 33 44",
    items: [
      { name: "Tavuk Göğsü 1kg", qty: 1, price: 195 },
      { name: "Patates 1kg", qty: 2, price: 18 },
    ],
    total: 231,
    address: "Hürriyet Mah. Gebze",
    placedAt: "2 saat önce",
    status: "delivered",
    paymentMethod: "Online Ödeme",
  },
];

const statusConfig: Record<OrderStatus, { label: string; cls: string; next?: OrderStatus }> = {
  pending: { label: "Yeni Sipariş", cls: "bg-amber-500/10 text-amber-600", next: "preparing" },
  preparing: { label: "Hazırlanıyor", cls: "bg-blue-500/10 text-blue-600", next: "delivering" },
  delivering: { label: "Yolda", cls: "bg-violet-500/10 text-violet-600", next: "delivered" },
  delivered: { label: "Teslim Edildi", cls: "bg-emerald-500/10 text-emerald-600" },
  cancelled: { label: "İptal Edildi", cls: "bg-red-500/10 text-red-600" },
};

export default function Page() {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const advance = (id: string) =>
    setOrders((p) =>
      p.map((o) => {
        if (o.id !== id) return o;
        const next = statusConfig[o.status].next;
        return next ? { ...o, status: next } : o;
      })
    );

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const todayRevenue = orders.filter((o) => o.status === "delivered").reduce((a, o) => a + o.total, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Siparişler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} yeni sipariş · Bugün ₺{todayRevenue.toLocaleString("tr")} gelir
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "preparing", "delivering", "delivered"] as const).map((f) => {
          const labels = { all: "Tümü", pending: "Yeni", preparing: "Hazırlanıyor", delivering: "Yolda", delivered: "Teslim Edildi" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((o) => (
          <article key={o.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">#{o.id}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{o.customerName}</span>
                  <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3 w-3" />
                    {o.phone}
                  </a>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {o.placedAt}
                  </span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusConfig[o.status].cls}`}>
                {statusConfig[o.status].label}
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-muted/50 p-3">
              <ul className="space-y-1 text-xs">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      <span className="font-semibold">{i.qty}x</span> {i.name}
                    </span>
                    <span className="text-muted-foreground">{i.price * i.qty}₺</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-bold">
                <span>Toplam</span>
                <span className="text-primary">{o.total}₺</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-start gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {o.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Package className="h-3 w-3" />
                {o.paymentMethod}
              </span>
            </div>

            {o.note && (
              <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-700">
                <span className="font-semibold">Müşteri Notu:</span> {o.note}
              </p>
            )}

            {statusConfig[o.status].next && (
              <button
                onClick={() => advance(o.id)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" />
                {o.status === "pending" && "Hazırlamaya Başla"}
                {o.status === "preparing" && "Yola Çıkardım"}
                {o.status === "delivering" && "Teslim Edildi Olarak İşaretle"}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
