"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck2,
  MessageCircle,
  Users,
  Clock,
  Send,
  Check,
} from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { addConversation } from "@/lib/messages";

function futureDateOptions(count = 7) {
  const list: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    list.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("tr-TR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
    });
  }
  return list;
}

const timeSlots = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

interface Props {
  businessName: string;
  businessType: "Restoran" | "Kuaför" | "Doktor" | "Hizmet";
  bookingLabel?: string; // "Rezervasyon" | "Randevu"
  services?: { id: string; label: string; duration?: string }[];
}

export function BusinessActions({
  businessName,
  businessType,
  bookingLabel = "Rezervasyon",
  services,
}: Props) {
  const router = useRouter();
  const [openBooking, setOpenBooking] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [done, setDone] = useState<null | "booking" | "question">(null);

  return (
    <>
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <div className="mx-auto flex max-w-[600px] gap-2">
          <button
            type="button"
            onClick={() => setOpenBooking(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90"
          >
            <CalendarCheck2 className="h-4 w-4" />
            {bookingLabel}
          </button>
          <button
            type="button"
            onClick={() => setOpenQuestion(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold shadow-lg transition hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            Soru Sor
          </button>
        </div>
      </div>

      <BookingDialog
        open={openBooking}
        onClose={() => {
          setOpenBooking(false);
          if (done === "booking") {
            setDone(null);
            router.push("/profil/mesajlar");
          }
        }}
        businessName={businessName}
        businessType={businessType}
        bookingLabel={bookingLabel}
        services={services}
        onConfirmed={() => setDone("booking")}
      />

      <QuestionDialog
        open={openQuestion}
        onClose={() => {
          setOpenQuestion(false);
          if (done === "question") {
            setDone(null);
            router.push("/profil/mesajlar");
          }
        }}
        businessName={businessName}
        businessType={businessType}
        onSent={() => setDone("question")}
      />
    </>
  );
}

function BookingDialog({
  open,
  onClose,
  businessName,
  businessType,
  bookingLabel,
  services,
  onConfirmed,
}: {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  bookingLabel: string;
  services?: { id: string; label: string; duration?: string }[];
  onConfirmed: () => void;
}) {
  const [service, setService] = useState(services?.[0]?.id ?? "");
  const [date, setDate] = useState(futureDateOptions()[0].iso);
  const [time, setTime] = useState("20:00");
  const [party, setParty] = useState(2);
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const submit = () => {
    const svc = services?.find((s) => s.id === service)?.label;
    const parts: string[] = [];
    if (svc) parts.push(svc);
    parts.push(new Date(date).toLocaleDateString("tr-TR"));
    parts.push(time);
    if (!services) parts.push(`${party} kişi`);
    if (note) parts.push(`Not: ${note}`);
    const summary = parts.join(" · ");

    addConversation({
      businessName,
      businessType,
      subject: bookingLabel,
      firstMessage: `${bookingLabel} talebim: ${summary}`,
    });
    setConfirmed(true);
    onConfirmed();
  };

  return (
    <Dialog open={open} onClose={onClose} title={`${businessName} · ${bookingLabel}`}>
      {confirmed ? (
        <SuccessBlock
          title={`${bookingLabel} Talebiniz Alındı`}
          description="Mesajlarım bölümünden işletme yanıtını takip edebilirsiniz."
          onClose={onClose}
        />
      ) : (
        <div className="space-y-4">
          {services && services.length > 0 && (
            <div>
              <Label>Hizmet</Label>
              <div className="mt-2 space-y-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                      service === s.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{s.label}</span>
                    {s.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {s.duration}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Tarih</Label>
            <div className="mt-2 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
              {futureDateOptions().map((d, i) => {
                const selected = date === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDate(d.iso)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    } ${i === 0 ? "ml-0" : ""}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Saat</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {timeSlots.map((t) => {
                const selected = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {!services && (
            <div>
              <Label>Kişi Sayısı</Label>
              <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                <button
                  type="button"
                  onClick={() => setParty((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-muted"
                >
                  -
                </button>
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Users className="h-3.5 w-3.5" />
                  {party} kişi
                </span>
                <button
                  type="button"
                  onClick={() => setParty((p) => Math.min(20, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-muted"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div>
            <Label>Not (opsiyonel)</Label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Özel istekler, alerji, vs."
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="button"
            onClick={submit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <CalendarCheck2 className="h-4 w-4" />
            {bookingLabel} Talebi Gönder
          </button>
        </div>
      )}
    </Dialog>
  );
}

function QuestionDialog({
  open,
  onClose,
  businessName,
  businessType,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    addConversation({
      businessName,
      businessType,
      subject: "Soru",
      firstMessage: text,
    });
    setSent(true);
    onSent();
  };

  return (
    <Dialog open={open} onClose={onClose} title={`${businessName} · Soru Sor`}>
      {sent ? (
        <SuccessBlock
          title="Mesajınız Gönderildi"
          description="İşletme yanıtı Mesajlarım bölümüne düşecek."
          onClose={onClose}
        />
      ) : (
        <div className="space-y-3">
          <Label>Mesajınız</Label>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Sormak istediğiniz soruyu yazın..."
            autoFocus
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Gönder
          </button>
        </div>
      )}
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function SuccessBlock({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <Check className="h-8 w-8" strokeWidth={2} />
      </div>
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {description}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Mesajlarım
      </button>
    </div>
  );
}
