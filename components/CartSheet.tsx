"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: Props) {
  const router = useRouter();
  const { cart, itemCount, total, setQuantity, clear } = useCart();

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/odeme");
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl sm:mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Sepetim</h2>
              {cart && (
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {cart.businessName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sepet boş */}
        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Sepetin boş</p>
          </div>
        ) : (
          <>
            {/* Item listesi */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div
                    key={item.menuItemId}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    {item.photoUrl && (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-primary">
                        {item.price.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
                      </p>
                      {item.note && (
                        <p className="mt-1 truncate text-[11px] italic text-muted-foreground">
                          Not: {item.note}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 self-center">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                        aria-label="Azalt"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition hover:bg-muted"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                        aria-label="Artır"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-90"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sepeti boşalt */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Sepet temizlensin mi?")) clear();
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Sepeti boşalt
              </button>
            </div>

            {/* Footer: Toplam + Onay */}
            <div
              className="border-t border-border bg-card px-5 py-4"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {itemCount} ürün · ara toplam
                </span>
                <span className="text-lg font-extrabold">
                  {total.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Ödeme & Adres Bilgisi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
