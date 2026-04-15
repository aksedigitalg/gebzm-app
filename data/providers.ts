import {
  Wrench,
  Zap,
  Brush,
  Sparkles as Sparkle,
  Truck,
  Scissors,
  Droplets,
  Flower2,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ServiceProvider {
  slug: string;
  name: string;
  category: string; // id
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  responseTime: string;
  verified: boolean;
  photo: string; // initials / gradient
  description: string;
  features: string[];
  location: string;
  completedJobs: number;
}

export const serviceCategories: ServiceCategory[] = [
  { id: "tesisatci", label: "Tesisatçı", icon: Wrench, description: "Su tesisatı, tıkanıklık" },
  { id: "elektrikci", label: "Elektrikçi", icon: Zap, description: "Elektrik arıza, kablolama" },
  { id: "boyaci", label: "Boyacı", icon: Brush, description: "İç & dış mekan boyama" },
  { id: "temizlik", label: "Temizlik", icon: Sparkle, description: "Ev & ofis temizliği" },
  { id: "nakliye", label: "Nakliye", icon: Truck, description: "Ev taşıma, eşya nakliye" },
  { id: "kuafor", label: "Kuaför", icon: Scissors, description: "Evde saç, makyaj" },
  { id: "klima", label: "Klima Servisi", icon: Droplets, description: "Klima montaj, bakım" },
  { id: "bahce", label: "Bahçıvan", icon: Flower2, description: "Bahçe bakımı, peyzaj" },
];

export const serviceProviders: ServiceProvider[] = [
  {
    slug: "mehmet-usta-tesisat",
    name: "Mehmet Usta Tesisat",
    category: "tesisatci",
    categoryLabel: "Tesisatçı",
    rating: 4.9,
    reviewCount: 284,
    priceRange: "250 - 500₺",
    responseTime: "~ 1 saat",
    verified: true,
    photo: "MU",
    description: "15 yıllık deneyim, 7/24 hizmet. Tıkanıklık, kaçak, armatür değişimi.",
    features: ["Sigortalı", "Garanti", "7/24", "Fatura"],
    location: "Gebze merkez ve çevresi",
    completedJobs: 1247,
  },
  {
    slug: "hasan-elektrik",
    name: "Hasan Elektrik",
    category: "elektrikci",
    categoryLabel: "Elektrikçi",
    rating: 4.8,
    reviewCount: 196,
    priceRange: "200 - 800₺",
    responseTime: "~ 2 saat",
    verified: true,
    photo: "HE",
    description: "Ev ve işyeri elektrik işleri. LED montaj, sigorta, pano.",
    features: ["Sigortalı", "Garanti", "Fatura"],
    location: "Gebze, Darıca, Çayırova",
    completedJobs: 892,
  },
  {
    slug: "ali-boya-dekor",
    name: "Ali Boya & Dekor",
    category: "boyaci",
    categoryLabel: "Boyacı",
    rating: 4.7,
    reviewCount: 142,
    priceRange: "m² başı 80 - 200₺",
    responseTime: "1-3 gün",
    verified: true,
    photo: "AB",
    description: "İç ve dış cephe boyama, alçı, dekoratif boya. Keşif ücretsiz.",
    features: ["Ücretsiz Keşif", "Malzeme Dahil", "Garanti"],
    location: "Kocaeli geneli",
    completedJobs: 312,
  },
  {
    slug: "temiz-ev",
    name: "Temiz Ev Servisi",
    category: "temizlik",
    categoryLabel: "Temizlik",
    rating: 4.8,
    reviewCount: 465,
    priceRange: "saat başı 150₺",
    responseTime: "Ertesi gün",
    verified: true,
    photo: "TE",
    description: "Ev, ofis, inşaat sonrası detaylı temizlik. Deneyimli kadro.",
    features: ["Malzeme Dahil", "Kadın Ekip", "Online Ödeme"],
    location: "Gebze, Darıca",
    completedJobs: 2104,
  },
  {
    slug: "osman-nakliye",
    name: "Osman Nakliye",
    category: "nakliye",
    categoryLabel: "Nakliye",
    rating: 4.6,
    reviewCount: 203,
    priceRange: "Ev: 3.500 - 8.000₺",
    responseTime: "~ 3 saat",
    verified: true,
    photo: "ON",
    description: "Şehir içi ve şehirler arası ev eşya taşıma. Ambalaj dahil.",
    features: ["Ambalaj Dahil", "Sigortalı", "Asansörlü Araç"],
    location: "Türkiye geneli",
    completedJobs: 1588,
  },
  {
    slug: "berna-kuafor",
    name: "Berna Kuaför (Evde)",
    category: "kuafor",
    categoryLabel: "Kuaför",
    rating: 4.9,
    reviewCount: 178,
    priceRange: "250 - 1200₺",
    responseTime: "Aynı gün",
    verified: true,
    photo: "BK",
    description: "Evde saç kesim, renklendirme, fön, düğün makyajı.",
    features: ["Kadın Müşteri", "Premium Ürünler", "Online Rezervasyon"],
    location: "Gebze, Darıca",
    completedJobs: 687,
  },
  {
    slug: "gebze-klima",
    name: "Gebze Klima Servisi",
    category: "klima",
    categoryLabel: "Klima Servisi",
    rating: 4.7,
    reviewCount: 238,
    priceRange: "Montaj: 1200 - 2500₺",
    responseTime: "~ 4 saat",
    verified: true,
    photo: "GK",
    description: "Her marka klima montaj, gaz dolumu, bakım. Orjinal yedek parça.",
    features: ["Yetkili Servis", "Garanti", "Sigortalı"],
    location: "Gebze ve çevresi",
    completedJobs: 934,
  },
];
