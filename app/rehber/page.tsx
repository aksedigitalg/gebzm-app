import Link from "next/link";
import {
  Utensils,
  Coffee,
  ShoppingBag,
  Hospital,
  Store,
  MapPin,
  Star,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  guideItems,
  guideCategoryLabels,
  type GuideCategory,
} from "@/data/guide";

export const metadata = { title: "Rehber" };

const icons: Record<GuideCategory, typeof Utensils> = {
  restoran: Utensils,
  kafe: Coffee,
  avm: ShoppingBag,
  hastane: Hospital,
  market: Store,
};

const categories: ("all" | GuideCategory)[] = [
  "all",
  "restoran",
  "kafe",
  "avm",
  "market",
  "hastane",
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const active = (kategori ?? "all") as "all" | GuideCategory;
  const filtered =
    active === "all"
      ? guideItems
      : guideItems.filter((g) => g.category === active);

  return (
    <>
      <PageHeader
        title="Rehber"
        subtitle={`${filtered.length} mekan listeleniyor`}
      />
      <div className="px-4 pb-10 pt-4">
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {categories.map((c) => {
            const isActive = active === c;
            const label = c === "all" ? "Tümü" : guideCategoryLabels[c];
            const href = c === "all" ? "/rehber" : `/rehber?kategori=${c}`;
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
          {filtered.map((g) => {
            const Icon = icons[g.category];
            return (
              <div
                key={g.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{g.name}</p>
                    {typeof g.rating === "number" && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        {g.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {guideCategoryLabels[g.category]}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {g.address}
                  </p>
                  {g.phone && (
                    <a
                      href={`tel:${g.phone.replace(/\s/g, "")}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {g.phone}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
