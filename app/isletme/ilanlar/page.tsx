"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  MapPin,
  Users,
  Clock,
  Pencil,
  Copy,
  Trash2,
  Eye,
} from "lucide-react";

type JobStatus = "active" | "draft" | "expired";

interface BusinessJob {
  id: string;
  title: string;
  type: string;
  location: string;
  salary?: string;
  postedDate: string;
  applicants: number;
  views: number;
  status: JobStatus;
}

const initial: BusinessJob[] = [
  {
    id: "bj-1",
    title: "Garson (Deneyimli)",
    type: "Tam Zamanlı",
    location: "Mustafa Paşa Mah., Gebze",
    salary: "25.000 - 32.000 TL + bahşiş",
    postedDate: "3 gün önce",
    applicants: 14,
    views: 284,
    status: "active",
  },
  {
    id: "bj-2",
    title: "Mutfak Yardımcısı",
    type: "Tam Zamanlı",
    location: "Gebze",
    salary: "22.000 - 26.000 TL",
    postedDate: "1 hafta önce",
    applicants: 22,
    views: 412,
    status: "active",
  },
  {
    id: "bj-3",
    title: "Hafta Sonu Bulaşıkçı",
    type: "Yarı Zamanlı",
    location: "Gebze",
    salary: "Saatlik 75 TL",
    postedDate: "Taslak",
    applicants: 0,
    views: 0,
    status: "draft",
  },
];

const statusStyle: Record<JobStatus, { label: string; cls: string }> = {
  active: { label: "Yayında", cls: "bg-emerald-500/10 text-emerald-600" },
  draft: { label: "Taslak", cls: "bg-amber-500/10 text-amber-600" },
  expired: { label: "Süresi Doldu", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const [list, setList] = useState<BusinessJob[]>(initial);
  const [filter, setFilter] = useState<"all" | JobStatus>("all");

  const filtered = filter === "all" ? list : list.filter((j) => j.status === filter);
  const remove = (id: string) => setList((p) => p.filter((j) => j.id !== id));

  const active = list.filter((j) => j.status === "active").length;
  const draft = list.filter((j) => j.status === "draft").length;
  const totalApplicants = list.reduce((a, j) => a + j.applicants, 0);
  const totalViews = list.reduce((a, j) => a + j.views, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">İş İlanlarım</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active} yayında · {draft} taslak · {totalApplicants} toplam başvuru
          </p>
        </div>
        <Link
          href="/isletme/ilanlar/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni İlan Ver
        </Link>
      </header>

      {/* Özet kartlar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard icon={Briefcase} label="Aktif İlan" value={active} color="from-emerald-500 to-teal-600" />
        <SummaryCard icon={Eye} label="Toplam Görüntüleme" value={totalViews.toLocaleString("tr")} color="from-blue-500 to-indigo-600" />
        <SummaryCard icon={Users} label="Toplam Başvuru" value={totalApplicants} color="from-amber-500 to-orange-600" />
        <SummaryCard icon={Clock} label="Ortalama Yanıt" value="2.5 gün" color="from-rose-500 to-pink-600" />
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "draft", "expired"] as const).map((f) => {
          const labels = { all: "Tümü", active: "Yayında", draft: "Taslaklar", expired: "Süresi Dolmuş" };
          const selected = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold">Bu kategoride ilan yok</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Yeni ilan vermek için sağ üstteki butonu kullan
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    <Briefcase className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{j.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {j.type}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {j.location}
                      </span>
                      {j.salary && <span>{j.salary}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {j.postedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[j.status].cls}`}
                >
                  {statusStyle[j.status].label}
                </span>
              </div>

              {j.status === "active" && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {j.views.toLocaleString("tr")} görüntülenme
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <Users className="h-3 w-3" /> {j.applicants} başvuru
                  </span>
                  <Link
                    href="#"
                    className="ml-auto text-[11px] font-semibold text-primary hover:underline"
                  >
                    Başvuranları gör →
                  </Link>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                  <Pencil className="h-3.5 w-3.5" />
                  Düzenle
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                  <Copy className="h-3.5 w-3.5" />
                  Kopyala
                </button>
                <button
                  onClick={() => remove(j.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
