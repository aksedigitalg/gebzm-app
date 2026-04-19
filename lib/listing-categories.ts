export interface ListingCategory {
  id: string;
  label: string;
  icon: string;
  subcategories: { id: string; label: string }[];
  attributes: { key: string; label: string; type: "text" | "number" | "select"; options?: string[] }[];
}

export const listingCategories: ListingCategory[] = [
  {
    id: "emlak", label: "Emlak", icon: "🏠",
    subcategories: [
      { id: "konut-satilik", label: "Konut Satılık" },
      { id: "konut-kiralik", label: "Konut Kiralık" },
      { id: "villa-satilik", label: "Villa Satılık" },
      { id: "isyeri-satilik", label: "İşyeri Satılık" },
      { id: "isyeri-kiralik", label: "İşyeri Kiralık" },
      { id: "arsa", label: "Arsa / Tarla" },
      { id: "devren", label: "Devren İşletme" },
    ],
    attributes: [
      { key: "m2", label: "Metrekare (m²)", type: "number" },
      { key: "oda", label: "Oda Sayısı", type: "select", options: ["Stüdyo", "1+1", "2+1", "3+1", "4+1", "5+"] },
      { key: "bina_yasi", label: "Bina Yaşı", type: "number" },
      { key: "kat", label: "Bulunduğu Kat", type: "text" },
      { key: "isitma", label: "Isıtma", type: "select", options: ["Kombi", "Doğalgaz", "Soba", "Klima", "Yerden"] },
      { key: "asansor", label: "Asansör", type: "select", options: ["Var", "Yok"] },
      { key: "esya", label: "Eşya Durumu", type: "select", options: ["Boş", "Eşyalı", "Yarı Eşyalı"] },
      { key: "tapu", label: "Tapu Durumu", type: "select", options: ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Tapulu"] },
    ],
  },
  {
    id: "vasita", label: "Vasıta", icon: "🚗",
    subcategories: [
      { id: "otomobil", label: "Otomobil" },
      { id: "motosiklet", label: "Motosiklet" },
      { id: "ticari", label: "Ticari Araç" },
      { id: "kamyon", label: "Kamyon / Tır" },
      { id: "tarim", label: "Tarım Aracı" },
      { id: "diger", label: "Diğer" },
    ],
    attributes: [
      { key: "yil", label: "Yıl", type: "number" },
      { key: "km", label: "Kilometre", type: "number" },
      { key: "yakit", label: "Yakıt", type: "select", options: ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik"] },
      { key: "vites", label: "Vites", type: "select", options: ["Manuel", "Otomatik", "Yarı Otomatik"] },
      { key: "renk", label: "Renk", type: "text" },
      { key: "hasar", label: "Hasar Kaydı", type: "select", options: ["Yok", "Var"] },
      { key: "tramer", label: "Tramer Kaydı", type: "select", options: ["Yok", "Var"] },
    ],
  },
  {
    id: "yedek-parca", label: "Yedek Parça & Aksesuar", icon: "🔧",
    subcategories: [
      { id: "otomobil-parca", label: "Otomobil Parçaları" },
      { id: "motor-sanziman", label: "Motor / Şanzıman" },
      { id: "lastik-jant", label: "Lastik & Jant" },
      { id: "aksesuar", label: "Aksesuar & Tuning" },
      { id: "motosiklet-parca", label: "Motosiklet Parçaları" },
    ],
    attributes: [
      { key: "marka", label: "Araç Markası", type: "text" },
      { key: "model", label: "Araç Modeli", type: "text" },
      { key: "durum", label: "Parça Durumu", type: "select", options: ["Sıfır", "İkinci El", "Yenilenmiş"] },
      { key: "orijinal", label: "Orijinal/Muadil", type: "select", options: ["Orijinal", "Muadil"] },
    ],
  },
  {
    id: "is-makineleri", label: "İş Makineleri", icon: "🏗️",
    subcategories: [
      { id: "insaat", label: "İnşaat Makinesi" },
      { id: "forklift", label: "Forklift / Transpalet" },
      { id: "kompressor", label: "Kompresör / Jeneratör" },
      { id: "tarim-ekipman", label: "Tarım Ekipmanı" },
    ],
    attributes: [
      { key: "yil", label: "Yıl", type: "number" },
      { key: "kapasite", label: "Kapasite", type: "text" },
      { key: "saat", label: "Çalışma Saati", type: "number" },
      { key: "fatura", label: "Fatura", type: "select", options: ["Var", "Yok"] },
    ],
  },
  {
    id: "elektronik", label: "Elektronik", icon: "📱",
    subcategories: [
      { id: "telefon-tablet", label: "Telefon & Tablet" },
      { id: "bilgisayar", label: "Bilgisayar & Laptop" },
      { id: "tv-ses", label: "TV & Ses Sistemi" },
      { id: "beyaz-esya", label: "Beyaz Eşya" },
      { id: "kamera", label: "Kamera & Foto" },
    ],
    attributes: [
      { key: "marka", label: "Marka", type: "text" },
      { key: "model", label: "Model", type: "text" },
      { key: "durum", label: "Durum", type: "select", options: ["Sıfır", "Az Kullanılmış", "İkinci El"] },
      { key: "garanti", label: "Garanti", type: "select", options: ["Var", "Yok"] },
    ],
  },
  {
    id: "ev-yasam", label: "Ev & Yaşam", icon: "🛋️",
    subcategories: [
      { id: "mobilya", label: "Mobilya" },
      { id: "mutfak", label: "Mutfak Eşyaları" },
      { id: "dekorasyon", label: "Dekorasyon" },
      { id: "bahce", label: "Bahçe & Balkon" },
    ],
    attributes: [
      { key: "durum", label: "Durum", type: "select", options: ["Sıfır", "Az Kullanılmış", "İkinci El"] },
      { key: "malzeme", label: "Malzeme", type: "text" },
      { key: "renk", label: "Renk/Desen", type: "text" },
    ],
  },
  {
    id: "giyim", label: "Giyim & Aksesuar", icon: "👗",
    subcategories: [
      { id: "kadin", label: "Kadın Giyim" },
      { id: "erkek", label: "Erkek Giyim" },
      { id: "cocuk", label: "Çocuk Giyim" },
      { id: "ayakkabi", label: "Ayakkabı" },
      { id: "canta", label: "Çanta & Aksesuar" },
    ],
    attributes: [
      { key: "beden", label: "Beden", type: "text" },
      { key: "marka", label: "Marka", type: "text" },
      { key: "durum", label: "Durum", type: "select", options: ["Sıfır (Etiketli)", "Az Kullanılmış", "İkinci El"] },
    ],
  },
  {
    id: "is-dunyasi", label: "İş Dünyası", icon: "💼",
    subcategories: [
      { id: "devren-isletme", label: "Devren İşletme" },
      { id: "franchise", label: "Franchise Fırsatı" },
      { id: "hammadde", label: "Hammadde & Toptan" },
      { id: "ekipman", label: "İş Ekipmanı" },
    ],
    attributes: [
      { key: "sektor", label: "Sektör", type: "text" },
      { key: "kapasite", label: "Kapasite/Ciro", type: "text" },
      { key: "calisan", label: "Çalışan Sayısı", type: "number" },
    ],
  },
];

export function getCategoryById(id: string) {
  return listingCategories.find(c => c.id === id);
}
