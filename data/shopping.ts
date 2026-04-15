import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  Gamepad2,
  Book,
  type LucideIcon,
} from "lucide-react";

export interface ShopCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  subCategories: { id: string; label: string }[];
}

export const shopCategories: ShopCategory[] = [
  {
    id: "elektronik",
    label: "Elektronik",
    icon: Smartphone,
    color: "from-blue-500 to-indigo-600",
    subCategories: [
      { id: "telefon", label: "Cep Telefonu" },
      { id: "laptop", label: "Laptop" },
      { id: "tablet", label: "Tablet" },
      { id: "kulaklik", label: "Kulaklık" },
      { id: "aksesuar", label: "Aksesuar" },
    ],
  },
  {
    id: "giyim",
    label: "Giyim",
    icon: Shirt,
    color: "from-rose-500 to-pink-600",
    subCategories: [
      { id: "kadin", label: "Kadın" },
      { id: "erkek", label: "Erkek" },
      { id: "cocuk", label: "Çocuk" },
      { id: "ayakkabi", label: "Ayakkabı" },
      { id: "canta", label: "Çanta" },
    ],
  },
  {
    id: "ev-yasam",
    label: "Ev & Yaşam",
    icon: Home,
    color: "from-emerald-500 to-teal-600",
    subCategories: [
      { id: "mobilya", label: "Mobilya" },
      { id: "dekorasyon", label: "Dekorasyon" },
      { id: "mutfak", label: "Mutfak" },
      { id: "banyo", label: "Banyo" },
    ],
  },
  {
    id: "kozmetik",
    label: "Kozmetik",
    icon: Sparkles,
    color: "from-purple-500 to-fuchsia-600",
    subCategories: [
      { id: "parfum", label: "Parfüm" },
      { id: "makyaj", label: "Makyaj" },
      { id: "cilt-bakim", label: "Cilt Bakım" },
    ],
  },
  {
    id: "spor",
    label: "Spor",
    icon: Dumbbell,
    color: "from-amber-500 to-orange-600",
    subCategories: [
      { id: "fitness", label: "Fitness" },
      { id: "outdoor", label: "Outdoor" },
      { id: "bisiklet", label: "Bisiklet" },
    ],
  },
  {
    id: "oyuncak",
    label: "Oyuncak",
    icon: Gamepad2,
    color: "from-cyan-500 to-sky-600",
    subCategories: [
      { id: "cocuk-oyuncak", label: "Çocuk" },
      { id: "lego", label: "Lego" },
      { id: "oyun-konsol", label: "Oyun Konsolu" },
    ],
  },
  {
    id: "bebek",
    label: "Bebek",
    icon: Baby,
    color: "from-pink-400 to-rose-500",
    subCategories: [
      { id: "bebek-bakim", label: "Bebek Bakım" },
      { id: "bebek-giyim", label: "Bebek Giyim" },
    ],
  },
  {
    id: "kitap",
    label: "Kitap",
    icon: Book,
    color: "from-violet-500 to-purple-700",
    subCategories: [
      { id: "roman", label: "Roman" },
      { id: "cocuk-kitap", label: "Çocuk Kitap" },
      { id: "akademik", label: "Akademik" },
    ],
  },
];

export interface ShopProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  gradient: string;
  freeShipping?: boolean;
  description?: string;
}

export const shopProducts: ShopProduct[] = [
  // Elektronik
  { id: "s-1", name: "iPhone 15 Pro 256GB", brand: "Apple", category: "elektronik", subCategory: "telefon", price: 78500, oldPrice: 85000, rating: 4.8, reviewCount: 1240, gradient: "from-amber-300 to-orange-500", freeShipping: true, description: "Natural Titanium renk, 256GB hafıza, Apple Türkiye garantili." },
  { id: "s-2", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "elektronik", subCategory: "telefon", price: 65000, rating: 4.7, reviewCount: 892, gradient: "from-gray-400 to-slate-700", freeShipping: true },
  { id: "s-3", name: "MacBook Air M2 13\"", brand: "Apple", category: "elektronik", subCategory: "laptop", price: 56500, rating: 4.9, reviewCount: 2100, gradient: "from-slate-300 to-zinc-500", freeShipping: true },
  { id: "s-4", name: "AirPods Pro 2", brand: "Apple", category: "elektronik", subCategory: "kulaklik", price: 9500, rating: 4.8, reviewCount: 5412, gradient: "from-gray-200 to-slate-400", freeShipping: true },
  // Giyim
  { id: "s-10", name: "Erkek Klasik Gömlek", brand: "Mavi", category: "giyim", subCategory: "erkek", price: 650, oldPrice: 900, rating: 4.5, reviewCount: 324, gradient: "from-blue-400 to-indigo-600" },
  { id: "s-11", name: "Kadın Jean Pantolon", brand: "Mavi", category: "giyim", subCategory: "kadin", price: 950, rating: 4.6, reviewCount: 512, gradient: "from-indigo-500 to-blue-700" },
  { id: "s-12", name: "Nike Air Max Koşu Ayakkabı", brand: "Nike", category: "giyim", subCategory: "ayakkabi", price: 2800, rating: 4.7, reviewCount: 1820, gradient: "from-rose-400 to-red-600", freeShipping: true },
  // Ev & Yaşam
  { id: "s-20", name: "3 Kişilik Chester Koltuk", brand: "İpek Mobilya", category: "ev-yasam", subCategory: "mobilya", price: 18500, oldPrice: 24000, rating: 4.4, reviewCount: 89, gradient: "from-amber-500 to-orange-700" },
  { id: "s-21", name: "Mutfak Robotu", brand: "Arzum", category: "ev-yasam", subCategory: "mutfak", price: 3250, rating: 4.5, reviewCount: 412, gradient: "from-slate-400 to-gray-600", freeShipping: true },
  // Kozmetik
  { id: "s-30", name: "Parfüm 50ml", brand: "Dior", category: "kozmetik", subCategory: "parfum", price: 4500, rating: 4.8, reviewCount: 1024, gradient: "from-pink-300 to-rose-600", freeShipping: true },
  { id: "s-31", name: "Cilt Bakım Seti", brand: "La Roche-Posay", category: "kozmetik", subCategory: "cilt-bakim", price: 1850, oldPrice: 2350, rating: 4.7, reviewCount: 678, gradient: "from-sky-200 to-blue-400" },
  // Spor
  { id: "s-40", name: "Dumbell Seti 20kg", brand: "Fitness Plus", category: "spor", subCategory: "fitness", price: 2200, rating: 4.6, reviewCount: 234, gradient: "from-zinc-500 to-gray-700" },
  // Oyuncak
  { id: "s-50", name: "LEGO Star Wars Set", brand: "LEGO", category: "oyuncak", subCategory: "lego", price: 1850, rating: 4.9, reviewCount: 890, gradient: "from-yellow-400 to-orange-600", freeShipping: true },
];

export function getProductById(id: string) {
  return shopProducts.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string, subId?: string) {
  return shopProducts.filter(
    (p) =>
      p.category === categoryId &&
      (!subId || p.subCategory === subId)
  );
}

export function getCategoryById(id: string) {
  return shopCategories.find((c) => c.id === id);
}
