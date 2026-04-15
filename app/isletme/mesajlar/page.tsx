"use client";

import { useState } from "react";
import { Send, User, Store } from "lucide-react";

interface Conversation {
  id: string;
  customer: string;
  preview: string;
  time: string;
  unread: boolean;
  messages: { from: "customer" | "business"; text: string; time: string }[];
}

const conversations: Conversation[] = [
  {
    id: "c-1",
    customer: "Ahmet Yılmaz",
    preview: "Yarın akşam için 4 kişilik yer ayırtmak istiyorum",
    time: "5 dk önce",
    unread: true,
    messages: [
      { from: "customer", text: "Merhaba, yarın akşam 20:00 için 4 kişilik yer ayırtabilir miyim?", time: "15 dk önce" },
      { from: "customer", text: "Bahçeli masa tercih ederim", time: "14 dk önce" },
    ],
  },
  {
    id: "c-2",
    customer: "Elif Kaya",
    preview: "Menüde vegan seçenek var mı?",
    time: "1 saat önce",
    unread: true,
    messages: [
      { from: "customer", text: "Menüde vegan seçenek var mı acaba?", time: "1 saat önce" },
    ],
  },
  {
    id: "c-3",
    customer: "Mert Demir",
    preview: "Çocuklu aileye uygun mu?",
    time: "3 saat önce",
    unread: false,
    messages: [
      { from: "customer", text: "Mekanınız çocuklu aileye uygun mu?", time: "3 saat önce" },
      { from: "business", text: "Merhaba, elbette! Çocuk menümüz ve oyun alanımız mevcuttur.", time: "3 saat önce" },
    ],
  },
  {
    id: "c-4",
    customer: "Zeynep Şahin",
    preview: "Düğün için catering hizmeti veriyor musunuz?",
    time: "Dün",
    unread: false,
    messages: [
      { from: "customer", text: "Düğün için catering hizmeti veriyor musunuz?", time: "Dün" },
      { from: "business", text: "Evet, 100+ kişilik organizasyonlara hizmet veriyoruz. Detaylar için telefonla görüşelim.", time: "Dün" },
    ],
  },
];

export default function Page() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [text, setText] = useState("");
  const active = conversations.find((c) => c.id === activeId)!;
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Müşteri Mesajları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unreadCount} okunmamış mesaj
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <aside className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-start gap-3 p-3 text-left transition ${
                    activeId === c.id ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                    {c.customer.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.customer}</p>
                      {c.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.preview}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{c.time}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <section className="flex h-[calc(100dvh-220px)] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <header className="flex items-center gap-3 border-b border-border px-5 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{active.customer}</p>
              <p className="text-[11px] text-emerald-600">Çevrimiçi</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 no-scrollbar">
            {active.messages.map((m, i) =>
              m.from === "business" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[70%]">
                    <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-sm">
                      {m.text}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{m.time}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) setText("");
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mesaj yaz..."
              className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
