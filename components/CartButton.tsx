"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

interface Props {
  onClick: () => void;
  // Position varyantları — sayfaya göre
  position?: "floating-bottom" | "inline";
  className?: string;
}

export function CartButton({ onClick, position = "floating-bottom", className = "" }: Props) {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  if (position === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90 ${className}`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span>{itemCount} ürün</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
          {total.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
        </span>
      </button>
    );
  }

  // Floating bottom — alt nav'ın üzerinde, mobilde kullanıcı haline geçer
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sepetim"
      className={`fixed left-1/2 z-[450] flex -translate-x-1/2 items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl transition active:scale-95 hover:opacity-95 ${className}`}
      style={{
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      <div className="relative">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-primary">
          {itemCount}
        </span>
      </div>
      <span>Sepetim</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold">
        {total.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
      </span>
    </button>
  );
}
