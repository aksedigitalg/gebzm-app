"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getAIResponse, initialSuggestions } from "@/lib/ai-responses";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  suggestions?: string[];
}

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Merhaba! Ben Gebzem AI asistanıyım. Gebze'yi keşfetmene yardımcı olabilirim. Ne öğrenmek istersin?",
      suggestions: initialSuggestions,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: q,
    };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);

    // Sahte düşünme süresi
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

    const response = getAIResponse(q);
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "ai",
      text: response.text,
      suggestions: response.suggestions,
    };
    setMessages((m) => [...m, aiMsg]);
    setThinking(false);
  };

  return (
    <div className="flex h-[calc(100dvh-76px-env(safe-area-inset-bottom,0px)-10px)] flex-col">
      <PageHeader title="Gebzem AI" subtitle="Şehir asistanın" />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pb-3 pt-4 no-scrollbar"
      >
        <div className="space-y-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} text={m.text} />
            ) : (
              <AIMessage
                key={m.id}
                text={m.text}
                suggestions={m.suggestions}
                onSuggestion={ask}
              />
            )
          )}
          {thinking && <TypingIndicator />}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-border bg-card px-5 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bir soru sor..."
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          disabled={thinking}
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          aria-label="Gönder"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        {text}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-4 w-4" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function AIMessage({
  text,
  suggestions,
  onSuggestion,
}: {
  text: string;
  suggestions?: string[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
          {text}
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Bot className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
