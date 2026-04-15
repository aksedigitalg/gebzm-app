"use client";

import { Search, AlertTriangle, Check, X } from "lucide-react";
import { classifieds } from "@/data/classifieds";
import { formatTRY, timeAgoTR } from "@/lib/format";

export default function Page() {
  const reportedIds = new Set(["c-5", "c-8"]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">İlanlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toplam {classifieds.length} ilan · {reportedIds.size} şikayet
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold">Raporlanan İlanlar</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {reportedIds.size} ilan kullanıcılar tarafından raporlandı. İncelemeniz gerekiyor.
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="İlan ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-3">
        {classifieds.map((c) => {
          const reported = reportedIds.has(c.id);
          return (
            <div
              key={c.id}
              className={`flex gap-4 rounded-2xl border bg-card p-4 ${reported ? "border-amber-500/40" : "border-border"}`}
            >
              <div className={`h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br ${c.coverGradient}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p className="line-clamp-1 text-sm font-semibold">{c.title}</p>
                  {reported && (
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      RAPORLANDI
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.subCategory} · {c.location}
                </p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {formatTRY(c.price)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.seller.name} · {timeAgoTR(c.date)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {reported ? (
                  <>
                    <button className="flex h-8 items-center gap-1 rounded-lg bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20">
                      <Check className="h-3 w-3" /> Uygun
                    </button>
                    <button className="flex h-8 items-center gap-1 rounded-lg bg-red-500/10 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-500/20">
                      <X className="h-3 w-3" /> Kaldır
                    </button>
                  </>
                ) : (
                  <button className="flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition hover:bg-muted">
                    Detay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
