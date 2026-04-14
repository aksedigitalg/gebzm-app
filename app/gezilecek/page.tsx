import Link from "next/link";
import { MapPin, ChevronRight, Landmark } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { places, categoryLabels, type PlaceCategory } from "@/data/places";

export const metadata = { title: "Gezilecek Yerler" };

const categories: ("all" | PlaceCategory)[] = [
  "all",
  "tarihi",
  "doga",
  "park",
  "muze",
  "cami",
  "avm",
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const active = (kategori ?? "all") as "all" | PlaceCategory;
  const filtered =
    active === "all" ? places : places.filter((p) => p.category === active);

  return (
    <>
      <PageHeader
        title="Gezilecek Yerler"
        subtitle={`${filtered.length} yer listeleniyor`}
      />
      <div className="px-5 pb-10 pt-4">
        <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {categories.map((c) => {
            const isActive = active === c;
            const label = c === "all" ? "Tümü" : categoryLabels[c];
            const href = c === "all" ? "/gezilecek" : `/gezilecek?kategori=${c}`;
            return (
              <Link
                key={c}
                href={href}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/gezilecek/${p.slug}`}
              className="group flex gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 transition hover:shadow-md"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25">
                <Landmark className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {categoryLabels[p.category]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {p.shortDescription}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.address}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
