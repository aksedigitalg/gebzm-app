"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Store } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getConversation, appendMessage, type Conversation } from "@/lib/messages";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

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
  const [title, setTitle] = useState("Konuşma");
  const [text, setText] = useState("");
  const [isApi, setIsApi] = useState(false);
  const [localConv, setLocalConv] = useState<Conversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user?.token) {
      setIsApi(true);
      loadApiMessages();
    } else {
      const c = getConversation(params.id);
      if (!c) { router.replace("/profil/mesajlar"); return; }
      setLocalConv(c);
      setTitle(c.businessName);
      setMessages(c.messages.map((m, i) => ({
        id: String(i),
        text: m.text,
        senderRole: m.from === "user" ? "user" : "business",
        createdAt: m.timestamp || new Date().toISOString(),
      })));
    }
  }, [params.id]);

  const loadApiMessages = async () => {
    try {
      const data = await api.user.getMessages(params.id) as Record<string, unknown>[];
      setMessages(data.map((m) => ({
        id: m.id as string,
        text: m.text as string,
        senderRole: m.sender_role as "user" | "business",
        createdAt: m.created_at as string,
      })));
    } catch {
      router.replace("/profil/mesajlar");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    if (isApi) {
      try {
        await api.user.sendMessage(params.id, t);
        await loadApiMessages();
      } catch { setText(t); }
    } else {
      appendMessage(localConv!.id, t);
      const updated = getConversation(params.id);
      if (updated) {
        setMessages(updated.messages.map((m, i) => ({
          id: String(i),
          text: m.text,
          senderRole: m.from === "user" ? "user" : "business",
          createdAt: m.timestamp || new Date().toISOString(),
        })));
      }
    }
  };

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px)-10px)] flex-col">
      <PageHeader title={title} back="/profil/mesajlar" />
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
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t border-border bg-card px-5 py-3"
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
