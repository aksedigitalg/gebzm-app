export interface MapPoint {
  slug: string;
  name: string;
  category: string;
  address: string;
  coordinates: [number, number];
  shortDescription: string;
  href?: string;
}

const eczane: MapPoint[] = [
  { slug: "ecz-1", name: "Merkez Eczanesi", category: "Eczane", address: "Hacı Halil Mah.", coordinates: [40.8031, 29.4305], shortDescription: "Gebze merkez, günlük açık" },
  { slug: "ecz-2", name: "Sağlık Eczanesi", category: "Eczane", address: "Sultan Orhan Mah.", coordinates: [40.7997, 29.4248], shortDescription: "Sabah 08:30 - akşam 19:30" },
  { slug: "ecz-3", name: "Yeni Hayat Eczanesi", category: "Eczane", address: "İstasyon Mah.", coordinates: [40.8072, 29.4337], shortDescription: "Marmaray istasyonu yakını" },
  { slug: "ecz-4", name: "Gebze Eczanesi", category: "Eczane", address: "Mimar Sinan Mah.", coordinates: [40.8108, 29.4189], shortDescription: "Nöbetçi günü: Pazar" },
  { slug: "ecz-5", name: "Şifa Eczanesi", category: "Eczane", address: "Hürriyet Mah.", coordinates: [40.7968, 29.4356], shortDescription: "Hastane yakını" },
  { slug: "ecz-6", name: "Deva Eczanesi", category: "Eczane", address: "Osmanağa Mah.", coordinates: [40.8055, 29.4402], shortDescription: "7/24 nöbetçi rotasyon" },
];

const atm: MapPoint[] = [
  { slug: "atm-1", name: "Ziraat Bankası ATM", category: "ATM", address: "Gebze Center AVM", coordinates: [40.8178, 29.4231], shortDescription: "24 saat açık" },
  { slug: "atm-2", name: "Garanti BBVA ATM", category: "ATM", address: "İstasyon Mah.", coordinates: [40.8065, 29.4319], shortDescription: "Marmaray çıkışı" },
  { slug: "atm-3", name: "Akbank ATM", category: "ATM", address: "Hacı Halil Mah.", coordinates: [40.8020, 29.4298], shortDescription: "Merkez" },
  { slug: "atm-4", name: "Yapı Kredi ATM", category: "ATM", address: "Mustafa Paşa Mah.", coordinates: [40.8040, 29.4330], shortDescription: "Çarşı içi" },
  { slug: "atm-5", name: "İş Bankası ATM", category: "ATM", address: "Cumhuriyet Mah.", coordinates: [40.8095, 29.4228], shortDescription: "Belediye yakını" },
  { slug: "atm-6", name: "QNB Finansbank ATM", category: "ATM", address: "Sultan Orhan Mah.", coordinates: [40.7992, 29.4260], shortDescription: "Cadde üzeri" },
];

const benzinlik: MapPoint[] = [
  { slug: "ben-1", name: "Shell Gebze", category: "Benzinlik", address: "D-100 Karayolu", coordinates: [40.8145, 29.4385], shortDescription: "Market + araç yıkama" },
  { slug: "ben-2", name: "BP Plaza", category: "Benzinlik", address: "Güzeller OSB", coordinates: [40.8220, 29.4260], shortDescription: "Wild Bean kafe" },
  { slug: "ben-3", name: "Opet", category: "Benzinlik", address: "Sultan Orhan Mah.", coordinates: [40.7960, 29.4290], shortDescription: "Lastik değişim hizmeti" },
  { slug: "ben-4", name: "Total Erg", category: "Benzinlik", address: "Mimar Sinan Mah.", coordinates: [40.8130, 29.4150], shortDescription: "Lavaj noktası" },
  { slug: "ben-5", name: "Petrol Ofisi", category: "Benzinlik", address: "Eskihisar yolu", coordinates: [40.7820, 29.4540], shortDescription: "Feribot yolu üzeri" },
];

const hastane: MapPoint[] = [
  { slug: "hst-1", name: "Gebze Fatih Devlet Hastanesi", category: "Hastane", address: "Hürriyet Mah.", coordinates: [40.7992, 29.4385], shortDescription: "Acil servis 7/24" },
  { slug: "hst-2", name: "Sultan Orhan Devlet Hastanesi", category: "Hastane", address: "Sultan Orhan Mah.", coordinates: [40.7985, 29.4275], shortDescription: "Poliklinikler" },
  { slug: "hst-3", name: "Medar Sağlık Grubu", category: "Hastane", address: "İstasyon Mah.", coordinates: [40.8085, 29.4345], shortDescription: "Özel hastane" },
  { slug: "hst-4", name: "Özel Gebze Yaşam Hastanesi", category: "Hastane", address: "Mustafa Paşa Mah.", coordinates: [40.8048, 29.4332], shortDescription: "Tam teşekküllü" },
  { slug: "hst-5", name: "Gebze ADSM", category: "Hastane", address: "Cumhuriyet Mah.", coordinates: [40.8091, 29.4225], shortDescription: "Ağız ve Diş Sağlığı" },
];

const market: MapPoint[] = [
  { slug: "mkt-1", name: "BİM Hacı Halil", category: "Market", address: "Hacı Halil Mah.", coordinates: [40.8025, 29.4295], shortDescription: "Açık 09:00-21:00" },
  { slug: "mkt-2", name: "A101 İstasyon", category: "Market", address: "İstasyon Mah.", coordinates: [40.8072, 29.4325], shortDescription: "Günlük ihtiyaç" },
  { slug: "mkt-3", name: "ŞOK Sultan Orhan", category: "Market", address: "Sultan Orhan Mah.", coordinates: [40.7998, 29.4255], shortDescription: "Ekonomik market" },
  { slug: "mkt-4", name: "Migros Gebze", category: "Market", address: "Güzeller OSB", coordinates: [40.8190, 29.4240], shortDescription: "Geniş ürün yelpazesi" },
  { slug: "mkt-5", name: "CarrefourSA Gebze", category: "Market", address: "Cumhuriyet Mah.", coordinates: [40.8088, 29.4212], shortDescription: "Hipermarket" },
  { slug: "mkt-6", name: "Real Gebze", category: "Market", address: "İstasyon Mah.", coordinates: [40.8099, 29.4299], shortDescription: "AVM içi" },
];

const banka: MapPoint[] = [
  { slug: "bnk-1", name: "Ziraat Bankası Gebze Şubesi", category: "Banka", address: "Hacı Halil Mah.", coordinates: [40.8027, 29.4302], shortDescription: "Ana şube" },
  { slug: "bnk-2", name: "Garanti BBVA Gebze", category: "Banka", address: "İstasyon Mah.", coordinates: [40.8068, 29.4320], shortDescription: "Hafta içi 09:00-17:00" },
  { slug: "bnk-3", name: "İş Bankası Gebze Şubesi", category: "Banka", address: "Cumhuriyet Mah.", coordinates: [40.8090, 29.4220], shortDescription: "Yakın ATM: 2 adet" },
  { slug: "bnk-4", name: "Akbank Gebze", category: "Banka", address: "Mustafa Paşa Mah.", coordinates: [40.8043, 29.4325], shortDescription: "Park yeri var" },
  { slug: "bnk-5", name: "Yapı Kredi Gebze", category: "Banka", address: "Sultan Orhan Mah.", coordinates: [40.7995, 29.4265], shortDescription: "" },
];

const postane: MapPoint[] = [
  { slug: "pst-1", name: "PTT Gebze Merkez", category: "Postane", address: "Hacı Halil Mah.", coordinates: [40.8022, 29.4290], shortDescription: "Kargo + posta" },
  { slug: "pst-2", name: "PTT Sultan Orhan", category: "Postane", address: "Sultan Orhan Mah.", coordinates: [40.7990, 29.4270], shortDescription: "Küçük şube" },
  { slug: "pst-3", name: "PTT Güzeller OSB", category: "Postane", address: "Güzeller OSB", coordinates: [40.8200, 29.4250], shortDescription: "OSB çalışanlarına uygun saat" },
];

const kargo: MapPoint[] = [
  { slug: "krg-1", name: "Yurtiçi Kargo Gebze", category: "Kargo", address: "İstasyon Mah.", coordinates: [40.8078, 29.4340], shortDescription: "" },
  { slug: "krg-2", name: "Aras Kargo Gebze", category: "Kargo", address: "Hacı Halil Mah.", coordinates: [40.8035, 29.4312], shortDescription: "" },
  { slug: "krg-3", name: "MNG Kargo", category: "Kargo", address: "Mustafa Paşa Mah.", coordinates: [40.8045, 29.4335], shortDescription: "" },
  { slug: "krg-4", name: "Sürat Kargo", category: "Kargo", address: "Sultan Orhan Mah.", coordinates: [40.7992, 29.4258], shortDescription: "" },
  { slug: "krg-5", name: "UPS Gebze", category: "Kargo", address: "Güzeller OSB", coordinates: [40.8210, 29.4255], shortDescription: "" },
  { slug: "krg-6", name: "PTT Kargo", category: "Kargo", address: "Hacı Halil Mah.", coordinates: [40.8022, 29.4290], shortDescription: "" },
];

const SERVICES: Record<string, MapPoint[]> = {
  eczane,
  atm,
  benzinlik,
  hastane,
  market,
  banka,
  postane,
  kargo,
};

export const serviceTitles: Record<string, string> = {
  eczane: "Eczaneler",
  atm: "ATM'ler",
  benzinlik: "Benzinlikler",
  hastane: "Hastaneler",
  market: "Marketler",
  banka: "Bankalar",
  postane: "Postaneler",
  kargo: "Kargo Şubeleri",
};

export function getServicePoints(type: string): MapPoint[] | undefined {
  return SERVICES[type];
}

export function getAllServiceTypes(): string[] {
  return Object.keys(SERVICES);
}
