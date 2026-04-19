"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, User, Bot, Mic } from "lucide-react";
import { getAIResponse } from "@/lib/ai-responses";

interface Msg { id: string; role: "user" | "ai"; text: string; }

interface Props {
  open: boolean;
  onClose: () => void;
}

const WELCOME = "Merhaba! Ben Gebzem AI. Gebze hakkında her şeyi sorabilirsiniz — tarihi yerler, ulaşım, etkinlikler, hizmetler ve daha fazlası!";

export function AiPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "0", role: "ai", text: WELCOME },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  }, [messages, open]);

  // ESC ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const send = async () => {
    const t = text.trim();
    if (!t || typing) return;
    setText("");

    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: t };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // AI cevabı simüle et (gerçek API yerine statik cevaplar)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const answer = getAIResponse(t);
    const answerText = typeof answer === "string" ? answer : (answer as { text?: string }).text || String(answer);
    setMessages(prev => [...prev, { id: Date.now().toString() + "a", role: "ai", text: answerText }]);
    setTyping(false);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out sm:w-[400px] ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Gebzem AI</p>
            <p className="text-[10px] text-muted-foreground">Gebze hakkında her şeyi sor</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mesajlar */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
          <div className="space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.role === "ai" ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                  {m.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "ai"
                    ? "rounded-tl-sm bg-muted text-foreground"
                    : "rounded-tr-sm bg-primary text-primary-foreground"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Öneriler */}
        <div className="border-t border-border px-4 py-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {["Tarihi yerler", "Ulaşım", "Restoranlar", "Etkinlikler", "Harita"].map(q => (
              <button key={q} onClick={() => { setText(q); }}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 focus-within:border-primary">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Her şeyi sorabilirsiniz..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ maxHeight: "100px" }}
            />
            <button onClick={send} disabled={!text.trim() || typing}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-90 disabled:opacity-40">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            AI yanıtları yanlış olabilir. Önemli kararlar için doğrulayın.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
