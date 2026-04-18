"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Store, MessageSquare, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { timeAgoTR } from "@/lib/format";

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1")
  .replace("https://", "wss://")
  .replace("http://", "ws://")
  .replace("/api/v1", "");

interface Conv { id: string; business_name: string; business_type: string; last_message: string; updated_at: string; }
interface Msg { id: string; text: string; sender_role: string; created_at: string; temp?: boolean; }

export default function MesajlarPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<string, string>>(new Map());
  const userRef = useRef(getUser());

  const scrollBottom = () => setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);

  // Konuşma listesi yükle
  useEffect(() => {
    const user = userRef.current;
    if (!user?.token) { router.replace("/giris"); return; }
    api.user.getConversations().then((data) => {
      const list = data as Conv[];
      setConvs(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Aktif konuşma değişince WS bağlan
  useEffect(() => {
    if (!activeId) return;
    const user = userRef.current;
    if (!user?.token) return;

    // Mesajları yükle
    api.user.getMessages(activeId).then((data) => {
      setMessages(data as Msg[]);
      scrollBottom();
    }).catch(() => {});

    // Eski WS kapat
    wsRef.current?.close();
    setWsStatus("connecting");

    const ws = new WebSocket(`${WS_BASE}/ws/conversations/${activeId}?token=${user.token}`);
    wsRef.current = ws;
    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.id || !data.text) return;
        const isMine = data.sender_id === user.id;
        if (isMine) {
          const tempId = pendingRef.current.get(data.text);
          if (tempId) {
            setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: data.id, temp: false } : m));
            pendingRef.current.delete(data.text);
            setConvs((prev) => prev.map((c) => c.id === activeId ? { ...c, last_message: data.text } : c));
          }
        } else {
          setMessages((prev) => {
            if (prev.find((m) => m.id === data.id)) return prev;
            scrollBottom();
            return [...prev, { id: data.id, text: data.text, sender_role: "business", created_at: new Date().toISOString() }];
          });
          setConvs((prev) => prev.map((c) => c.id === activeId ? { ...c, last_message: data.text } : c));
        }
      } catch { /* ignore */ }
    };

    const poll = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) api.user.getMessages(activeId).then((d) => setMessages(d as Msg[])).catch(() => {}); }, 5000);
    return () => { ws.close(); clearInterval(poll); };
  }, [activeId]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !activeId) return;
    setText("");
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, text: t, sender_role: "user", created_at: new Date().toISOString(), temp: true }]);
    pendingRef.current.set(t, tempId);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: t }));
    } else {
      pendingRef.current.delete(t);
      api.user.sendMessage(activeId, t).then(() =>
        api.user.getMessages(activeId).then((d) => setMessages(d as Msg[]))
      ).catch(() => {});
    }
    scrollBottom();
  };

  const activeConv = convs.find((c) => c.id === activeId);

  if (loading) return (
    <>
      <PageHeader title="Mesajlarım" back="/profil" />
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Yükleniyor...</div>
    </>
  );

  if (convs.length === 0) return (
    <>
      <PageHeader title="Mesajlarım" subtitle="0 konuşma" back="/profil" />
      <div className="flex flex-col items-center py-20 text-center px-5">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold">Henüz mesajın yok</p>
        <p className="mt-1 text-xs text-muted-foreground">Bir işletmeye soru sor veya randevu al.</p>
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px))] flex-col lg:h-screen">
      {/* Mobile header */}
      <div className="border-b border-border bg-card/95 px-5 py-3 lg:hidden">
        {mobileView === "chat" && activeConv ? (
          <div className="flex items-center gap-3">
            <button onClick={() => { setMobileView("list"); setActiveId(null); }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold">{activeConv.business_name}</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {wsStatus === "connected" ? <><Wifi className="h-3 w-3 text-emerald-500" />Canlı</> : <><WifiOff className="h-3 w-3 text-amber-500" />...</>}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">Mesajlarım</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol: konuşma listesi */}
        <aside className={`flex flex-col border-r border-border bg-card lg:w-80 ${mobileView === "list" ? "w-full" : "hidden lg:flex"}`}>
          <div className="hidden border-b border-border px-4 py-3 lg:block">
            <p className="text-sm font-semibold">Mesajlarım</p>
            <p className="text-[11px] text-muted-foreground">{convs.length} konuşma</p>
          </div>
          <ul className="flex-1 divide-y divide-border overflow-y-auto no-scrollbar">
            {convs.map((c) => (
              <li key={c.id}>
                <button onClick={() => { setActiveId(c.id); setMobileView("chat"); }}
                  className={`flex w-full items-start gap-3 p-4 text-left transition ${activeId === c.id ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground">
                    {c.business_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.business_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.last_message || "..."}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgoTR(c.updated_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Sağ: chat */}
        <div className={`flex flex-1 flex-col ${mobileView === "chat" ? "flex" : "hidden lg:flex"}`}>
          {!activeConv ? (
            <div className="hidden flex-1 items-center justify-center lg:flex">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">Bir konuşma seçin</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden items-center gap-3 border-b border-border px-5 py-3 lg:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{activeConv.business_name}</p>
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {wsStatus === "connected" ? <><Wifi className="h-3 w-3 text-emerald-500" />Canlı</> : <><WifiOff className="h-3 w-3 text-amber-500" />Bağlanıyor...</>}
                  </p>
                </div>
              </div>

              {/* Mesajlar */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
                <div className="space-y-3">
                  {messages.map((m) => (
                    m.sender_role === "user" ? (
                      <div key={m.id} className="group flex justify-end">
                        <div className="flex flex-col items-end gap-0.5">
                          <div className={`max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground ${m.temp ? "opacity-60" : ""}`}>
                            {m.text}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {m.created_at ? timeAgoTR(m.created_at) : "Az önce"}
                          </span>
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
                          <span className="text-[10px] text-muted-foreground">
                            {m.created_at ? timeAgoTR(m.created_at) : "Az önce"}
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Input */}
              <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-card px-5 py-3">
                <input value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary" />
                <button type="submit" disabled={!text.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
