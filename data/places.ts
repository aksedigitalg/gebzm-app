export type PlaceCategory =
  | "tarihi"
  | "doga"
  | "park"
  | "muze"
  | "cami"
  | "avm";

export interface Place {
  slug: string;
  name: string;
  category: PlaceCategory;
  shortDescription: string;
  description: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  image?: string;
  tips?: string[];
  openHours?: string;
}

export const categoryLabels: Record<PlaceCategory, string> = {
  tarihi: "Tarihi",
  doga: "Doğa",
  park: "Park",
  muze: "Müze",
  cami: "Cami",
  avm: "AVM",
};

export const places: Place[] = [
  {
    slug: "coban-mustafa-pasa-kulliyesi",
    name: "Çoban Mustafa Paşa Külliyesi",
    category: "tarihi",
    shortDescription:
      "Mimar Sinan dönemi eseri, 16. yüzyıldan kalma görkemli Osmanlı külliyesi.",
    description:
      "1523-1529 yılları arasında Kanuni Sultan Süleyman'ın Mısır Beylerbeyi Çoban Mustafa Paşa tarafından yaptırılmıştır. Cami, medrese, imaret, kervansaray ve türbeden oluşan klasik dönem öncesi en önemli Osmanlı külliyelerinden biridir.",
    address: "Hacı Halil, 41400 Gebze/Kocaeli",
    coordinates: [40.8028, 29.4303],
    openHours: "Her gün 06:00 - 22:00",
    tips: [
      "Cuma namazı saatlerinde yoğunluk yaşanır.",
      "Avludaki tarihi çınar ağaçlarını görmeyi unutmayın.",
    ],
  },
  {
    slug: "hannibal-mezari",
    name: "Hannibal'in Mezarı",
    category: "tarihi",
    shortDescription:
      "Kartacalı ünlü komutan Hannibal Barca'nın anıt mezarı.",
    description:
      "Roma'ya karşı verdiği mücadelelerle tanınan Kartacalı komutan Hannibal Barca M.Ö. 183'te Gebze'de (antik Libyssa) hayatını kaybetmiştir. 1934'te Atatürk'ün emriyle anıt mezar projesi başlatılmış, 1981'de bugünkü hâlini almıştır.",
    address: "TÜBİTAK Yerleşkesi yakını, Gebze/Kocaeli",
    coordinates: [40.7866, 29.4497],
    openHours: "Her gün açık",
    tips: ["Tarih meraklıları için kaçırılmaması gereken bir nokta."],
  },
  {
    slug: "eskihisar-kalesi",
    name: "Eskihisar Kalesi",
    category: "tarihi",
    shortDescription:
      "Bizans döneminden kalma, denize nazır antik sur ve kale.",
    description:
      "Marmara Denizi kıyısında yer alan Eskihisar Kalesi, Bizans İmparatoru I. Manuel Komnenos tarafından 12. yüzyılda inşa ettirilmiştir. Osman Hamdi Bey'in evi ve müzesi de aynı bölgededir.",
    address: "Eskihisar Mah., Gebze/Kocaeli",
    coordinates: [40.7694, 29.4869],
    openHours: "Her gün 09:00 - 18:00",
    tips: [
      "Eskihisar-Topçular feribotu ile Yalova'ya geçiş yapabilirsiniz.",
      "Osman Hamdi Bey Müzesi hemen yan tarafta.",
    ],
  },
  {
    slug: "osman-hamdi-bey-muzesi",
    name: "Osman Hamdi Bey Müzesi",
    category: "muze",
    shortDescription:
      "Ünlü ressam Osman Hamdi Bey'in evi, şimdi müze olarak ziyarete açık.",
    description:
      "Türk resminin öncü isimlerinden Osman Hamdi Bey'in Eskihisar'daki yazlık evi müzeye dönüştürülmüştür. Kişisel eşyaları, eserleri ve dönemin atmosferini yansıtan odalarıyla zengin bir koleksiyon sunar.",
    address: "Eskihisar Mah., Gebze/Kocaeli",
    coordinates: [40.7697, 29.4863],
    openHours: "Salı-Pazar 09:00 - 17:00 (Pazartesi kapalı)",
  },
  {
    slug: "ballikayalar-tabiat-parki",
    name: "Ballıkayalar Tabiat Parkı",
    category: "doga",
    shortDescription:
      "Kanyonları, şelaleleri ve tırmanış rotalarıyla doğaseverlerin favorisi.",
    description:
      "Gebze'nin güneyinde yer alan, kayalık kanyonları ve zengin bitki örtüsüyle ünlü bir tabiat parkıdır. Yürüyüş ve kaya tırmanışı için ideal rotalar sunar.",
    address: "Tavşanlı Mah., Gebze/Kocaeli",
    coordinates: [40.7397, 29.5453],
    openHours: "Her gün 08:00 - 20:00",
    tips: [
      "Rahat yürüyüş ayakkabısı şart.",
      "Hafta sonları piknik için çok tercih edilir, erken gidin.",
    ],
  },
  {
    slug: "gebze-center-avm",
    name: "Gebze Center AVM",
    category: "avm",
    shortDescription:
      "Bölgenin en büyük alışveriş merkezlerinden biri, yüzlerce mağaza ve sinema.",
    description:
      "Gebze'nin en popüler alışveriş merkezlerinden Gebze Center; mağazalar, yeme-içme alanları, sinema ve eğlence noktalarıyla her ihtiyaca cevap verir.",
    address: "Güzeller OSB, 41400 Gebze/Kocaeli",
    coordinates: [40.8178, 29.4231],
    openHours: "Her gün 10:00 - 22:00",
  },
  {
    slug: "center-park",
    name: "Gebze Kent Ormanı",
    category: "park",
    shortDescription:
      "Yürüyüş parkurları, bisiklet yolu ve piknik alanlarıyla şehrin nefes alan köşesi.",
    description:
      "Gebze Kent Ormanı, aileler ve sporseverler için geniş yeşil alanlar, koşu parkurları, çocuk oyun alanları ve piknik bölgeleri sunan büyük bir kent parkıdır.",
    address: "Mollafenari Mah., Gebze/Kocaeli",
    coordinates: [40.8291, 29.4412],
    openHours: "Her gün 07:00 - 22:00",
  },
  {
    slug: "fatih-camii",
    name: "Fatih Camii",
    category: "cami",
    shortDescription:
      "Gebze'nin simgelerinden, şehir merkezinde modern hatlı büyük cami.",
    description:
      "Gebze merkezde konumlanan Fatih Camii, bölge halkının en sık ziyaret ettiği ibadet merkezlerinden biridir. Geniş avlusu ve modern mimarisiyle dikkat çeker.",
    address: "Hacı Halil Mah., Gebze/Kocaeli",
    coordinates: [40.8015, 29.4312],
    openHours: "Her gün namaz vakitlerinde açık",
  },
];
