"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Store, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1")
  .replace("https://", "wss://")
  .replace("http://", "ws://")
  .replace("/api/v1", "");

interface Msg {
  id: string;
  text: string;
  senderRole: "user" | "business";
  createdAt: string;
  temp?: boolean;
}

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return new Date(dt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const userRef = useRef(getUser());
  const sentIdsRef = useRef<Set<string>>(new Set()); // duplicate önleme

  const deleteMsg = async (msgId: string) => {
    if (msgId.startsWith("temp-")) return;
    const user = userRef.current;
    if (!user?.token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${msgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages((prev) => prev.map((m) =>
        m.id === msgId ? { ...m, text: "[Mesaj silindi]" } : m
      ));
    } catch { /* ignore */ }
  };

  const scrollBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  };

  // Mesajları yükle
  const loadMessages = useCallback(async () => {
    const user = userRef.current;
    if (!user?.token) { router.replace("/giris"); return; }
    try {
      const data = await api.user.getMessages(params.id) as Record<string, unknown>[];
      setMessages(data.map((m) => ({
        id: m.id as string,
        text: m.text as string,
        senderRole: m.sender_role as "user" | "business",
        createdAt: m.created_at as string,
      })));
      scrollBottom();
    } catch { router.replace("/profil/mesajlar"); }
  }, [params.id, router]);

  // WebSocket
  useEffect(() => {
    const user = userRef.current;
    if (!user?.token) { router.replace("/giris"); return; }

    loadMessages();

    const ws = new WebSocket(`${WS_BASE}/ws/conversations/${params.id}?token=${user.token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.id) return;
        // Kendi gönderdiğimiz mesajı tekrar ekleme (tempId ile zaten eklendi)
        if (sentIdsRef.current.has(data.id)) return;
        // Karşı tarafın mesajını ekle
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          const newMsg: Msg = {
            id: data.id,
            text: data.text,
            senderRole: data.sender_id === user.id ? "user" : "business",
            createdAt: new Date().toISOString(),
          };
          scrollBottom();
          return [...prev, newMsg];
        });
      } catch { /* ignore */ }
    };

    // WS başarısız olursa polling yap
    const pollInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) loadMessages();
    }, 4000);

    return () => {
      ws.close();
      clearInterval(pollInterval);
    };
  }, [params.id]);

  useEffect(() => { scrollBottom(); }, [messages.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText("");

    const user = userRef.current;
    const tempId = `temp-${Date.now()}`;

    // UI'ye anlık ekle
    setMessages((prev) => [...prev, {
      id: tempId, text: t, senderRole: "user",
      createdAt: new Date().toISOString(), temp: true,
    }]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // WS ile gönder — broadcast gelince tempId'yi gerçek ID ile değiştir
      const msgPayload = JSON.stringify({ text: t });
      wsRef.current.send(msgPayload);
      // WS broadcast'ini aldığımızda duplicate olmayacak şekilde track et
      // (broadcast kendi mesajımızı da gönderir, biz tempId ile zaten eklediğimiz için filtrele)
      const originalOnMessage = wsRef.current.onmessage;
      const onceHandler = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.text === t && data.id) {
            sentIdsRef.current.add(data.id);
            // tempId'yi gerçek ID ile değiştir
            setMessages((prev) => prev.map((m) =>
              m.id === tempId ? { ...m, id: data.id, temp: false } : m
            ));
          }
        } catch { /* ignore */ }
      };
      // Bir kez çalışacak listener
      const originalHandler = wsRef.current.onmessage;
      wsRef.current.onmessage = (e) => {
        onceHandler(e);
        if (originalHandler) (originalHandler as (e: MessageEvent) => void)(e);
      };
    } else {
      // HTTP fallback
      api.user.sendMessage(params.id, t).then(() => loadMessages()).catch(() => {});
    }
  };

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px)-10px)] flex-col lg:h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
        <button onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">Konuşma</p>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {wsStatus === "connected"
              ? <><Wifi className="h-3 w-3 text-emerald-500" />Canlı</>
              : <><WifiOff className="h-3 w-3 text-amber-500" />Bağlanıyor...</>
            }
          </p>
        </div>
      </div>

      {/* Mesajlar */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        <div className="space-y-3">
          {messages.map((m) => (
            m.senderRole === "user" ? (
              <div key={m.id} className="group flex justify-end">
                <div className="flex flex-col items-end gap-0.5">
                  <div className={`max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground ${m.temp ? "opacity-70" : ""}`}>
                    {m.text}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteMsg(m.id)}
                      className="hidden text-[10px] text-red-400 hover:text-red-600 group-hover:block">
                      Sil
                    </button>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Store className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm">
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t border-border bg-card px-5 py-3">
        <input value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz..."
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={!text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
