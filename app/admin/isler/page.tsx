"use client";

import { Search, MapPin, Users, Clock } from "lucide-react";
import { jobs, jobTypeLabels } from "@/data/jobs";
import { timeAgoTR } from "@/lib/format";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İş İlanları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toplam {jobs.length} iş ilanı · Platformdaki tüm duyurular
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="İş ilanı ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${j.logoColor} text-white`}>
              {j.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold">{j.title}</p>
                  <p className="text-xs text-muted-foreground">{j.company}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {jobTypeLabels[j.type]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {j.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {j.applicants} başvuru
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgoTR(j.postedDate)}
                </span>
              </div>
            </div>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
              Detay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
