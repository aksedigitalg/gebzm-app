"use client";

import { useState } from "react";
import { Check, Heart, Loader2 } from "lucide-react";
import { eventApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";
import type { EventUserStatus } from "@/lib/types/event";

interface Props {
  eventId: string;
  initialStatus?: EventUserStatus;
}

export function EventInterestButton({ eventId, initialStatus }: Props) {
  const [status, setStatus] = useState<EventUserStatus>(initialStatus || "");
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const choose = async (next: "katiliyor" | "ilgileniyor") => {
    const user = getUser();
    if (!user?.token) {
      setAuthOpen(true);
      return;
    }
    if (status === next) {
      // Aynı butona tekrar bas → kaldır
      setLoading(true);
      try {
        await eventApi.removeInterest(eventId);
        setStatus("");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Hata");
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await eventApi.markInterest(eventId, next);
      setStatus(next);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 lg:left-[88px]">
        <div className="flex w-full max-w-md gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={() => choose("ilgileniyor")}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor:
                status === "ilgileniyor" ? "#fef3c7" : "transparent",
              borderColor:
                status === "ilgileniyor" ? "#f59e0b" : "var(--border, #e5e7eb)",
              color: status === "ilgileniyor" ? "#92400e" : undefined,
            }}
          >
            {loading && status !== "ilgileniyor" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "ilgileniyor" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {status === "ilgileniyor" ? "İlgileniyorum ✓" : "İlgileniyorum"}
          </button>
          <button
            type="button"
            onClick={() => choose("katiliyor")}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor:
                status === "katiliyor" ? "#10b981" : "var(--primary, #0e7490)",
            }}
          >
            {loading && status === "katiliyor" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "katiliyor" ? (
              <Check className="h-4 w-4" />
            ) : null}
            {status === "katiliyor" ? "Katılıyorum ✓" : "Katılıyorum"}
          </button>
        </div>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
        message="Etkinliğe katılmak için giriş yapın"
      />
    </>
  );
}
