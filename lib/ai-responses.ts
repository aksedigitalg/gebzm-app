// Prototip için hazır Türkçe Gebze cevapları.
// Backend gelince bu dosya yerini OpenAI/Claude API çağrısına bırakacak.

export interface AIResponse {
  text: string;
  suggestions?: string[];
}

const rules: { keywords: string[]; response: AIResponse }[] = [
  {
    keywords: ["hannibal", "mezar"],
    response: {
      text: "Hannibal'in Mezarı, TÜBİTAK Yerleşkesi yakınında yer alan anıt mezardır. Kartacalı komutan Hannibal Barca M.Ö. 183'te Gebze'de (antik Libyssa) hayatını kaybetmiştir. 1934'te Atatürk'ün emriyle anıt mezar projesi başlatılmış, 1981'de bugünkü hâlini almıştır. Her gün ziyarete açıktır.",
      suggestions: ["Yol tarifi", "Yakın tarihi yerler"],
    },
  },
  {
    keywords: ["çoban", "mustafa", "paşa", "külliye"],
    response: {
      text: "Çoban Mustafa Paşa Külliyesi, 1523-1529 yılları arasında Kanuni Sultan Süleyman'ın Mısır Beylerbeyi Çoban Mustafa Paşa tarafından yaptırılmıştır. Mimar Sinan öncesi dönemin en önemli külliyelerinden biridir. Hacı Halil mahallesindedir, her gün 06:00-22:00 arası açıktır.",
      suggestions: ["Harita üzerinde göster", "Cami saatleri"],
    },
  },
  {
    keywords: ["eskihisar", "kale"],
    response: {
      text: "Eskihisar Kalesi, 12. yüzyılda Bizans İmparatoru I. Manuel Komnenos tarafından inşa ettirilmiş, Marmara Denizi kıyısında yer alan bir savunma yapısıdır. Yakınında Osman Hamdi Bey Müzesi ve Eskihisar-Topçular feribot iskelesi bulunur. Her gün 09:00-18:00 arası ziyaret edilebilir.",
      suggestions: ["Feribot saatleri", "Osman Hamdi Bey Müzesi"],
    },
  },
  {
    keywords: ["ballıkayalar", "doğa", "yürüyüş", "parkur"],
    response: {
      text: "Ballıkayalar Tabiat Parkı, Gebze'nin güneyinde Tavşanlı mahallesinde yer alan, kanyonları ve zengin bitki örtüsüyle ünlü bir tabiat parkıdır. Yürüyüş ve kaya tırmanışı için ideal rotalar sunar. Hafta sonları çok kalabalık olur, erken saatlerde gitmenizi öneririm.",
      suggestions: ["Yol tarifi", "Piknik alanları"],
    },
  },
  {
    keywords: ["marmaray", "istanbul", "ulaşım", "tren"],
    response: {
      text: "Marmaray, Gebze ile Halkalı arasında sefer yapar. İlk sefer 06:00, son sefer 00:00. Seferler 4-10 dakika aralıklarla olur. Kadıköy, Üsküdar, Sirkeci ve Yenikapı duraklarından geçer. Gebze'den İstanbul'a en hızlı ulaşım yöntemidir.",
      suggestions: ["YHT seferleri", "Feribot saatleri"],
    },
  },
  {
    keywords: ["feribot", "yalova"],
    response: {
      text: "Eskihisar-Topçular feribotu 05:30'dan 01:30'a kadar 15-20 dakika aralıklarla çalışır. Araç ve yolcu geçişine uygundur. Yalova'ya ve oradan Bursa yönüne geçmenin en pratik yoludur. Yoğun saatlerde 15-20 dk kuyruk olabilir.",
      suggestions: ["YHT seferleri", "Marmaray"],
    },
  },
  {
    keywords: ["acil", "hastane", "sağlık", "polis"],
    response: {
      text: "Acil durumlar için 112'yi arayabilirsiniz. Polis: 155, İtfaiye: 110, Jandarma: 156. Yakın hastaneler: Gebze Fatih Devlet Hastanesi (0262 666 66 66) ve Sultan Orhan Devlet Hastanesi (0262 655 45 45).",
      suggestions: ["Acil numaralar sayfası", "En yakın hastane"],
    },
  },
  {
    keywords: ["yemek", "restoran", "nerede yesem", "lezzet"],
    response: {
      text: "Gebze'de sevilen yerler: Köfteci Ramiz (Hacı Halil), Ciğerci Hüseyin Usta (Mustafa Paşa Mah.), Gebze Center AVM'deki yeme-içme katı. Kafe için Starbucks Gebze ve Kahve Dünyası tercih edilir. Rehber sayfasından tümüne göz atabilirsiniz.",
      suggestions: ["Rehber sayfası", "Yakın kafeler"],
    },
  },
  {
    keywords: ["etkinlik", "konser", "festival", "ne yapsak"],
    response: {
      text: "Yaklaşan etkinlikler: Gebze Bahar Festivali (3 Mayıs), Osmanlı Klasik Musikisi Konseri (22 Nisan), Yarı Maraton (17 Mayıs), El Sanatları Sergisi (19 Nisan). Etkinlikler sayfasından tüm takvimi görebilirsiniz.",
      suggestions: ["Etkinlikler sayfası", "Bu hafta sonu"],
    },
  },
  {
    keywords: ["gezilecek", "gezmek", "keşfet", "rota"],
    response: {
      text: "Gebze'de mutlaka görülmesi gerekenler: Çoban Mustafa Paşa Külliyesi, Hannibal'in Mezarı, Eskihisar Kalesi, Osman Hamdi Bey Müzesi, Ballıkayalar Tabiat Parkı. Keşfet sayfasından hepsine ulaşabilirsiniz.",
      suggestions: ["Tarihi yerler", "Doğa parkurları"],
    },
  },
  {
    keywords: ["selam", "merhaba", "hey"],
    response: {
      text: "Merhaba! Ben Gebzem AI asistanıyım. Gebze'yi keşfetmene yardımcı olabilirim. Tarihi yerler, etkinlikler, ulaşım, restoran önerileri ve daha fazlası için sorabilirsin.",
      suggestions: [
        "Bugün nerede yemek yesem?",
        "Gebze'de ne yapmalıyım?",
        "Tarihi yerler",
      ],
    },
  },
  {
    keywords: ["kim", "nesin", "sen"],
    response: {
      text: "Ben Gebzem AI'yım — Gebze için hazırlanmış bir şehir asistanı. Uygulama içi veriler ve şehir bilgisiyle sana yardımcı olmaya çalışıyorum. Prototip sürümünde olduğum için cevaplarım şimdilik sınırlı, ama geliştiriliyorum!",
      suggestions: ["Gebze'de ne yapılır?", "Etkinlikler"],
    },
  },
];

const fallback: AIResponse = {
  text: "Bu konu hakkında henüz yeterli bilgim yok. Gebze'deki tarihi yerler, etkinlikler, ulaşım, restoran veya acil durumlarla ilgili sorabilirsin. Yakında çok daha fazlasını bilecek olacağım!",
  suggestions: [
    "Hannibal'in Mezarı nerede?",
    "Gebze'de nerede yemek yerim?",
    "Marmaray saatleri",
  ],
};

export function getAIResponse(question: string): AIResponse {
  const q = question.toLocaleLowerCase("tr");
  for (const rule of rules) {
    if (rule.keywords.some((k) => q.includes(k))) {
      return rule.response;
    }
  }
  return fallback;
}

export const initialSuggestions = [
  "Hannibal'in Mezarı nerede?",
  "Bugün nerede yemek yesem?",
  "Marmaray saatleri",
  "Gebze'de ne yapmalıyım?",
];
