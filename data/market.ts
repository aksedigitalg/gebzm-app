export interface MarketProduct {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  oldPrice?: number;
  unit: string; // "1 kg", "1 L", "500 g"
  discount?: number; // yüzde
  gradient: string;
  tag?: "YENİ" | "FIRSAT" | "STOK";
}

export const marketCategories = [
  { id: "all", label: "Tümü" },
  { id: "meyve-sebze", label: "Meyve & Sebze" },
  { id: "sut-kahvalti", label: "Süt & Kahvaltı" },
  { id: "et-tavuk", label: "Et & Tavuk" },
  { id: "bakliyat", label: "Bakliyat & Erzak" },
  { id: "atistirmalik", label: "Atıştırmalık" },
  { id: "icecek", label: "İçecek" },
  { id: "temizlik", label: "Temizlik" },
  { id: "bebek", label: "Bebek" },
];

export interface MarketCampaign {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
}

export const marketCampaigns: MarketCampaign[] = [
  {
    id: "camp-1",
    title: "%50'ye Varan İndirim",
    subtitle: "Seçili ev & bakım ürünlerinde hafta sonu fırsatları",
    cta: "Fırsatları Gör",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "camp-2",
    title: "100₺ Üzerine Ücretsiz Teslimat",
    subtitle: "Gebze içi, aynı gün kapınızda",
    cta: "Alışverişe Başla",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "camp-3",
    title: "Taze Sebze & Meyve",
    subtitle: "Sabah toplandı, öğlen kapınızda",
    cta: "Taze Ürünler",
    gradient: "from-amber-500 to-orange-600",
  },
];

export const marketProducts: MarketProduct[] = [
  // Meyve & Sebze
  { id: "p-1", name: "Domates", brand: "Yerel", category: "meyve-sebze", price: 32, oldPrice: 45, unit: "1 kg", discount: 28, gradient: "from-red-400 to-rose-600", tag: "FIRSAT" },
  { id: "p-2", name: "Salatalık", brand: "Yerel", category: "meyve-sebze", price: 28, unit: "1 kg", gradient: "from-emerald-400 to-green-600" },
  { id: "p-3", name: "Muz", brand: "İthal", category: "meyve-sebze", price: 79, unit: "1 kg", gradient: "from-yellow-300 to-amber-500" },
  { id: "p-4", name: "Elma (Starking)", category: "meyve-sebze", price: 42, unit: "1 kg", gradient: "from-red-500 to-pink-700" },
  { id: "p-5", name: "Patates", category: "meyve-sebze", price: 18, unit: "1 kg", gradient: "from-amber-600 to-yellow-800" },

  // Süt & Kahvaltı
  { id: "p-10", name: "Süt", brand: "Pınar", category: "sut-kahvalti", price: 45, unit: "1 L", gradient: "from-sky-300 to-blue-500" },
  { id: "p-11", name: "Tam Yağlı Peynir", brand: "Sek", category: "sut-kahvalti", price: 195, oldPrice: 225, unit: "500 g", discount: 13, gradient: "from-yellow-200 to-amber-400", tag: "FIRSAT" },
  { id: "p-12", name: "Zeytin (Salamura)", brand: "Tariş", category: "sut-kahvalti", price: 110, unit: "500 g", gradient: "from-lime-600 to-emerald-800" },
  { id: "p-13", name: "Köy Yumurtası", category: "sut-kahvalti", price: 135, unit: "15'li", gradient: "from-amber-300 to-orange-500", tag: "YENİ" },
  { id: "p-14", name: "Bal", brand: "Balparmak", category: "sut-kahvalti", price: 285, unit: "460 g", gradient: "from-yellow-500 to-amber-700" },

  // Et & Tavuk
  { id: "p-20", name: "Dana Kıyma", brand: "Gıdasa", category: "et-tavuk", price: 620, unit: "1 kg", gradient: "from-red-700 to-rose-900" },
  { id: "p-21", name: "Tavuk Göğsü", brand: "Banvit", category: "et-tavuk", price: 195, oldPrice: 230, unit: "1 kg", discount: 15, gradient: "from-pink-300 to-rose-500", tag: "FIRSAT" },
  { id: "p-22", name: "Sucuk", brand: "Apikoğlu", category: "et-tavuk", price: 325, unit: "300 g", gradient: "from-red-600 to-orange-700" },

  // Bakliyat & Erzak
  { id: "p-30", name: "Pirinç (Baldo)", brand: "Reis", category: "bakliyat", price: 165, unit: "2 kg", gradient: "from-stone-200 to-amber-400" },
  { id: "p-31", name: "Makarna", brand: "Filiz", category: "bakliyat", price: 28, unit: "500 g", gradient: "from-yellow-200 to-amber-500" },
  { id: "p-32", name: "Ayçiçek Yağı", brand: "Ona", category: "bakliyat", price: 185, oldPrice: 220, unit: "5 L", discount: 16, gradient: "from-yellow-400 to-amber-600", tag: "FIRSAT" },
  { id: "p-33", name: "Mercimek", brand: "Duru", category: "bakliyat", price: 85, unit: "1 kg", gradient: "from-orange-400 to-red-600" },
  { id: "p-34", name: "Nohut", brand: "Duru", category: "bakliyat", price: 75, unit: "1 kg", gradient: "from-amber-500 to-yellow-700" },

  // Atıştırmalık
  { id: "p-40", name: "Çikolata", brand: "Nestle", category: "atistirmalik", price: 45, unit: "80 g", gradient: "from-amber-700 to-red-900" },
  { id: "p-41", name: "Cips", brand: "Lay's", category: "atistirmalik", price: 52, unit: "107 g", gradient: "from-yellow-400 to-orange-600" },
  { id: "p-42", name: "Bisküvi", brand: "Eti", category: "atistirmalik", price: 28, unit: "150 g", gradient: "from-amber-500 to-yellow-700" },

  // İçecek
  { id: "p-50", name: "Ayran", brand: "Sütaş", category: "icecek", price: 18, unit: "1 L", gradient: "from-sky-200 to-blue-400" },
  { id: "p-51", name: "Kola", brand: "Coca-Cola", category: "icecek", price: 45, unit: "2.5 L", gradient: "from-red-600 to-red-800" },
  { id: "p-52", name: "Maden Suyu", brand: "Erikli", category: "icecek", price: 12, unit: "500 ml", gradient: "from-sky-300 to-cyan-500" },
  { id: "p-53", name: "Çay", brand: "Çaykur", category: "icecek", price: 180, unit: "500 g", gradient: "from-red-700 to-amber-900" },

  // Temizlik
  { id: "p-60", name: "Çamaşır Deterjanı", brand: "Ariel", category: "temizlik", price: 325, oldPrice: 420, unit: "5.2 kg", discount: 23, gradient: "from-blue-500 to-indigo-700", tag: "FIRSAT" },
  { id: "p-61", name: "Bulaşık Deterjanı", brand: "Fairy", category: "temizlik", price: 145, unit: "1.3 L", gradient: "from-lime-500 to-green-700" },
  { id: "p-62", name: "Çöp Poşeti", brand: "Roll-up", category: "temizlik", price: 65, unit: "20'li", gradient: "from-slate-500 to-gray-700" },

  // Bebek
  { id: "p-70", name: "Bebek Bezi", brand: "Prima", category: "bebek", price: 495, oldPrice: 595, unit: "44'lü", discount: 17, gradient: "from-pink-300 to-rose-500" },
  { id: "p-71", name: "Bebek Maması", brand: "Milupa", category: "bebek", price: 285, unit: "350 g", gradient: "from-purple-400 to-pink-600" },
];
