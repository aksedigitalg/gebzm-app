"use client";

import { Check, ChefHat, Package, ShoppingBag, Truck, X } from "lucide-react";
import {
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/types/order";

interface Step {
  status: OrderStatus;
  label: string;
  icon: typeof ShoppingBag;
}

const STEPS: Step[] = [
  { status: "bekliyor", label: "Sipariş Alındı", icon: ShoppingBag },
  { status: "onaylandi", label: "Onaylandı", icon: Check },
  { status: "hazirlaniyor", label: "Hazırlanıyor", icon: ChefHat },
  { status: "yolda", label: "Yolda", icon: Truck },
  { status: "teslim_edildi", label: "Teslim", icon: Package },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  bekliyor: 0,
  onaylandi: 1,
  hazirlaniyor: 2,
  hazir: 2, // hazırlık tamamlandı (yolda öncesi) — UI'da hazırlanıyor olarak göster
  yolda: 3,
  teslim_edildi: 4,
  iptal: -1,
};

export function OrderStatusTimeline({
  status,
  estimatedDeliveryMin,
}: {
  status: OrderStatus;
  estimatedDeliveryMin?: number;
}) {
  if (status === "iptal") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900 dark:bg-rose-950/30">
        <div className="mb-2 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600">
            <X className="h-5 w-5 text-white" strokeWidth={3} />
          </div>
        </div>
        <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
          Sipariş iptal edildi
        </p>
      </div>
    );
  }

  const activeIdx = STATUS_INDEX[status];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* Status üstündeki başlık */}
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sipariş Durumu
        </p>
        <p className="mt-0.5 text-base font-bold">
          {ORDER_STATUS_LABEL[status]}
        </p>
        {estimatedDeliveryMin && status !== "teslim_edildi" && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tahmini teslimat: ~{estimatedDeliveryMin} dk
          </p>
        )}
      </div>

      {/* 5 adım */}
      <div className="relative">
        {/* Bağlantı çizgileri */}
        <div className="absolute left-0 right-0 top-5 mx-6 flex">
          {STEPS.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 transition-colors"
              style={{
                backgroundColor: i < activeIdx ? "#10b981" : "var(--border, #e5e7eb)",
              }}
            />
          ))}
        </div>

        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeIdx;
            const isPast = i < activeIdx;
            const isFuture = i > activeIdx;
            return (
              <div key={step.status} className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-card transition-all"
                  style={{
                    backgroundColor: isPast || isActive ? "#10b981" : "white",
                    borderColor: isPast || isActive ? "#10b981" : "var(--border, #e5e7eb)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(16,185,129,0.4)"
                      : "none",
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={2.5}
                    style={{
                      color: isPast || isActive ? "white" : "#94a3b8",
                    }}
                  />
                </div>
                <p
                  className="text-center text-[10px] leading-tight"
                  style={{
                    color: isFuture ? "#94a3b8" : "#0f172a",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
