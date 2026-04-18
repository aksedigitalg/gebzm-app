export interface DineInRestaurant {
  slug: string;
  name: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4; // ₺, ₺₺, ₺₺₺, ₺₺₺₺
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  hours: string;
  features: string[]; // Açık hava, Otopark, Rezervasyon vb.
  coverGradient: string;
  coordinates: [number, number];
  description: string;
}

export const dineInRestaurants: DineInRestaurant[] = [
  {
    slug: "gebze-mangal-evi",
    name: "Gebze Mangal Evi",
    cuisine: "Türk Mutfağı · Mangal",
    priceLevel: 2,
    rating: 4.6,
    reviewCount: 842,
    address: "Mustafa Paşa Mah., Gebze",
    phone: "0 262 641 11 22",
    hours: "12:00 - 00:00",
    features: ["Açık Hava", "Rezervasyon", "Otopark", "WiFi"],
    coverGradient: "from-orange-500/60 to-red-700/60",
    coordinates: [40.8038, 29.4321],
    description:
      "Gebze'nin köklü mangal evlerinden. Dana kuşbaşı, kuzu pirzola ve ızgara köftesi meşhur. Bahçeli alanı aile gruplarını ağırlamak için ideal.",
  },
  {
    slug: "balikci-mehmet",
    name: "Balıkçı Mehmet",
    cuisine: "Balık & Deniz Ürünleri",
    priceLevel: 3,
    rating: 4.7,
    reviewCount: 512,
    address: "Eskihisar Sahil, Gebze",
    phone: "0 262 655 00 00",
    hours: "11:00 - 23:30",
    features: ["Deniz Manzarası", "Rezervasyon", "Otopark", "Rakı"],
    coverGradient: "from-sky-500/60 to-blue-700/60",
    coordinates: [40.7697, 29.4870],
    description:
      "Eskihisar sahilinin en bilinen balık restoranı. Günlük taze balık, mezeler ve seçkin rakılar. Rezervasyon önerilir.",
  },
  {
    slug: "bella-italia",
    name: "Bella Italia",
    cuisine: "İtalyan",
    priceLevel: 3,
    rating: 4.5,
    reviewCount: 678,
    address: "İstasyon Mah., Gebze",
    phone: "0 262 642 55 55",
    hours: "11:30 - 23:00",
    features: ["Şarap", "Rezervasyon", "WiFi"],
    coverGradient: "from-rose-500/60 to-amber-600/60",
    coordinates: [40.8065, 29.4320],
    description:
      "El yapımı makarna, taş fırın pizza ve İtalyan şarabı. Romantik akşam yemeği için ideal.",
  },
  {
    slug: "cigerci-nihat",
    name: "Ciğerci Nihat Usta",
    cuisine: "Türk Mutfağı · Ciğer",
    priceLevel: 2,
    rating: 4.8,
    reviewCount: 2012,
    address: "Hacı Halil Mah., Gebze",
    phone: "0 262 641 22 33",
    hours: "11:00 - 22:00",
    features: ["Hızlı Servis", "Kahvaltılık"],
    coverGradient: "from-amber-500/60 to-orange-700/60",
    coordinates: [40.8022, 29.4298],
    description:
      "Gebze'nin ciğerci efsanesi. Taze kuzu ciğer, cevizli salata ve bol maydanoz. Öğle saatlerinde yoğun, bekleme olabilir.",
  },
  {
    slug: "sushi-gebze",
    name: "Sushi Gebze",
    cuisine: "Japon · Sushi",
    priceLevel: 4,
    rating: 4.6,
    reviewCount: 329,
    address: "Gebze Center AVM",
    phone: "0 262 642 99 99",
    hours: "12:00 - 23:00",
    features: ["AVM İçi", "Rezervasyon", "Private Oda"],
    coverGradient: "from-pink-500/60 to-fuchsia-700/60",
    coordinates: [40.8178, 29.4231],
    description:
      "Gebze'nin tek omakase sushi restoranı. Japon şef, günlük taze balık, sake ve premium deneyim.",
  },
  {
    slug: "kafe-tarih",
    name: "Kafe Tarih",
    cuisine: "Kafe · Kahvaltı",
    priceLevel: 2,
    rating: 4.5,
    reviewCount: 891,
    address: "Çoban Mustafa Paşa Külliyesi yanı, Gebze",
    phone: "0 262 644 00 11",
    hours: "08:00 - 22:00",
    features: ["Tarihi Bina", "Açık Hava", "Kahvaltı"],
    coverGradient: "from-emerald-500/60 to-teal-700/60",
    coordinates: [40.8030, 29.4305],
    description:
      "Tarihi Çoban Mustafa Paşa Külliyesi'nin yanındaki atmosferik kafe. Kahvaltı, taze cezve Türk kahvesi ve ev yapımı tatlılar.",
  },
  {
    slug: "deniz-balik-evi",
    name: "Deniz Balık Evi",
    cuisine: "Balık · Deniz Ürünleri",
    priceLevel: 3,
    rating: 4.7,
    reviewCount: 456,
    address: "Eskihisar Sahil, Gebze",
    phone: "0 262 645 33 44",
    hours: "12:00 - 23:00",
    features: ["Deniz Manzarası", "Rezervasyon", "Açık Hava"],
    coverGradient: "from-blue-500/60 to-cyan-700/60",
    coordinates: [40.7850, 29.4650],
    description: "Eskihisar sahilinde taze deniz ürünleri. Günlük gelen balık, meyhane atmosferi ve Marmara manzarası.",
  },
  {
    slug: "pizza-nonna",
    name: "Pizza Nonna",
    cuisine: "İtalyan · Pizza",
    priceLevel: 2,
    rating: 4.4,
    reviewCount: 312,
    address: "Gebze Çarşı, Gebze",
    phone: "0 262 646 55 66",
    hours: "11:00 - 23:00",
    features: ["Paket Servis", "Rezervasyon", "Çocuk Menü"],
    coverGradient: "from-red-500/60 to-orange-600/60",
    coordinates: [40.8020, 29.4310],
    description: "Odun ateşinde pişirilen otantik İtalyan pizzaları. 15 farklı çeşit, ev yapımı hamur, günlük taze malzeme.",
  },
  {
    slug: "atalay-kebap",
    name: "Atalay Kebap",
    cuisine: "Türk · Kebap",
    priceLevel: 2,
    rating: 4.6,
    reviewCount: 789,
    address: "İstasyon Cad. No:12, Gebze",
    phone: "0 262 647 88 99",
    hours: "11:00 - 22:00",
    features: ["Aile Dostu", "Paket Servis", "OGS Ödeme"],
    coverGradient: "from-amber-500/60 to-red-600/60",
    coordinates: [40.8010, 29.4320],
    description: "40 yıllık geleneksel kebap ustası. Adana, Urfa, şiş kebap çeşitleri. Yanında tam ekmek, meyan şerbet.",
  },
  {
    slug: "veggie-bowl",
    name: "Veggie Bowl",
    cuisine: "Vejetaryen · Sağlıklı",
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 198,
    address: "Gebze Center Zemin Kat",
    phone: "0 262 648 11 22",
    hours: "10:00 - 21:00",
    features: ["Vegan Seçenek", "Glutensiz", "Organik"],
    coverGradient: "from-green-500/60 to-emerald-700/60",
    coordinates: [40.8178, 29.4231],
    description: "Gebze'nin ilk vegan dostu restoranı. Bowl menüler, smoothie'ler ve taze sıkılmış meyve suları.",
  },
];
