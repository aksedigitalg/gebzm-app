"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart";
import { CartButton } from "@/components/CartButton";
import { CartSheet } from "@/components/CartSheet";

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  photo_url?: string;
  is_available?: boolean;
}

interface MenuCat {
  id: string;
  name: string;
}

interface Props {
  business: { id: string; name: string; type?: string };
  menu: { categories: MenuCat[]; items: MenuItem[] };
  // Teslimat ayarları (varsa) — açık mı, min sipariş, ücret
  delivery?: {
    accepts_orders?: boolean;
    min_order_amount?: number;
    delivery_fee?: number;
    estimated_delivery_min?: number;
    is_open_now?: boolean;
  };
}

export function InteractiveOrderMenu({ business, menu, delivery }: Props) {
  const { cart, getQuantity, addItem, setQuantity, total } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const items = menu.items || [];
  const categories = menu.categories || [];

  const accepts = delivery?.accepts_orders !== false;
  const isOpen = delivery?.is_open_now !== false;
  const minOrder = Number(delivery?.min_order_amount || 0);
  const minRemaining = Math.max(0, minOrder - total);

  const handleAdd = (item: MenuItem) => {
    if (!accepts) {
      alert("İşletme şu an sipariş kabul etmiyor.");
      return;
    }
    if (!isOpen) {
      alert("İşletme şu an kapalı.");
      return;
    }
    if (item.is_available === false) {
      alert("Bu ürün şu an mevcut değil.");
      return;
    }
    addItem(business, {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      photoUrl: item.photo_url,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-muted-foreground">Menü henüz eklenmemiş</p>
      </div>
    );
  }

  return (
    <>
      {/* Durum bilgisi */}
      {(!accepts || !isOpen) && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-center text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {!isOpen
            ? "İşletme şu an kapalı — sepete ekleyebilirsin ama sipariş veremezsin"
            : "İşletme şu an sipariş kabul etmiyor"}
        </div>
      )}

      {minOrder > 0 && (
        <div className="mb-4 rounded-2xl border border-border bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Minimum sipariş: <b>{minOrder.toLocaleString("tr-TR")} ₺</b>
            </span>
            {minRemaining > 0 ? (
              <span className="font-bold text-amber-600">
                +{minRemaining.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺ daha
              </span>
            ) : (
              <span className="font-bold text-emerald-600">✓ Tamam</span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {categories.map(cat => {
          const catItems = items.filter(it => it.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat.name}
              </h3>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {catItems.map((item, i) => {
                  const qty = getQuantity(item.id);
                  return (
                    <ItemRow
                      key={item.id}
                      item={item}
                      qty={qty}
                      onAdd={() => handleAdd(item)}
                      onInc={() => setQuantity(item.id, qty + 1)}
                      onDec={() => setQuantity(item.id, qty - 1)}
                      isLast={i === catItems.length - 1}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Kategorisiz item'lar */}
        {items
          .filter(
            it => !it.category_id || !categories.find(c => c.id === it.category_id)
          )
          .map(item => {
            const qty = getQuantity(item.id);
            return (
              <ItemRow
                key={item.id}
                item={item}
                qty={qty}
                onAdd={() => handleAdd(item)}
                onInc={() => setQuantity(item.id, qty + 1)}
                onDec={() => setQuantity(item.id, qty - 1)}
                isLast
              />
            );
          })}
      </div>

      <CartButton onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function ItemRow({
  item,
  qty,
  onAdd,
  onInc,
  onDec,
  isLast,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  isLast: boolean;
}) {
  const unavailable = item.is_available === false;
  return (
    <div
      className={`flex items-start gap-3 p-4 ${!isLast ? "border-b border-border" : ""} ${unavailable ? "opacity-50" : ""}`}
    >
      {item.photo_url && (
        <img
          src={item.photo_url}
          alt={item.name}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        {item.price > 0 && (
          <p className="mt-1 text-sm font-bold text-primary">
            {item.price.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
          </p>
        )}
        {unavailable && (
          <p className="mt-1 text-[11px] font-bold text-rose-600">Tükendi</p>
        )}
      </div>
      <div className="shrink-0 self-center">
        {qty === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={unavailable}
            className="flex h-9 items-center gap-1 rounded-full bg-primary px-3 text-xs font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Ekle
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onDec}
              aria-label="Azalt"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition active:scale-95"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[24px] text-center text-sm font-extrabold">
              {qty}
            </span>
            <button
              type="button"
              onClick={onInc}
              aria-label="Artır"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
