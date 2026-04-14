export interface TransportLine {
  id: string;
  name: string;
  type: "marmaray" | "yht" | "otobus" | "feribot";
  route: string;
  firstDeparture: string;
  lastDeparture: string;
  interval: string;
  notes?: string;
}

export const transportLines: TransportLine[] = [
  {
    id: "marmaray",
    name: "Marmaray",
    type: "marmaray",
    route: "Gebze ⇄ Halkalı",
    firstDeparture: "06:00",
    lastDeparture: "00:00",
    interval: "4-10 dk",
    notes: "Kadıköy, Üsküdar, Sirkeci, Yenikapı duraklarından geçer.",
  },
  {
    id: "yht",
    name: "Yüksek Hızlı Tren (YHT)",
    type: "yht",
    route: "Gebze ⇄ Ankara / Konya / Eskişehir",
    firstDeparture: "06:30",
    lastDeparture: "18:45",
    interval: "Gün içinde 6-8 sefer",
    notes: "Bilet TCDD web sitesinden alınabilir.",
  },
  {
    id: "feribot",
    name: "Eskihisar - Topçular Feribotu",
    type: "feribot",
    route: "Gebze (Eskihisar) ⇄ Yalova (Topçular)",
    firstDeparture: "05:30",
    lastDeparture: "01:30",
    interval: "15-20 dk",
    notes: "Araç ve yolcu geçişi. Yoğun saatlerde kuyruk oluşabilir.",
  },
  {
    id: "b-1",
    name: "500T Gebze - Kadıköy",
    type: "otobus",
    route: "Gebze Otogar ⇄ Kadıköy",
    firstDeparture: "05:30",
    lastDeparture: "23:00",
    interval: "20-30 dk",
  },
  {
    id: "b-2",
    name: "2 Gebze İçi Ring",
    type: "otobus",
    route: "Gebze Merkez ⇄ GTÜ ⇄ TÜBİTAK",
    firstDeparture: "06:15",
    lastDeparture: "22:30",
    interval: "15-25 dk",
  },
  {
    id: "b-3",
    name: "880 Gebze - Darıca",
    type: "otobus",
    route: "Gebze Merkez ⇄ Darıca Sahil",
    firstDeparture: "06:00",
    lastDeparture: "23:30",
    interval: "10-20 dk",
  },
];
