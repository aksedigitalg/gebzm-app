export type GuideCategory = "restoran" | "kafe" | "avm" | "hastane" | "market";

export interface GuideItem {
  id: string;
  name: string;
  category: GuideCategory;
  address: string;
  rating?: number; // 0-5
  phone?: string;
  coordinates?: [number, number];
}

export const guideCategoryLabels: Record<GuideCategory, string> = {
  restoran: "Restoran",
  kafe: "Kafe",
  avm: "AVM",
  hastane: "Hastane",
  market: "Market",
};

export const guideItems: GuideItem[] = [
  {
    id: "g-1",
    name: "Köfteci Ramiz Gebze",
    category: "restoran",
    address: "Hacı Halil Mah., Gebze",
    rating: 4.3,
    coordinates: [40.8021, 29.4311],
  },
  {
    id: "g-2",
    name: "Kahve Dünyası Gebze Center",
    category: "kafe",
    address: "Gebze Center AVM",
    rating: 4.4,
    coordinates: [40.8178, 29.4231],
  },
  {
    id: "g-3",
    name: "Starbucks Gebze",
    category: "kafe",
    address: "İstasyon Mah., Gebze",
    rating: 4.5,
    coordinates: [40.8016, 29.4276],
  },
  {
    id: "g-4",
    name: "Gebze Fatih Devlet Hastanesi",
    category: "hastane",
    address: "Hürriyet Mah., Gebze",
    phone: "0 262 666 66 66",
    coordinates: [40.7992, 29.4385],
  },
  {
    id: "g-5",
    name: "Center Gebze AVM",
    category: "avm",
    address: "Güzeller OSB, Gebze",
    rating: 4.2,
    coordinates: [40.8178, 29.4231],
  },
  {
    id: "g-6",
    name: "Real Gebze",
    category: "market",
    address: "İstasyon Mah., Gebze",
    rating: 4.1,
    coordinates: [40.8099, 29.4299],
  },
  {
    id: "g-7",
    name: "Ciğerci Hüseyin Usta",
    category: "restoran",
    address: "Mustafa Paşa Mah., Gebze",
    rating: 4.6,
    coordinates: [40.8038, 29.4321],
  },
];
