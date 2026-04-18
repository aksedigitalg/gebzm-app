"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, MessageCircle, Send, Check } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { addConversation } from "@/lib/messages";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

function futureDateOptions(count = 14) {
  const list: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    list.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "short" }),
    });
  }
  return list;
}

const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];

interface Props {
  businessName: string;
  businessType: "Restoran" | "Kuaför" | "Doktor" | "Hizmet";
  bookingLabel?: string;
  services?: { id: string; label: string; duration?: string }[];
  businessId?: string;
}

export function BusinessActions({ businessName, businessType, bookingLabel = "Rezervasyon", services, businessId }: Props) {
  const router = useRouter();
  const [openBooking, setOpenBooking] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [done, setDone] = useState<null | "booking" | "question">(null);

  const handleClose = (type: "booking" | "question") => {
    if (type === "booking") { setOpenBooking(false); }
    else { setOpenQuestion(false); }
    if (done === type) { setDone(null); router.push("/profil/mesajlar"); }
  };

  return (
    <>
      {/* CTA Bar — viewport altından 20px, içerik alanı ortası (sidebar dahil) */}
      <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-4 lg:left-[88px]">
        <div className="flex w-full max-w-md gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
          <button type="button" onClick={() => setOpenBooking(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            <CalendarCheck2 className="h-4 w-4" />{bookingLabel}
          </button>
          <button type="button" onClick={() => setOpenQuestion(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted">
            <MessageCircle className="h-4 w-4" />Soru Sor
          </button>
        </div>
      </div>

      <BookingDialog open={openBooking} onClose={() => handleClose("booking")}
        businessName={businessName} bookingLabel={bookingLabel}
        businessId={businessId} onConfirmed={() => setDone("booking")} />

      <QuestionDialog open={openQuestion} onClose={() => handleClose("question")}
        businessName={businessName} businessType={businessType}
        businessId={businessId} onSent={() => setDone("question")} />
    </>
  );
}

function BookingDialog({ open, onClose, businessName, bookingLabel, businessId, onConfirmed }: {
  open: boolean; onClose: () => void; businessName: string;
  bookingLabel: string; businessId?: string; onConfirmed: () => void;
}) {
  const dates = futureDateOptions();
  const [date, setDate] = useState(dates[0].iso);
  const [time, setTime] = useState("10:00");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const user = getUser();
    const dateLabel = new Date(date).toLocaleDateString("tr-TR");
    if (user?.token && businessId) {
      try {
        await api.user.createReservation({
          business_id: businessId, date, time,
          type: bookingLabel.toLowerCase().includes("randevu") ? "randevu" : "rezervasyon",
          party_size: 1,
        });
        await api.user.startConversation(businessId, `${bookingLabel} talebim: ${dateLabel} saat ${time}`);
      } catch { /* fallback */ }
    } else {
      addConversation({ businessName, businessType: "Hizmet", subject: bookingLabel, firstMessage: `${bookingLabel}: ${dateLabel} ${time}` });
    }
    setLoading(false);
    setConfirmed(true);
    onConfirmed();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title={`${businessName} · ${bookingLabel}`}>
      {confirmed ? (
        <SuccessBlock title={`${bookingLabel} Talebiniz Alındı`} description="Mesajlarım bölümünden takip edebilirsiniz." onClose={onClose} />
      ) : (
        <div className="space-y-5">
          {/* Tarih */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tarih</p>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
              {dates.map((d) => (
                <button key={d.iso} type="button" onClick={() => setDate(d.iso)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${date === d.iso ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saat */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saat</p>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((t) => (
                <button key={t} type="button" onClick={() => setTime(t)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Özet */}
          <div className="rounded-xl bg-muted/50 p-3 text-sm">
            <p className="font-medium">
              📅 {new Date(date).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}⏰ {time}
            </p>
          </div>

          <button type="button" onClick={submit} disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            <CalendarCheck2 className="h-4 w-4" />
            {loading ? "Gönderiliyor..." : `${bookingLabel} Talebi Gönder`}
          </button>
        </div>
      )}
    </Dialog>
  );
}

function QuestionDialog({ open, onClose, businessName, businessType, businessId, onSent }: {
  open: boolean; onClose: () => void; businessName: string; businessType: string;
  businessId?: string; onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const user = getUser();
    if (user?.token && businessId) {
      try { await api.user.startConversation(businessId, text); } catch { /* fallback */ }
    } else {
      addConversation({ businessName, businessType, subject: "Soru", firstMessage: text });
    }
    setLoading(false);
    setSent(true);
    onSent();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title={`${businessName} · Soru Sor`}>
      {sent ? (
        <SuccessBlock title="Mesajınız Gönderildi" description="İşletme yanıtı Mesajlarım bölümüne düşecek." onClose={onClose} />
      ) : (
        <div className="space-y-3">
          <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Sormak istediğiniz soruyu yazın..." autoFocus
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
          <button type="button" onClick={submit} disabled={!text.trim() || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
            <Send className="h-4 w-4" />{loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      )}
    </Dialog>
  );
}

function SuccessBlock({ title, description, onClose }: { title: string; description: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <Check className="h-8 w-8" strokeWidth={2} />
      </div>
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      <button type="button" onClick={onClose}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
        Mesajlarım
      </button>
    </div>
  );
}
