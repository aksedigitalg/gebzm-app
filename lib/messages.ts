"use client";

export type MessageType =
  | "reservation"
  | "appointment"
  | "question"
  | "reply";

export interface ChatMessage {
  id: string;
  from: "user" | "business";
  text: string;
  timestamp: string; // ISO
}

export interface Conversation {
  id: string;
  businessName: string;
  businessType: string; // Restoran, Kuaför, Doktor, vs.
  subject: string; // Rezervasyon, Randevu, Soru
  lastMessage: string;
  updatedAt: string; // ISO
  unread: boolean;
  messages: ChatMessage[];
}

const STORAGE_KEY = "gebzem_conversations";

// Başlangıçta demo konuşmalar
const seedConversations: Conversation[] = [
  {
    id: "c-seed-1",
    businessName: "Gebze Mangal Evi",
    businessType: "Restoran",
    subject: "Rezervasyon",
    lastMessage: "Rezervasyonunuz onaylandı! Sizi bekliyoruz.",
    updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    unread: true,
    messages: [
      {
        id: "m1",
        from: "user",
        text: "Yarın akşam 20:00 için 4 kişilik yer ayırtmak istiyorum.",
        timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(),
      },
      {
        id: "m2",
        from: "business",
        text: "Merhaba! Rezervasyonunuz onaylandı, sizi yarın 20:00'de bekliyoruz. Bahçe masası hazırladık. İyi günler.",
        timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: "c-seed-2",
    businessName: "Berna Kuaför (Evde)",
    businessType: "Kuaför",
    subject: "Randevu",
    lastMessage: "Pazar 14:00 için sizi programa aldım.",
    updatedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    unread: false,
    messages: [
      {
        id: "m1",
        from: "user",
        text: "Pazar günü için saç boyama randevusu almak istiyorum.",
        timestamp: new Date(Date.now() - 25 * 3600_000).toISOString(),
      },
      {
        id: "m2",
        from: "business",
        text: "Pazar 14:00 için sizi programa aldım. Adresiniz Mustafa Paşa Mah. mi?",
        timestamp: new Date(Date.now() - 24 * 3600_000).toISOString(),
      },
    ],
  },
];

function read(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedConversations));
      return seedConversations;
    }
    return JSON.parse(raw);
  } catch {
    return seedConversations;
  }
}

function write(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function getConversations(): Conversation[] {
  return read().sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export function getConversation(id: string): Conversation | undefined {
  return read().find((c) => c.id === id);
}

export function addConversation(params: {
  businessName: string;
  businessType: string;
  subject: string;
  firstMessage: string;
}): Conversation {
  const now = new Date().toISOString();
  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    from: "user",
    text: params.firstMessage,
    timestamp: now,
  };
  const reply: ChatMessage = {
    id: crypto.randomUUID(),
    from: "business",
    text: `Merhaba! Mesajınızı aldık, en kısa sürede dönüş sağlayacağız. (${params.subject})`,
    timestamp: new Date(Date.now() + 1000).toISOString(),
  };
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    businessName: params.businessName,
    businessType: params.businessType,
    subject: params.subject,
    lastMessage: reply.text,
    updatedAt: reply.timestamp,
    unread: true,
    messages: [userMsg, reply],
  };
  const all = read();
  all.unshift(conversation);
  write(all);
  return conversation;
}

export function appendMessage(conversationId: string, text: string) {
  const all = read();
  const conv = all.find((c) => c.id === conversationId);
  if (!conv) return;
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    from: "user",
    text,
    timestamp: new Date().toISOString(),
  };
  conv.messages.push(msg);
  conv.lastMessage = text;
  conv.updatedAt = msg.timestamp;
  conv.unread = false;
  write(all);

  // Sahte yanıt
  setTimeout(() => {
    const cur = read();
    const target = cur.find((c) => c.id === conversationId);
    if (!target) return;
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      from: "business",
      text: "Mesajınız için teşekkürler, size en kısa sürede dönüş sağlayacağız.",
      timestamp: new Date().toISOString(),
    };
    target.messages.push(reply);
    target.lastMessage = reply.text;
    target.updatedAt = reply.timestamp;
    target.unread = true;
    write(cur);
    window.dispatchEvent(new Event("gebzem-messages-update"));
  }, 1500);
}
