// Sipariş & sepet TypeScript tipleri.

export type OrderStatus =
  | "bekliyor" // kullanıcı oluşturdu, işletme henüz onaylamadı
  | "onaylandi" // işletme kabul etti
  | "hazirlaniyor" // mutfakta hazırlanıyor
  | "hazir" // hazır, kurye bekliyor
  | "yolda" // yola çıktı
  | "teslim_edildi" // teslim edildi
  | "iptal"; // iptal (kullanıcı veya işletme)

export type PaymentMethod =
  | "nakit" // kapıda nakit
  | "kart_kapida" // kapıda kart (POS)
  | "eft"; // havale/EFT (sipariş sonrası)

export type PaymentStatus = "beklemede" | "odendi" | "iade";

export interface CartItem {
  // Menu item'ın orijinal id'si — backend'e gönderirken kullanılır
  menuItemId: string;
  // Sepete eklendiği andaki snapshot fiyat (ürün fiyatı sonradan değişse bile sepet aynı kalır)
  name: string;
  price: number;
  // Adet
  quantity: number;
  // Ürün fotoğrafı (UI için)
  photoUrl?: string;
  // Kullanıcının özel isteği ("yağsız", "zeytinli olmasın")
  note?: string;
}

export interface Cart {
  // Tek seferde TEK işletmeden sipariş — basit, net.
  // Kullanıcı farklı işletmeden ürün eklemek isterse uyarı + sepet temizleme.
  businessId: string;
  businessName: string;
  businessType?: string;
  items: CartItem[];
  // Notlar (genel sipariş notu)
  note?: string;
  // İlk eklendiği zaman (eski sepetleri TTL ile temizleme için)
  createdAt: number;
}

export interface OrderItem {
  id?: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Order {
  id: string;
  user_id: string;
  business_id: string;
  business_name?: string; // join'den gelir
  business_phone?: string;

  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;

  // Adres snapshot
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_district?: string;

  // İletişim
  contact_phone: string;
  contact_name?: string;

  // Tutarlar
  subtotal: number;
  delivery_fee: number;
  total: number;

  // Notlar
  user_note?: string;
  business_note?: string;

  // Item'lar
  items: OrderItem[];

  // Zamanlamalar
  created_at: string;
  accepted_at?: string;
  ready_at?: string;
  delivering_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  estimated_delivery_min?: number;

  // Kurye (gelecek için hazır)
  courier_id?: string;
  courier_lat?: number;
  courier_lng?: number;

  // Değerlendirme
  rating?: number;
  rating_comment?: string;
  rated_at?: string;
}

export interface UserAddress {
  id: string;
  user_id?: string;
  label?: string; // "Ev", "İş"
  address: string;
  district?: string;
  lat?: number;
  lng?: number;
  is_default: boolean;
  contact_phone?: string;
  contact_name?: string;
  created_at?: string;
}

export interface BusinessDeliverySettings {
  business_id?: string;
  accepts_orders: boolean;
  delivery_fee: number;
  free_delivery_threshold?: number;
  min_order_amount: number;
  delivery_radius_km: number;
  estimated_delivery_min: number;
  accepts_cash: boolean;
  accepts_card_at_door: boolean;
  accepts_eft: boolean;
  eft_iban?: string;
  eft_bank_name?: string;
  eft_account_holder?: string;
  open_hour: number;
  close_hour: number;
  is_open_now?: boolean;
}

// UI yardımcıları
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  bekliyor: "Bekliyor",
  onaylandi: "Onaylandı",
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  yolda: "Yolda",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  bekliyor: "#f59e0b", // amber
  onaylandi: "#0ea5e9", // sky
  hazirlaniyor: "#8b5cf6", // violet
  hazir: "#06b6d4", // cyan
  yolda: "#10b981", // emerald
  teslim_edildi: "#22c55e", // green
  iptal: "#dc2626", // red
};

// Aktif sipariş = kullanıcı için takip edilebilir, iptal/teslim edilmiş değil
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "bekliyor",
  "onaylandi",
  "hazirlaniyor",
  "hazir",
  "yolda",
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  nakit: "Kapıda Nakit",
  kart_kapida: "Kapıda Kart",
  eft: "Havale / EFT",
};

// Sepet TTL — 24 saat sonra eski sepet otomatik temizlenir
export const CART_TTL_MS = 24 * 60 * 60 * 1000;
