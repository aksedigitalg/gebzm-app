import {
  Pill,
  Fuel,
  Hospital,
  ShoppingCart,
  Landmark,
  Mail,
  Package,
  Wallet,
  Sparkles,
  Megaphone,
  Wrench,
  MapPin,
  Bus,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

export interface QuickService {
  label: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

export const quickServices: QuickService[] = [
  { label: "Eczane", icon: Pill, color: "text-rose-500", href: "/harita?servis=eczane" },
  { label: "ATM", icon: Wallet, color: "text-emerald-500", href: "/harita?servis=atm" },
  { label: "Benzinlik", icon: Fuel, color: "text-amber-500", href: "/harita?servis=benzinlik" },
  { label: "Hastane", icon: Hospital, color: "text-red-500", href: "/harita?servis=hastane" },
  { label: "Market", icon: ShoppingCart, color: "text-sky-500", href: "/harita?servis=market" },
  { label: "Banka", icon: Landmark, color: "text-violet-500", href: "/harita?servis=banka" },
  { label: "Postane", icon: Mail, color: "text-orange-500", href: "/harita?servis=postane" },
  { label: "Kargo", icon: Package, color: "text-teal-500", href: "/harita?servis=kargo" },
];

export interface HomeCategory {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const homeCategories: HomeCategory[] = [
  { label: "Gebzem AI", icon: Sparkles, href: "/ai" },
  { label: "Hizmetler", icon: Wrench, href: "/hizmetler" },
  { label: "İlanlar", icon: Megaphone, href: "/ilanlar" },
  { label: "Harita", icon: MapPin, href: "/harita" },
  { label: "Ulaşım", icon: Bus, href: "/ulasim" },
  { label: "Acil", icon: PhoneCall, href: "/acil" },
];
