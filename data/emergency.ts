export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: "acil" | "saglik" | "belediye" | "guvenlik";
}

export const emergencyContacts: EmergencyContact[] = [
  { id: "e-112", name: "Acil Çağrı (Genel)", phone: "112", category: "acil" },
  { id: "e-155", name: "Polis İmdat", phone: "155", category: "guvenlik" },
  { id: "e-156", name: "Jandarma", phone: "156", category: "guvenlik" },
  { id: "e-itfaiye", name: "İtfaiye", phone: "110", category: "acil" },
  {
    id: "e-belediye",
    name: "Gebze Belediyesi",
    phone: "4440441",
    category: "belediye",
  },
  {
    id: "e-kocaeli",
    name: "Kocaeli Büyükşehir Belediyesi",
    phone: "153",
    category: "belediye",
  },
  {
    id: "e-fatih-devlet",
    name: "Gebze Fatih Devlet Hastanesi",
    phone: "02626666666",
    category: "saglik",
  },
  {
    id: "e-sulh-devlet",
    name: "Sultan Orhan Devlet Hastanesi",
    phone: "02626554545",
    category: "saglik",
  },
  { id: "e-aski", name: "İSU Arıza Hattı", phone: "185", category: "belediye" },
  { id: "e-gaz", name: "Doğalgaz Arıza (İGDAŞ bölgeleri)", phone: "187", category: "belediye" },
  { id: "e-elektrik", name: "Elektrik Arıza (Sedaş)", phone: "186", category: "belediye" },
];

export const emergencyCategoryLabels: Record<EmergencyContact["category"], string> = {
  acil: "Acil",
  saglik: "Sağlık",
  belediye: "Belediye / Altyapı",
  guvenlik: "Güvenlik",
};
