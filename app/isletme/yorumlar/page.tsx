"use client";

import { Star, Reply } from "lucide-react";

interface Review {
  id: string;
  customer: string;
  rating: number;
  text: string;
  date: string;
  response?: string;
}

const reviews: Review[] = [
  { id: "r-1", customer: "Zeynep Şahin", rating: 5, text: "Mangal lezzetleri harika, servis çok hızlı. Ailemle gelmiştik, çocuklar çok beğendi. Kesinlikle tavsiye ederim!", date: "2 gün önce" },
  { id: "r-2", customer: "Can Aslan", rating: 4, text: "Güzel mekan, yemekler lezzetli. Biraz kalabalıktı ama servis iyi idare etti.", date: "1 hafta önce", response: "Değerli yorumunuz için teşekkür ederiz, tekrar beklemekten mutluluk duyarız." },
  { id: "r-3", customer: "Ahmet Yılmaz", rating: 5, text: "Adana kebap mükemmel! Mimar Sinan'ı dışında en sevdiğim yer.", date: "2 hafta önce" },
  { id: "r-4", customer: "Mert Demir", rating: 3, text: "Ortalama bir deneyim. Yemekler güzel ama fiyatlar biraz yüksek.", date: "3 hafta önce", response: "Geri bildiriminiz için teşekkür ederiz, fiyatlandırmamızı gözden geçireceğiz." },
  { id: "r-5", customer: "Elif Kaya", rating: 5, text: "Bahçede yemek yemek harika bir deneyimdi, doğum günü kutlamamız mükemmel geçti!", date: "1 ay önce" },
  { id: "r-6", customer: "Deniz Aydın", rating: 2, text: "Servis yavaştı, sipariş eksik geldi.", date: "1 ay önce" },
];

export default function Page() {
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  const total = reviews.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Yorumlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} değerlendirme · Genel puan {avg.toFixed(1)}
        </p>
      </header>

      {/* Genel puan */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <p className="text-5xl font-bold">{avg.toFixed(1)}</p>
            <div className="mt-1 flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avg)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{total} değerlendirme</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {counts.map((c) => {
              const pct = (c.count / total) * 100;
              return (
                <div key={c.n} className="flex items-center gap-3 text-xs">
                  <span className="inline-flex w-6 items-center gap-0.5 font-semibold">
                    {c.n}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{c.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Yorum listesi */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                {r.customer.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{r.customer}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {r.date}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.text}</p>

                {r.response ? (
                  <div className="mt-3 rounded-xl bg-primary/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      İşletme Yanıtı
                    </p>
                    <p className="mt-1 text-xs">{r.response}</p>
                  </div>
                ) : (
                  <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <Reply className="h-3 w-3" />
                    Yanıtla
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
