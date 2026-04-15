import { notFound } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Heart,
  Share2,
  Send,
  Bookmark,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { jobs, jobTypeLabels } from "@/data/jobs";
import { timeAgoTR } from "@/lib/format";

export async function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const j = jobs.find((x) => x.id === id);
  return { title: j?.title ?? "İş İlanı" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const j = jobs.find((x) => x.id === id);
  if (!j) notFound();

  return (
    <>
      <PageHeader title="İş İlanı" back="/is-basvurusu" />
      <div className="pb-32">
        <div className="px-5 pt-5">
          {/* Şirket başlığı */}
          <div className="flex items-start gap-3">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${j.logoColor} text-primary-foreground`}
            >
              <Briefcase className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold leading-tight">{j.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{j.company}</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Favori"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Paylaş"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Özellik chipleri */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Chip label={jobTypeLabels[j.type]} />
            <Chip label={j.experience} />
            {j.salary && <Chip label={j.salary} />}
          </div>

          {/* İstatistik */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {j.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {j.applicants} başvuru
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgoTR(j.postedDate)}
            </span>
          </div>

          {/* Açıklama */}
          <section className="mt-5 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              İş Tanımı
            </h3>
            <p className="text-sm leading-relaxed">{j.description}</p>
          </section>

          {/* Aranan Nitelikler */}
          <section className="mt-3 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aranan Nitelikler
            </h3>
            <ul className="space-y-2 text-sm">
              {j.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Yan Haklar */}
          <section className="mt-3 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Yan Haklar
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {j.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                >
                  {b}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky apply */}
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <div className="mx-auto flex max-w-[600px] gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            Hemen Başvur
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold shadow-lg transition hover:bg-muted"
          >
            <Bookmark className="h-4 w-4" />
            Kaydet
          </button>
        </div>
      </div>
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
      {label}
    </span>
  );
}
