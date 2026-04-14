export type EventCategory = "konser" | "festival" | "sergi" | "spor" | "belediye";

export interface CityEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // ISO
  location: string;
  description: string;
  price?: string;
}

export const eventCategoryLabels: Record<EventCategory, string> = {
  konser: "Konser",
  festival: "Festival",
  sergi: "Sergi",
  spor: "Spor",
  belediye: "Belediye",
};

export const events: CityEvent[] = [
  {
    id: "e1",
    title: "Gebze Bahar Festivali",
    category: "festival",
    date: "2026-05-03T18:00:00",
    location: "Kent Meydanı",
    description:
      "Yerel sanatçılar, atölyeler, yöresel lezzetler ve çocuk etkinlikleriyle dolu üç gün.",
    price: "Ücretsiz",
  },
  {
    id: "e2",
    title: "Osmanlı Klasik Musikisi Konseri",
    category: "konser",
    date: "2026-04-22T20:00:00",
    location: "Çoban Mustafa Paşa Külliyesi Avlusu",
    description:
      "Kültür ve Sanat Merkezi iş birliğiyle gerçekleştirilen açık hava konseri.",
    price: "Ücretsiz",
  },
  {
    id: "e3",
    title: "Gebze Yarı Maratonu",
    category: "spor",
    date: "2026-05-17T08:00:00",
    location: "Gebze Sahil Parkuru",
    description:
      "10K ve 21K kategorilerinde tüm sporseverlerin katılımına açık koşu organizasyonu.",
    price: "Kayıt: 250 TL",
  },
  {
    id: "e4",
    title: "Geleneksel El Sanatları Sergisi",
    category: "sergi",
    date: "2026-04-19T10:00:00",
    location: "Osman Hamdi Bey Müzesi",
    description:
      "Kocaeli'nin yerel ustalarından seramik, hat ve ebru eserleri.",
    price: "Giriş ücretsiz",
  },
  {
    id: "e5",
    title: "Çocuk Şenliği",
    category: "belediye",
    date: "2026-04-23T11:00:00",
    location: "Gebze Kent Ormanı",
    description:
      "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı kutlamaları.",
    price: "Ücretsiz",
  },
  {
    id: "e6",
    title: "Yaz Sinema Geceleri",
    category: "festival",
    date: "2026-06-14T21:00:00",
    location: "Eskihisar Sahil",
    description:
      "Açık havada klasik ve yeni nesil filmlerin gösterimi. Pikniğinizi getirin.",
    price: "Ücretsiz",
  },
];
