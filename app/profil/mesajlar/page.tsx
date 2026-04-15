"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getConversations, type Conversation } from "@/lib/messages";
import { timeAgoTR } from "@/lib/format";

export default function MesajlarPage() {
  const [list, setList] = useState<Conversation[]>([]);

  useEffect(() => {
    setList(getConversations());
    const onUpdate = () => setList(getConversations());
    window.addEventListener("gebzem-messages-update", onUpdate);
    return () => window.removeEventListener("gebzem-messages-update", onUpdate);
  }, []);

  return (
    <>
      <PageHeader title="Mesajlarım" subtitle={`${list.length} konuşma`} back="/profil" />
      <div className="px-5 pb-6 pt-4">
        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold">Henüz mesajın yok</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Bir işletmeye rezervasyon, randevu veya soru gönderdiğinde burada listelenir.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/profil/mesajlar/${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground">
                  {c.businessName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.businessName}</p>
                    {c.unread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {c.businessType} · {c.subject}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                    {timeAgoTR(c.updatedAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
