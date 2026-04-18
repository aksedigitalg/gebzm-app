"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Store } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
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
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const userRef = useRef(getUser());

  // Mesajları yükle
  const loadMessages = useCallback(async () => {
    if (!userRef.current?.token) { router.replace("/profil/mesajlar"); return; }
    try {
      const data = await api.user.getMessages(params.id) as Record<string, unknown>[];
      setMessages(data.map((m) => ({
        id: m.id as string,
        text: m.text as string,
        senderRole: m.sender_role as "user" | "business",
        createdAt: m.created_at as string,
      })));
    } catch { router.replace("/profil/mesajlar"); }
  }, [params.id, router]);

  // WebSocket bağlan
  useEffect(() => {
    const user = userRef.current;
    if (!user?.token) { router.replace("/profil/mesajlar"); return; }

    loadMessages();

    const ws = new WebSocket(`${WS_BASE}/ws/conversations/${params.id}?token=${user.token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Gelen mesajı ekle (kendi gönderdiğimiz zaten eklendi)
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          return [...prev, {
            id: data.id,
            text: data.text,
            senderRole: data.sender_id === user.id ? "user" : "business",
            createdAt: new Date().toISOString(),
          }];
        });
      } catch { /* ignore */ }
    };

    return () => { ws.close(); };
  }, [params.id]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText("");

    const user = userRef.current;
    const tempId = `temp-${Date.now()}`;

    // Anlık UI'ye ekle
    setMessages((prev) => [...prev, {
      id: tempId,
      text: t,
      senderRole: "user",
      createdAt: new Date().toISOString(),
    }]);

    // WebSocket ile gönder (bağlıysa)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: t }));
    } else {
      // Fallback: HTTP
      api.user.sendMessage(params.id, t).catch(() => {});
    }
  };

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px)-10px)] flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
          <Send className="h-3.5 w-3.5 rotate-180" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">Konuşma</p>
          <p className="text-[10px] text-muted-foreground">{connected ? "Bağlı" : "..."}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        <div className="space-y-3">
          {messages.map((m) =>
            m.senderRole === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Store className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm">
                  {m.text}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t border-border bg-card px-5 py-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz..."
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={!text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
