"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { getBusinessSession } from "@/lib/panel-auth";

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1")
  .replace("https://", "wss://")
  .replace("http://", "ws://")
  .replace("/api/v1", "");

interface Msg { id: string; sender_role: string; text: string; created_at: string; temp?: boolean; }
interface Conv { id: string; user_id: string; user_name: string; last_message: string; updated_at: string; }

export default function Page() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const session = typeof window !== "undefined" ? getBusinessSession() : null;

  const scrollBottom = () =>
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);

  useEffect(() => {
    api.business.getConversations().then((data) => {
      const list = data as Conv[];
      setConvs(list);
      if (list.length > 0) setActiveId(list[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId || !session?.token) return;

    api.business.getMessages(activeId).then((data) => {
      setMessages(data as Msg[]);
      scrollBottom();
    }).catch(() => {});

    wsRef.current?.close();
    setWsStatus("connecting");

    const ws = new WebSocket(`${WS_BASE}/ws/conversations/${activeId}?token=${session.token}`);
    wsRef.current = ws;
    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.id || !data.text) return;
        // Backend gönderene broadcast etmez — sadece kullanıcıdan gelen mesajlar gelir
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          scrollBottom();
          return [...prev, { id: data.id, text: data.text, sender_role: "user", created_at: new Date().toISOString() }];
        });
        setConvs((prev) => prev.map((c) => c.id === activeId ? { ...c, last_message: data.text } : c));
      } catch { /* ignore */ }
    };

    const poll = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        api.business.getMessages(activeId).then((d) => setMessages(d as Msg[])).catch(() => {});
      }
    }, 5000);

    return () => { ws.close(); clearInterval(poll); };
  }, [activeId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    const t = text.trim();
    setText("");

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, text: t, sender_role: "business", created_at: new Date().toISOString(), temp: true }]);
    setConvs((prev) => prev.map((c) => c.id === activeId ? { ...c, last_message: t } : c));
    scrollBottom();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: t }));
      setTimeout(() => setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, temp: false } : m)), 500);
    } else {
      try {
        await api.business.replyMessage(activeId, t);
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, temp: false } : m));
      } catch { setText(t); setMessages((prev) => prev.filter((m) => m.id !== tempId)); }
    }
  };

  const active = convs.find((c) => c.id === activeId);

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  if (convs.length === 0) return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">Müşteri Mesajları</h1></header>
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Henüz mesajınız yok.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Müşteri Mesajları</h1>
        <p className="mt-1 text-sm text-muted-foreground">{convs.length} konuşma</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {convs.map((c) => (
              <li key={c.id}>
                <button onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-start gap-3 p-3 text-left transition ${activeId === c.id ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                    {c.user_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.user_name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last_message}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex h-[calc(100dvh-220px)] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          {active && (
            <header className="flex items-center gap-3 border-b border-border px-5 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{active.user_name}</p>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {wsStatus === "connected"
                    ? <><Wifi className="h-3 w-3 text-emerald-500" />Canlı</>
                    : <><WifiOff className="h-3 w-3 text-amber-500" />...</>}
                </p>
              </div>
            </header>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4 no-scrollbar">
            {messages.map((m) =>
              m.sender_role === "business" ? (
                <div key={m.id} className="flex justify-end">
                  <div className={`max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground ${m.temp ? "opacity-60" : ""}`}>
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[70%] rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-sm">
                    {m.text}
                  </div>
                </div>
              )
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz..."
              className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary" />
            <button type="submit" disabled={!text.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
