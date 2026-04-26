"use client";

// Sepet state yönetimi.
// - localStorage based (login olmadan da çalışır)
// - SSR safe (typeof window guard)
// - Tek seferde TEK işletmeden sipariş (multi-restaurant cart YOK)
// - Farklı işletmeden ürün eklenirse onay sorulur, sepet temizlenir
// - 24 saat TTL — eski sepetler otomatik silinir

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type Cart,
  type CartItem,
  CART_TTL_MS,
} from "./types/order";

const STORAGE_KEY = "gebzem_cart";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  total: number;
  // Sepetteki belirli bir ürünün adet sayısı
  getQuantity: (menuItemId: string) => number;
  // Ürün ekle — eğer farklı işletmeden ise eski sepet temizleneceğine dair
  // confirm() çıkarır. Reddederse sepet değişmez, false döner.
  addItem: (
    business: { id: string; name: string; type?: string },
    item: Omit<CartItem, "quantity">,
    qty?: number
  ) => boolean;
  // Adet azalt (qty=1 ise siler)
  removeItem: (menuItemId: string) => void;
  // Doğrudan adet set et (0 = sil)
  setQuantity: (menuItemId: string, qty: number) => void;
  // Ürün notunu güncelle
  setItemNote: (menuItemId: string, note: string) => void;
  // Sipariş genel notu
  setNote: (note: string) => void;
  // Sepeti tamamen temizle (sipariş gönderildikten sonra çağrılır)
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cart;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.businessId !== "string" ||
      !Array.isArray(parsed.items) ||
      typeof parsed.createdAt !== "number"
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // TTL kontrolü
    if (Date.now() - parsed.createdAt > CART_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Item'ları sanitize et
    const cleanItems: CartItem[] = [];
    for (const it of parsed.items) {
      if (!it || typeof it.menuItemId !== "string") continue;
      const qty = Number(it.quantity);
      const price = Number(it.price);
      if (!Number.isFinite(qty) || qty < 1) continue;
      if (!Number.isFinite(price) || price < 0) continue;
      cleanItems.push({
        menuItemId: it.menuItemId,
        name: String(it.name || "Ürün").slice(0, 200),
        price,
        quantity: Math.min(99, Math.floor(qty)),
        photoUrl: typeof it.photoUrl === "string" ? it.photoUrl : undefined,
        note:
          typeof it.note === "string" ? it.note.slice(0, 500) : undefined,
      });
    }
    if (cleanItems.length === 0) return null;
    return {
      businessId: parsed.businessId,
      businessName: String(parsed.businessName || "").slice(0, 200),
      businessType:
        typeof parsed.businessType === "string"
          ? parsed.businessType
          : undefined,
      items: cleanItems,
      note:
        typeof parsed.note === "string"
          ? parsed.note.slice(0, 500)
          : undefined,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

function writeCart(cart: Cart | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!cart || cart.items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  } catch {
    // private mode / storage full — sessizce yut
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const isHydratedRef = useRef(false);

  // Mount: localStorage'dan oku
  useEffect(() => {
    setCart(readCart());
    isHydratedRef.current = true;
  }, []);

  // Cross-tab sync: başka sekmede sepet güncellenirse burada da yansısın
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setCart(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cart state değişince yaz
  useEffect(() => {
    if (!isHydratedRef.current) return;
    writeCart(cart);
  }, [cart]);

  const getQuantity = useCallback(
    (menuItemId: string) => {
      if (!cart) return 0;
      const found = cart.items.find(i => i.menuItemId === menuItemId);
      return found?.quantity ?? 0;
    },
    [cart]
  );

  const addItem = useCallback(
    (
      business: { id: string; name: string; type?: string },
      item: Omit<CartItem, "quantity">,
      qty: number = 1
    ): boolean => {
      const safeQty = Math.max(1, Math.min(99, Math.floor(qty)));
      // Farklı işletmeden ürün ekleniyor mu?
      if (cart && cart.businessId !== business.id && cart.items.length > 0) {
        const ok = window.confirm(
          `Sepetinde "${cart.businessName}" işletmesinden ürün var. Yeni işletmenin ürününü eklersen önceki sepet temizlenir. Devam edilsin mi?`
        );
        if (!ok) return false;
        // Yeni sepet
        setCart({
          businessId: business.id,
          businessName: business.name,
          businessType: business.type,
          items: [{ ...item, quantity: safeQty }],
          createdAt: Date.now(),
        });
        return true;
      }
      // Aynı işletme veya boş sepet
      setCart(prev => {
        if (!prev || prev.businessId !== business.id) {
          return {
            businessId: business.id,
            businessName: business.name,
            businessType: business.type,
            items: [{ ...item, quantity: safeQty }],
            createdAt: Date.now(),
          };
        }
        const existing = prev.items.find(i => i.menuItemId === item.menuItemId);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map(i =>
              i.menuItemId === item.menuItemId
                ? {
                    ...i,
                    quantity: Math.min(99, i.quantity + safeQty),
                    // Ad/foto/fiyat snapshot'ını güncelle (yeni eklemede taze)
                    name: item.name,
                    price: item.price,
                    photoUrl: item.photoUrl ?? i.photoUrl,
                  }
                : i
            ),
          };
        }
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity: safeQty }],
        };
      });
      return true;
    },
    [cart]
  );

  const removeItem = useCallback((menuItemId: string) => {
    setCart(prev => {
      if (!prev) return prev;
      const updated = prev.items
        .map(i =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0);
      if (updated.length === 0) return null;
      return { ...prev, items: updated };
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, qty: number) => {
    const safeQty = Math.max(0, Math.min(99, Math.floor(qty)));
    setCart(prev => {
      if (!prev) return prev;
      if (safeQty === 0) {
        const updated = prev.items.filter(i => i.menuItemId !== menuItemId);
        if (updated.length === 0) return null;
        return { ...prev, items: updated };
      }
      const exists = prev.items.some(i => i.menuItemId === menuItemId);
      if (!exists) return prev; // ekleme değil, sadece set
      return {
        ...prev,
        items: prev.items.map(i =>
          i.menuItemId === menuItemId ? { ...i, quantity: safeQty } : i
        ),
      };
    });
  }, []);

  const setItemNote = useCallback((menuItemId: string, note: string) => {
    const safe = String(note || "").slice(0, 500);
    setCart(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i =>
          i.menuItemId === menuItemId ? { ...i, note: safe } : i
        ),
      };
    });
  }, []);

  const setNote = useCallback((note: string) => {
    const safe = String(note || "").slice(0, 500);
    setCart(prev => (prev ? { ...prev, note: safe } : prev));
  }, []);

  const clear = useCallback(() => {
    setCart(null);
  }, []);

  const itemCount = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, i) => sum + i.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      total,
      getQuantity,
      addItem,
      removeItem,
      setQuantity,
      setItemNote,
      setNote,
      clear,
    }),
    [cart, itemCount, total, getQuantity, addItem, removeItem, setQuantity, setItemNote, setNote, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // Provider olmadan kullanılırsa varsayılan no-op döndür (SSR safety)
    return {
      cart: null,
      itemCount: 0,
      total: 0,
      getQuantity: () => 0,
      addItem: () => false,
      removeItem: () => {},
      setQuantity: () => {},
      setItemNote: () => {},
      setNote: () => {},
      clear: () => {},
    };
  }
  return ctx;
}
