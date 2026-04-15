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
  Utensils,
  UtensilsCrossed,
  Megaphone,
  Wrench,
  PartyPopper,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export interface QuickService {
  label: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

export const quickServices: QuickService[] = [
  { label: "Eczane", icon: Pill, color: "text-rose-500", href: "#" },
  { label: "ATM", icon: Wallet, color: "text-emerald-500", href: "#" },
  { label: "Benzinlik", icon: Fuel, color: "text-amber-500", href: "#" },
  { label: "Hastane", icon: Hospital, color: "text-red-500", href: "#" },
  { label: "Market", icon: ShoppingCart, color: "text-sky-500", href: "#" },
  { label: "Banka", icon: Landmark, color: "text-violet-500", href: "#" },
  { label: "Postane", icon: Mail, color: "text-orange-500", href: "#" },
  { label: "Kargo", icon: Package, color: "text-teal-500", href: "#" },
];

export interface HomeCategory {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const homeCategories: HomeCategory[] = [
  { label: "Gebzem AI", icon: Sparkles, href: "/ai" },
  { label: "Yemek", icon: Utensils, href: "#" },
  { label: "Restoran", icon: UtensilsCrossed, href: "#" },
  { label: "İlan", icon: Megaphone, href: "#" },
  { label: "Hizmetler", icon: Wrench, href: "#" },
  { label: "Etkinlik", icon: PartyPopper, href: "#" },
  { label: "İş Başvurusu", icon: Briefcase, href: "#" },
];
