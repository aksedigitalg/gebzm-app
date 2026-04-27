"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, User as UserIcon, Wifi, WifiOff } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useSocialWS } from "@/lib/social-ws";
import type { DMConversation, DMMessage } from "@/lib/types/social";

/**
 * DM Thread — WebSocket realtime
 *
 *  - Initial load: REST GET /social/dm/:id/messages
 *  - Subscribe: dm:<myUserId> kanalına (server tüm DM'leri buraya pushlar)
 *  - Aynı conversation_id ise mesajı UI'a ekle
 *  - WS kapalıysa fallback 10sn polling
 *  - Optimistic send: tempId ile anında, sonra gerçek id
 */
export default function DMThreadPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [conv, setConv] = useState<DMConversation | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenMsgIds = useRef<Set<string>>(new Set());
  const { subscribe, status } = useSocialWS();

  const me = typeof window !== "undefined" ? getUser() : null;

  const load = async () => {
    try {
      const [list, convs] = await Promise.all([
        socialApi.getDMMessages(id),
        socialApi.getDMConversations(),
      ]);
      const msgs = list as unknown as DMMessage[];
      msgs.forEach(m => seenMsgIds.current.add(m.id));
      setMessages(msgs);
      const found = (convs as unknown as DMConversation[]).find(c => c.id === id);
      if (found) setConv(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }, 50);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // WebSocket: dm:<userId> kanalı dinle, aynı conversation'a aitse ekle
  useEffect(() => {
    if (!me?.id || !id) return;
    const off = subscribe(`dm:${me.id}`, msg => {
      const p = (msg.payload as Record<string, unknown>) || {};
      const cid = p.conversation_id as string | undefined;
      const msgID = p.id as string | undefined;
      if (!cid || cid !== id || !msgID) return;
      // Echo (kendi gönderdiğim mesaj — zaten optimistic eklendi)
      if (p.echo === true) {
        // Sadece tempId'yi gerçek id'ye eşle (optional: zaten skip)
        return;
      }
      // Duplicate guard
      if (seenMsgIds.current.has(msgID)) return;
      seenMsgIds.current.add(msgID);
      const newMsg: DMMessage = {
        id: msgID,
        sender_id: (p.sender_id as string) || "",
        text: (p.text as string) || "",
        media_url: (p.media_url as string) || "",
        is_read: false,
        created_at: (p.created_at as string) || new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      // Read mark — okuyoruz, server tarafına bildir
      socialApi.getDMMessages(id).catch(() => {});
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }, 50);
    });
    return off;
  }, [me?.id, id, subscribe]);

  // WS kapalıyken fallback poll (10sn)
  useEffect(() => {
    if (status === "open") return;
    if (!id) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  const send = async () => {
    if (!text.trim() || !conv || sending) return;
    setSending(true);
    const tempId = "tmp-" + Date.now();
    const draft = text.trim();
    // Optimistic
    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        sender_id: me?.id || "",
        text: draft,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);
    setText("");
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, 30);

    try {
      const r = await socialApi.sendDM(conv.other_user_id, { text: draft });
      // Replace tempId with real id
      seenMsgIds.current.add(r.id);
      setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, id: r.id } : m)));
    } catch (err) {
      // Revert
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {conv && (
          <Link href={`/sosyal/${conv.username}`} className="flex min-w-0 flex-1 items-center gap-3">
            {conv.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={conv.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{conv.display_name}</p>
              <p className="text-xs text-muted-foreground">@{conv.username}</p>
            </div>
          </Link>
        )}
        <span
          title={status === "open" ? "Realtime aktif" : "Bağlanılıyor..."}
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            status === "open" ? "text-emerald-500" : "text-muted-foreground"
          }`}
        >
          {status === "open" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Henüz mesaj yok. İlk mesajı gönder.
          </p>
        )}
        {!loading &&
          messages.map(m => {
            const mine = m.sender_id === me?.id;
            return (
              <div
                key={m.id}
                className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text && <p className="whitespace-pre-line break-words">{m.text}</p>}
                  {m.media_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.media_url} alt="" className="mt-1 max-w-full rounded-lg" />
                  )}
                  <p
                    className={`mt-0.5 text-[10px] ${
                      mine ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {m.id.startsWith("tmp-") && " · gönderiliyor..."}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      <footer className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 2000))}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Mesaj yaz..."
            className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
