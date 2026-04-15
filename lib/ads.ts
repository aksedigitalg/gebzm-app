// Reklam sistemi — Kampanya, reklam, tracking altyapısı

export type CampaignObjective =
  | "visits"
  | "orders"
  | "reservations"
  | "listings"
  | "awareness";

export type CampaignStatus = "active" | "paused" | "draft" | "completed" | "pending-review";

export type Placement =
  | "home-slider"
  | "category-banner"
  | "search-results"
  | "map-premium"
  | "listing-featured";

export type BudgetType = "daily" | "total";

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  businessType: string;
  name: string;
  objective: CampaignObjective;
  budget: {
    type: BudgetType;
    amount: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
  };
  targeting: {
    locations: string[];
    ageMin: number;
    ageMax: number;
    gender: "all" | "male" | "female";
    interests: string[];
  };
  placements: Placement[];
  ad: {
    title: string;
    description: string;
    gradient: string;
    cta: string;
    ctaUrl: string;
  };
  status: CampaignStatus;
  createdAt: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

export const objectiveLabels: Record<CampaignObjective, string> = {
  visits: "Profil Ziyareti",
  orders: "Sipariş",
  reservations: "Rezervasyon",
  listings: "İlan Tıklaması",
  awareness: "Marka Bilinirliği",
};

export const objectiveDescriptions: Record<CampaignObjective, string> = {
  visits: "İşletme profilinize daha fazla ziyaretçi çekin",
  orders: "Online sipariş almayı hızlandırın",
  reservations: "Rezervasyon sayınızı artırın",
  listings: "İlanlarınızı öne çıkarın",
  awareness: "Markanızı yeni kullanıcılara tanıtın",
};

export const placementLabels: Record<Placement, string> = {
  "home-slider": "Ana Sayfa Slider",
  "category-banner": "Kategori Banner",
  "search-results": "Arama Sonuçları",
  "map-premium": "Harita Premium Marker",
  "listing-featured": "İlan Öne Çıkarma",
};

export const statusLabels: Record<CampaignStatus, { label: string; cls: string }> = {
  active: { label: "Yayında", cls: "bg-emerald-500/10 text-emerald-600" },
  paused: { label: "Duraklatıldı", cls: "bg-amber-500/10 text-amber-600" },
  draft: { label: "Taslak", cls: "bg-slate-500/10 text-slate-600" },
  completed: { label: "Tamamlandı", cls: "bg-blue-500/10 text-blue-600" },
  "pending-review": {
    label: "İnceleme Bekliyor",
    cls: "bg-violet-500/10 text-violet-600",
  },
};

// Demo kampanyalar
export const demoCampaigns: Campaign[] = [
  {
    id: "camp-1",
    businessId: "biz-demo-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    name: "Hafta Sonu Mangal Keyfi",
    objective: "reservations",
    budget: { type: "daily", amount: 150 },
    schedule: { startDate: "2026-04-10", endDate: "2026-05-10" },
    targeting: {
      locations: ["Gebze"],
      ageMin: 25,
      ageMax: 55,
      gender: "all",
      interests: ["Yemek", "Et"],
    },
    placements: ["home-slider", "category-banner"],
    ad: {
      title: "Aile Dostu Mangal Evi",
      description: "Hafta sonu bahçede mangal keyfi, rezervasyon avantajlı",
      gradient: "from-orange-500 to-red-600",
      cta: "Rezervasyon Yap",
      ctaUrl: "/restoran/gebze-mangal-evi",
    },
    status: "active",
    createdAt: "2026-04-09T10:00:00",
    metrics: { impressions: 24580, clicks: 1284, conversions: 89, spend: 3250 },
  },
  {
    id: "camp-2",
    businessId: "biz-demo-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    name: "Öğle Menü Kampanyası",
    objective: "orders",
    budget: { type: "daily", amount: 100 },
    schedule: { startDate: "2026-04-01", endDate: "2026-04-30" },
    targeting: {
      locations: ["Gebze", "Darıca"],
      ageMin: 20,
      ageMax: 45,
      gender: "all",
      interests: ["Yemek", "Öğle Yemeği"],
    },
    placements: ["home-slider", "search-results"],
    ad: {
      title: "%20 İndirim · Öğle Menüsü",
      description: "11:00-15:00 arası sipariş ver, kazan",
      gradient: "from-amber-500 to-orange-600",
      cta: "Sipariş Ver",
      ctaUrl: "/yemek",
    },
    status: "active",
    createdAt: "2026-04-01T08:00:00",
    metrics: { impressions: 18420, clicks: 892, conversions: 124, spend: 2240 },
  },
  {
    id: "camp-3",
    businessId: "biz-demo-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    name: "Marka Tanıtım — Yaz Sezonu",
    objective: "awareness",
    budget: { type: "total", amount: 2500 },
    schedule: { startDate: "2026-05-01", endDate: "2026-05-31" },
    targeting: {
      locations: ["Gebze", "Darıca", "Çayırova", "Kocaeli"],
      ageMin: 18,
      ageMax: 65,
      gender: "all",
      interests: ["Yemek", "Aile"],
    },
    placements: ["home-slider", "category-banner", "search-results"],
    ad: {
      title: "Gebze'nin Köklü Lezzeti",
      description: "15 yıllık deneyim, bahçe servisi, aileyle buluşma noktası",
      gradient: "from-emerald-500 to-teal-600",
      cta: "Detaylar",
      ctaUrl: "/restoran/gebze-mangal-evi",
    },
    status: "draft",
    createdAt: "2026-04-14T15:30:00",
    metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
  },
  {
    id: "camp-4",
    businessId: "biz-demo-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    name: "İftar Menüsü Ramazan",
    objective: "reservations",
    budget: { type: "daily", amount: 200 },
    schedule: { startDate: "2026-03-01", endDate: "2026-03-30" },
    targeting: {
      locations: ["Gebze"],
      ageMin: 25,
      ageMax: 65,
      gender: "all",
      interests: ["Yemek", "İftar"],
    },
    placements: ["home-slider", "category-banner"],
    ad: {
      title: "İftar Menüsü — 3 Kişi 850₺",
      description: "Bahçe ve salonumuzda iftar keyfi",
      gradient: "from-rose-500 to-pink-600",
      cta: "Rezervasyon",
      ctaUrl: "/restoran/gebze-mangal-evi",
    },
    status: "completed",
    createdAt: "2026-02-20T10:00:00",
    metrics: { impressions: 42100, clicks: 2840, conversions: 324, spend: 6000 },
  },
];

// Platform genelindeki aktif reklam listesi (kullanıcı tarafında gösterilecek)
export interface ActiveAd {
  id: string;
  campaignId: string;
  businessName: string;
  businessType: string;
  title: string;
  description: string;
  gradient: string;
  cta: string;
  ctaUrl: string;
  placements: Placement[];
}

export function getActiveAds(): ActiveAd[] {
  return demoCampaigns
    .filter((c) => c.status === "active")
    .map((c) => ({
      id: c.id,
      campaignId: c.id,
      businessName: c.businessName,
      businessType: c.businessType,
      title: c.ad.title,
      description: c.ad.description,
      gradient: c.ad.gradient,
      cta: c.ad.cta,
      ctaUrl: c.ad.ctaUrl,
      placements: c.placements,
    }));
}

// Platform genelinde farklı işletmelerin sponsor reklamları (user'ın göreceği)
export const platformAds: ActiveAd[] = [
  {
    id: "pad-1",
    campaignId: "pcamp-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    title: "Aile Dostu Mangal Keyfi",
    description: "Bahçede köz mangal, rezervasyon şart",
    gradient: "from-orange-500 to-red-600",
    cta: "Rezervasyon",
    ctaUrl: "/restoran/gebze-mangal-evi",
    placements: ["home-slider"],
  },
  {
    id: "pad-2",
    campaignId: "pcamp-2",
    businessName: "Köşeoğlu Kebap",
    businessType: "Yemek",
    title: "%20 İndirim Bu Hafta",
    description: "Adana, Urfa, Kuzu Şiş indirimli",
    gradient: "from-amber-500 to-orange-600",
    cta: "Siparişe Git",
    ctaUrl: "/yemek/koseoglu-kebap",
    placements: ["home-slider", "category-banner"],
  },
  {
    id: "pad-3",
    campaignId: "pcamp-3",
    businessName: "Berna Kuaför",
    businessType: "Kuaför",
    title: "Evde Saç Bakımı",
    description: "Uzman ekip, randevu kolay",
    gradient: "from-pink-500 to-fuchsia-600",
    cta: "Randevu Al",
    ctaUrl: "/hizmetler/berna-kuafor",
    placements: ["home-slider"],
  },
  {
    id: "pad-4",
    campaignId: "pcamp-4",
    businessName: "Dr. Ayşe Yıldız",
    businessType: "Doktor",
    title: "Dahiliye Uzmanı — Aynı Gün Randevu",
    description: "15 yıllık deneyim, tahlil anlaşmalı",
    gradient: "from-cyan-500 to-blue-600",
    cta: "Randevu",
    ctaUrl: "/hizmetler/dr-ayse-yildiz",
    placements: ["home-slider"],
  },
];

// Kampanya metrik toplamları
export function campaignTotals(campaigns: Campaign[]) {
  return campaigns.reduce(
    (acc, c) => {
      acc.impressions += c.metrics.impressions;
      acc.clicks += c.metrics.clicks;
      acc.conversions += c.metrics.conversions;
      acc.spend += c.metrics.spend;
      return acc;
    },
    { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
  );
}

export function computeCTR(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function computeCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return spend / clicks;
}

export function computeCPM(spend: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (spend / impressions) * 1000;
}

export function computeROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return revenue / spend;
}
