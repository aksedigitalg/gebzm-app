export type ClassifiedCategory =
  | "emlak"
  | "vasita"
  | "elektronik"
  | "ev-yasam"
  | "moda"
  | "is-makineleri";

export const classifiedCategories: {
  id: ClassifiedCategory;
  label: string;
}[] = [
  { id: "emlak", label: "Emlak" },
  { id: "vasita", label: "Vasıta" },
  { id: "elektronik", label: "Elektronik" },
  { id: "ev-yasam", label: "Ev & Yaşam" },
  { id: "moda", label: "Moda" },
  { id: "is-makineleri", label: "İş Makineleri" },
];

export interface Classified {
  id: string;
  title: string;
  category: ClassifiedCategory;
  subCategory: string;
  price: number;
  currency: "TL";
  location: string;
  date: string; // ISO
  seller: {
    name: string;
    type: "individual" | "store";
    memberSince: string;
    phone?: string;
  };
  description: string;
  features: Record<string, string>;
  coverGradient: string;
  photoCount: number;
}

export const classifieds: Classified[] = [
  {
    id: "c-1",
    title: "3+1 Satılık Daire · Hacı Halil Merkez",
    category: "emlak",
    subCategory: "Konut Satılık",
    price: 4250000,
    currency: "TL",
    location: "Gebze / Hacı Halil",
    date: "2026-04-10T10:30:00",
    seller: {
      name: "Yaşar Emlak",
      type: "store",
      memberSince: "2015",
      phone: "0 262 641 00 00",
    },
    description:
      "Gebze merkez, Hacı Halil Mahallesi'nde 3+1 kombili daire. 125 m², 3. kat, asansörlü, otoparklı bina. Yakın çevre: Marmaray, okullar, market.",
    features: {
      "Metrekare": "125 m²",
      "Oda Sayısı": "3+1",
      "Bina Yaşı": "8",
      "Bulunduğu Kat": "3",
      "Isıtma": "Doğalgaz Kombi",
      "Asansör": "Var",
    },
    coverGradient: "from-blue-500/40 via-indigo-500/30 to-purple-500/40",
    photoCount: 24,
  },
  {
    id: "c-2",
    title: "2019 Ford Focus 1.5 TDCi Titanium",
    category: "vasita",
    subCategory: "Otomobil",
    price: 785000,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-12T14:20:00",
    seller: {
      name: "Ahmet Y.",
      type: "individual",
      memberSince: "2020",
    },
    description:
      "İlk sahibinden, hasar kayıtsız. 62.000 km, bakımları tam. Fabrika garantisi biten motor, koltuklar temiz.",
    features: {
      "Yıl": "2019",
      "KM": "62.000",
      "Motor": "1.5 TDCi Dizel",
      "Vites": "Otomatik",
      "Renk": "Metalik Gri",
      "Hasar": "Yok",
    },
    coverGradient: "from-slate-500/40 via-zinc-500/30 to-gray-500/40",
    photoCount: 18,
  },
  {
    id: "c-3",
    title: "MacBook Air M2 13\" · 16GB 512GB",
    category: "elektronik",
    subCategory: "Laptop",
    price: 62500,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-13T09:15:00",
    seller: {
      name: "Mert K.",
      type: "individual",
      memberSince: "2022",
    },
    description:
      "Garantisi devam eden MacBook Air M2. Kutusu, şarj aleti ve faturası mevcut. Battery health %98.",
    features: {
      "Model": "Air M2 2023",
      "Ram": "16 GB",
      "Disk": "512 GB SSD",
      "Ekran": "13.6\"",
      "Renk": "Uzay Grisi",
    },
    coverGradient: "from-slate-400/40 via-gray-400/30 to-zinc-500/40",
    photoCount: 8,
  },
  {
    id: "c-4",
    title: "2+1 Kiralık Daire · İstasyon Mah.",
    category: "emlak",
    subCategory: "Konut Kiralık",
    price: 18500,
    currency: "TL",
    location: "Gebze / İstasyon",
    date: "2026-04-09T16:45:00",
    seller: {
      name: "Gebze Emlak Merkezi",
      type: "store",
      memberSince: "2010",
      phone: "0 262 641 11 11",
    },
    description:
      "Marmaray'a 3 dakika yürüme mesafesinde, eşyalı olmayan 2+1. 90 m², geniş balkon, çift banyo.",
    features: {
      "Metrekare": "90 m²",
      "Oda Sayısı": "2+1",
      "Depozito": "37.000 TL",
      "Kira Süresi": "Min. 1 yıl",
    },
    coverGradient: "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
    photoCount: 15,
  },
  {
    id: "c-5",
    title: "iPhone 15 Pro 256GB Natural Titanium",
    category: "elektronik",
    subCategory: "Cep Telefonu",
    price: 78500,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-14T08:10:00",
    seller: {
      name: "Teknoloji Dünyası",
      type: "store",
      memberSince: "2018",
      phone: "0 262 641 22 22",
    },
    description:
      "Sıfır ürün, kutu açılmamış. Apple Türkiye garantili. Kargolu gönderim mevcut.",
    features: {
      "Model": "iPhone 15 Pro",
      "Hafıza": "256 GB",
      "Renk": "Natural Titanium",
      "Garanti": "Apple Türkiye",
    },
    coverGradient: "from-amber-400/40 via-yellow-500/30 to-orange-500/40",
    photoCount: 12,
  },
  {
    id: "c-6",
    title: "Sahibinden Chester Koltuk Takımı",
    category: "ev-yasam",
    subCategory: "Koltuk Takımı",
    price: 34500,
    currency: "TL",
    location: "Gebze / Mustafa Paşa",
    date: "2026-04-11T11:30:00",
    seller: {
      name: "Fatma K.",
      type: "individual",
      memberSince: "2019",
    },
    description:
      "2 yıl kullanılmış, temiz. 3+2+1 hakiki deri Chester koltuk. Taşıma alıcıya ait.",
    features: {
      "Tip": "3+2+1",
      "Malzeme": "Hakiki Deri",
      "Renk": "Antrasit",
      "Kullanım": "2 yıl",
    },
    coverGradient: "from-amber-600/40 via-orange-700/30 to-red-800/40",
    photoCount: 6,
  },
  {
    id: "c-7",
    title: "Erkek Marka Deri Ceket (M Beden)",
    category: "moda",
    subCategory: "Erkek Giyim",
    price: 2250,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-13T19:40:00",
    seller: {
      name: "Can D.",
      type: "individual",
      memberSince: "2021",
    },
    description:
      "Massimo Dutti orijinal deri ceket, M beden. Birkaç kere giyilmiş, tertemiz.",
    features: {
      "Beden": "M",
      "Renk": "Kahve",
      "Marka": "Massimo Dutti",
    },
    coverGradient: "from-amber-700/40 via-orange-800/30 to-stone-700/40",
    photoCount: 4,
  },
  {
    id: "c-8",
    title: "Kompresör 200 Litre (Endüstriyel)",
    category: "is-makineleri",
    subCategory: "Hava Kompresörü",
    price: 58000,
    currency: "TL",
    location: "Gebze / OSB",
    date: "2026-04-08T13:00:00",
    seller: {
      name: "Sanayi Çözümleri",
      type: "store",
      memberSince: "2012",
      phone: "0 262 751 22 33",
    },
    description:
      "3 fazlı, 200 lt tank kapasiteli endüstriyel kompresör. Faturalı satılır.",
    features: {
      "Kapasite": "200 litre",
      "Motor": "3 HP",
      "Faz": "3 Faz",
    },
    coverGradient: "from-zinc-600/40 via-slate-700/30 to-neutral-800/40",
    photoCount: 3,
  },
  {
    id: "c-9",
    title: "2+1 Kiralık Daire · Köseköy Merkez",
    category: "emlak",
    subCategory: "Konut Kiralık",
    price: 18500,
    currency: "TL",
    location: "Gebze / Köseköy",
    date: "2026-04-15T09:00:00",
    seller: { name: "Emlak Gebze", type: "store", memberSince: "2018", phone: "0 262 643 00 00" },
    description: "Köseköy merkez, 2+1, 90 m², 2. kat, kombili, otoparklı. Marmaray'a 5 dakika. Depozito 2 ay.",
    features: { "Metrekare": "90 m²", "Oda Sayısı": "2+1", "Bina Yaşı": "5", "Isıtma": "Kombi", "Eşya": "Boş" },
    coverGradient: "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
    photoCount: 12,
  },
  {
    id: "c-10",
    title: "2022 Toyota Corolla 1.8 Hybrid",
    category: "vasita",
    subCategory: "Otomobil",
    price: 1250000,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-14T11:00:00",
    seller: { name: "Gebze Oto Galeri", type: "store", memberSince: "2010", phone: "0 262 644 55 66" },
    description: "Hasar kayıtsız, orjinal boyalı. 45.000 km. Hibrit sistemi muayeneden geçti. Beyaz renk.",
    features: { "Yıl": "2022", "KM": "45.000", "Motor": "1.8 Hibrit", "Vites": "CVT Otomatik", "Renk": "Beyaz", "Hasar": "Yok" },
    coverGradient: "from-cyan-500/40 via-sky-500/30 to-blue-500/40",
    photoCount: 20,
  },
  {
    id: "c-11",
    title: "Satılık Bahçeli Villa · Darıca",
    category: "emlak",
    subCategory: "Villa Satılık",
    price: 12500000,
    currency: "TL",
    location: "Darıca / Gebze",
    date: "2026-04-13T14:00:00",
    seller: { name: "Lüks Emlak", type: "store", memberSince: "2014", phone: "0 262 655 77 88" },
    description: "4+1, 280 m² villa, 500 m² bahçe. Özel havuz, 3 araçlık kapalı garaj. Deniz manzaralı.",
    features: { "Metrekare": "280 m²", "Oda": "4+1", "Bahçe": "500 m²", "Havuz": "Var", "Garaj": "3 Araçlık" },
    coverGradient: "from-violet-500/40 via-purple-500/30 to-pink-500/40",
    photoCount: 32,
  },
  {
    id: "c-12",
    title: "iPhone 15 Pro 256GB · Doğal Titanyum",
    category: "elektronik",
    subCategory: "Telefon",
    price: 58000,
    currency: "TL",
    location: "Gebze",
    date: "2026-04-16T15:00:00",
    seller: { name: "Zeynep A.", type: "individual", memberSince: "2022" },
    description: "3 ay kullanıldı, kutusu ve tüm aksesuarları tam. Ekran koruyucu ve kılıf hediye.",
    features: { "Hafıza": "256 GB", "Renk": "Doğal Titanyum", "Garanti": "9 Ay Kaldı", "Hasar": "Yok" },
    coverGradient: "from-stone-500/40 via-neutral-500/30 to-zinc-500/40",
    photoCount: 8,
  },
  {
    id: "c-13",
    title: "2020 Volkswagen Passat 1.6 TDI",
    category: "vasita",
    subCategory: "Otomobil",
    price: 950000,
    currency: "TL",
    location: "Gebze / OSB",
    date: "2026-04-15T10:00:00",
    seller: { name: "Kerem T.", type: "individual", memberSince: "2019" },
    description: "İlk sahibinden, tramer yok. 88.000 km, Business paket, panoramik cam tavan.",
    features: { "Yıl": "2020", "KM": "88.000", "Motor": "1.6 TDI Dizel", "Vites": "DSG 7 İleri", "Paket": "Business" },
    coverGradient: "from-blue-600/40 via-indigo-600/30 to-blue-800/40",
    photoCount: 22,
  },
  {
    id: "c-14",
    title: "Satılık Dükkân · Gebze Çarşı",
    category: "emlak",
    subCategory: "İşyeri Satılık",
    price: 3800000,
    currency: "TL",
    location: "Gebze / Çarşı",
    date: "2026-04-12T09:00:00",
    seller: { name: "Ticari Emlak", type: "store", memberSince: "2016", phone: "0 262 640 11 22" },
    description: "Gebze çarşı merkezinde, zemin kat, cadde cepheli 65 m² dükkân. Yüksek müşteri potansiyeli.",
    features: { "Metrekare": "65 m²", "Kat": "Zemin", "Cephe": "Cadde", "Tapu": "Kat Mülkiyeti" },
    coverGradient: "from-amber-500/40 via-yellow-500/30 to-orange-500/40",
    photoCount: 10,
  },
];
