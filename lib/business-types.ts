import {
  UtensilsCrossed,
  Utensils,
  Coffee,
  Store,
  ShoppingBag,
  Stethoscope,
  Scissors,
  Wrench,
  Building,
  Car,
  CalendarCheck2,
  MessageSquare,
  Package,
  Megaphone,
  ShoppingCart,
  Truck,
  Users,
  Briefcase,
  Clipboard,
  LayoutGrid,
  Home,
  type LucideIcon,
} from "lucide-react";

export type BusinessTypeId =
  | "restoran"
  | "yemek"
  | "kafe"
  | "market"
  | "magaza"
  | "doktor"
  | "kuafor"
  | "usta"
  | "emlakci"
  | "galerici";

export type ModuleId =
  | "menu"
  | "rezervasyonlar"
  | "randevular"
  | "hizmetler"
  | "hastalarim"
  | "urunler"
  | "kampanyalar"
  | "siparisler"
  | "teslimat-ayarlari"
  | "talepler"
  | "emlak-ilanlari"
  | "portfoy"
  | "vasita-ilanlari"
  | "yorumlar";

export interface ModuleConfig {
  id: ModuleId;
  href: string;
  label: string;
  icon: LucideIcon;
}

export const moduleRegistry: Record<ModuleId, ModuleConfig> = {
  menu: { id: "menu", href: "/isletme/menu", label: "Menü / Ürünler", icon: UtensilsCrossed },
  rezervasyonlar: { id: "rezervasyonlar", href: "/isletme/rezervasyonlar", label: "Rezervasyonlar", icon: CalendarCheck2 },
  randevular: { id: "randevular", href: "/isletme/randevular", label: "Randevular", icon: CalendarCheck2 },
  hizmetler: { id: "hizmetler", href: "/isletme/hizmetler", label: "Hizmetlerim", icon: Clipboard },
  hastalarim: { id: "hastalarim", href: "/isletme/hastalarim", label: "Hastalarım", icon: Users },
  urunler: { id: "urunler", href: "/isletme/urunler", label: "Ürünler", icon: Package },
  kampanyalar: { id: "kampanyalar", href: "/isletme/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  siparisler: { id: "siparisler", href: "/isletme/siparisler", label: "Siparişler", icon: ShoppingCart },
  "teslimat-ayarlari": { id: "teslimat-ayarlari", href: "/isletme/teslimat-ayarlari", label: "Teslimat Ayarları", icon: Truck },
  talepler: { id: "talepler", href: "/isletme/talepler", label: "Hizmet Talepleri", icon: Clipboard },
  "emlak-ilanlari": { id: "emlak-ilanlari", href: "/isletme/emlak-ilanlari", label: "Emlak İlanları", icon: Home },
  portfoy: { id: "portfoy", href: "/isletme/portfoy", label: "Portföy", icon: LayoutGrid },
  "vasita-ilanlari": { id: "vasita-ilanlari", href: "/isletme/vasita-ilanlari", label: "Vasıta İlanları", icon: Car },
  yorumlar: { id: "yorumlar", href: "/isletme/yorumlar", label: "Yorumlar", icon: MessageSquare },
};

export interface BusinessTypeConfig {
  id: BusinessTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  modules: ModuleId[];
}

export const businessTypes: Record<BusinessTypeId, BusinessTypeConfig> = {
  restoran: {
    id: "restoran",
    label: "Restoran",
    description: "Dine-in restoran, masa rezervasyonu",
    icon: UtensilsCrossed,
    color: "from-orange-500 to-red-600",
    // Restoran isteğe bağlı online sipariş de açabilir (teslimat-ayarlari'ndan).
    // Açmazsa "Online sipariş kapalı" durumda kalır, müşteri menüyü görür ama veremez.
    modules: ["menu", "rezervasyonlar", "siparisler", "teslimat-ayarlari", "yorumlar"],
  },
  yemek: {
    id: "yemek",
    label: "Yemek (Teslimat)",
    description: "Online sipariş, ev teslimi",
    icon: Utensils,
    color: "from-rose-500 to-orange-500",
    modules: ["menu", "siparisler", "teslimat-ayarlari", "yorumlar"],
  },
  kafe: {
    id: "kafe",
    label: "Kafe / Pastane",
    description: "Kahve, tatlı, hafif yemek",
    icon: Coffee,
    color: "from-amber-500 to-orange-600",
    modules: ["menu", "rezervasyonlar", "siparisler", "teslimat-ayarlari", "yorumlar"],
  },
  market: {
    id: "market",
    label: "Market",
    description: "Gıda, temizlik, online sipariş",
    icon: Store,
    color: "from-emerald-500 to-teal-600",
    modules: ["urunler", "kampanyalar", "siparisler", "teslimat-ayarlari", "yorumlar"],
  },
  magaza: {
    id: "magaza",
    label: "Mağaza",
    description: "Giyim, elektronik, ev-yaşam",
    icon: ShoppingBag,
    color: "from-sky-500 to-blue-600",
    modules: ["urunler", "kampanyalar", "siparisler", "teslimat-ayarlari", "yorumlar"],
  },
  doktor: {
    id: "doktor",
    label: "Doktor / Klinik",
    description: "Muayene, randevu, hasta takibi",
    icon: Stethoscope,
    color: "from-cyan-500 to-blue-600",
    modules: ["randevular", "hizmetler", "hastalarim", "yorumlar"],
  },
  kuafor: {
    id: "kuafor",
    label: "Kuaför / Berber",
    description: "Saç, makyaj, bakım",
    icon: Scissors,
    color: "from-pink-500 to-fuchsia-600",
    modules: ["hizmetler", "randevular", "yorumlar"],
  },
  usta: {
    id: "usta",
    label: "Usta (Tesisat/Elektrik/Boya)",
    description: "Talep üzerine hizmet",
    icon: Wrench,
    color: "from-amber-600 to-orange-700",
    modules: ["hizmetler", "talepler", "yorumlar"],
  },
  emlakci: {
    id: "emlakci",
    label: "Emlakçı",
    description: "Konut, arsa, işyeri ilanları",
    icon: Building,
    color: "from-blue-600 to-indigo-700",
    modules: ["emlak-ilanlari", "portfoy", "yorumlar"],
  },
  galerici: {
    id: "galerici",
    label: "Galerici (Oto)",
    description: "Araç stoğu ve ilanlar",
    icon: Car,
    color: "from-slate-600 to-zinc-700",
    modules: ["vasita-ilanlari", "yorumlar"],
  },
};

export function getBusinessType(id: string | undefined): BusinessTypeConfig {
  if (id && id in businessTypes) return businessTypes[id as BusinessTypeId];
  return businessTypes.restoran;
}
