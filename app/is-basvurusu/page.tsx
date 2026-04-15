import Link from "next/link";
import { Briefcase, MapPin, Clock, Banknote, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { jobs, jobCategories, jobTypeLabels } from "@/data/jobs";
import { timeAgoTR } from "@/lib/format";

export const metadata = { title: "İş Başvurusu" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const active = k ?? "all";
  const list = active === "all" ? jobs : jobs.filter((j) => j.category === active);

  return (
    <>
      <PageHeader
        title="İş Başvurusu"
        subtitle={`${list.length} iş ilanı · Gebze ve çevresi`}
        back="/kategoriler"
      />
      <div className="px-5 pb-6 pt-4">
        {/* Kategori filtreleri */}
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-1 no-scrollbar">
          {jobCategories.map((c, i) => {
            const selected = active === c.id;
            const href = c.id === "all" ? "/is-basvurusu" : `/is-basvurusu?k=${c.id}`;
            return (
              <Link
                key={c.id}
                href={href}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                } ${i === 0 ? "ml-5" : ""} ${i === jobCategories.length - 1 ? "mr-5" : ""}`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* İş listesi */}
        <div className="space-y-3">
          {list.map((j) => (
            <Link
              key={j.id}
              href={`/is-basvurusu/${j.id}`}
              className="block rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${j.logoColor} text-primary-foreground`}
                >
                  <Briefcase className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{j.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {j.company}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Tag label={jobTypeLabels[j.type]} />
                    <Tag label={j.experience} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {j.location}
                    </span>
                    {j.salary && (
                      <span className="inline-flex items-center gap-1">
                        <Banknote className="h-3 w-3" />
                        {j.salary}
                      </span>
                    )}
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {label}
    </span>
  );
}
