"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { socialApi } from "@/lib/api";

export default function NewDMPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const targetId = sp.get("to");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!targetId) {
      router.replace("/sosyal/mesajlar");
    }
  }, [targetId, router]);

  const send = async () => {
    if (!text.trim() || !targetId) return;
    setSending(true);
    setError("");
    try {
      const r = await socialApi.sendDM(targetId, { text: text.trim() });
      router.replace(`/sosyal/mesajlar/${r.conversation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold">Yeni Mesaj</h1>
      </header>
      <div className="space-y-3 p-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, 2000))}
          rows={5}
          placeholder="Mesajını yaz..."
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          autoFocus
        />
        {error && (
          <div className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || sending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Gönder
        </button>
      </div>
    </div>
  );
}
