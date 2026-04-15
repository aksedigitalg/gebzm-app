"use client";

import { Search, AlertCircle, MessageSquare } from "lucide-react";

interface SupportMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  priority: "low" | "normal" | "high";
  unread: boolean;
}

const messages: SupportMessage[] = [
  { id: "m-1", from: "Ahmet Yılmaz", subject: "Siparişim ulaşmadı", preview: "Dün akşam yaptığım sipariş hâlâ gelmedi, bilgi verir misiniz?", time: "10 dk önce", priority: "high", unread: true },
  { id: "m-2", from: "Elif Kaya", subject: "Rezervasyon iptali", preview: "Yarın akşamki rezervasyonumu iptal etmem gerekiyor, nasıl yapabilirim?", time: "35 dk önce", priority: "normal", unread: true },
  { id: "m-3", from: "Köşeoğlu Kebap", subject: "Menü güncellemesi hakkında", preview: "Menümüze yeni ürünler eklemek istiyoruz, nasıl bir süreç izlemeliyim?", time: "1 saat önce", priority: "normal", unread: true },
  { id: "m-4", from: "Mert Demir", subject: "Hesap silme talebi", preview: "Hesabımı silmek istiyorum, gerekli prosedür nedir?", time: "2 saat önce", priority: "low", unread: true },
  { id: "m-5", from: "Berna Kuaför", subject: "Müşteri şikayeti", preview: "Bir müşteri hakkında şikayette bulunmak istiyorum", time: "3 saat önce", priority: "high", unread: true },
  { id: "m-6", from: "Zeynep Şahin", subject: "Ödeme sorunu", preview: "Sipariş sırasında ödeme yapılamadı ama para çekildi", time: "5 saat önce", priority: "high", unread: true },
];

const priorityStyles = {
  high: { label: "Yüksek", class: "bg-red-500/10 text-red-600" },
  normal: { label: "Normal", class: "bg-blue-500/10 text-blue-600" },
  low: { label: "Düşük", class: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Destek Mesajları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform genelindeki destek talepleri · {unreadCount} okunmamış
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold">
              {messages.filter((m) => m.priority === "high").length} yüksek öncelikli mesaj var
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Acil yanıt gerekenler listenin üstünde görünür.
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Mesajlarda ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {messages.map((m) => (
            <li key={m.id} className="flex cursor-pointer items-start gap-3 p-4 transition hover:bg-muted/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sm">{m.from}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityStyles[m.priority].class}`}>
                    {priorityStyles[m.priority].label}
                  </span>
                  {m.unread && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-sm font-medium">{m.subject}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {m.preview}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
                {m.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
