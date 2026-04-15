"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Store } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  getConversation,
  appendMessage,
  type Conversation,
} from "@/lib/messages";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      const c = getConversation(params.id);
      if (!c) {
        router.replace("/profil/mesajlar");
        return;
      }
      setConversation(c);
    };
    load();
    window.addEventListener("gebzem-messages-update", load);
    return () => window.removeEventListener("gebzem-messages-update", load);
  }, [params.id, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation]);

  if (!conversation) return null;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    appendMessage(conversation.id, t);
    setText("");
    setConversation(getConversation(conversation.id) ?? null);
  };

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px)-10px)] flex-col">
      <PageHeader
        title={conversation.businessName}
        subtitle={`${conversation.businessType} · ${conversation.subject}`}
        back="/profil/mesajlar"
      />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar"
      >
        <div className="space-y-3">
          {conversation.messages.map((m) =>
            m.from === "user" ? (
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
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
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
          aria-label="Gönder"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
