import Link from "next/link";
import { MapPin, Image as ImageIcon, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  classifieds,
  classifiedCategories,
  type ClassifiedCategory,
} from "@/data/classifieds";
import { formatTRY, timeAgoTR } from "@/lib/format";

export const metadata = { title: "İlanlar" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const active = (k ?? "all") as "all" | ClassifiedCategory;
  const list =
    active === "all"
      ? classifieds
      : classifieds.filter((c) => c.category === active);

  return (
    <>
      <PageHeader
        title="İlanlar"
        subtitle={`${list.length} ilan · Gebze ve çevresi`}
        back="/kategoriler"
      />
      <div className="px-5 pb-6 pt-4">
        {/* Kategori filtreleri */}
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-1 no-scrollbar">
          <Link
            href="/ilanlar"
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition first:ml-5 ${
              active === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            Tümü
          </Link>
          {classifiedCategories.map((c, i) => (
            <Link
              key={c.id}
              href={`/ilanlar?k=${c.id}`}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                active === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              } ${i === classifiedCategories.length - 1 ? "mr-5" : ""}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* İlan listesi */}
        <div className="space-y-3">
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/ilanlar/${c.id}`}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-md"
            >
              <div
                className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${c.coverGradient}`}
              >
                <ImageIcon className="h-7 w-7 text-white/70" strokeWidth={1.5} />
                <span className="absolute bottom-1 right-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                  {c.photoCount}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{c.title}</p>
                <p className="mt-1 text-base font-bold text-primary">
                  {formatTRY(c.price)}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {timeAgoTR(c.date)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
