import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { dineInRestaurants } from "@/data/restaurants";

export const metadata = { title: "Restoran" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Restoran"
        subtitle={`${dineInRestaurants.length} mekan · Yerinde yemek`}
        back="/kategoriler"
      />
      <div className="px-5 pb-6 pt-4">
        <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {dineInRestaurants.map((r) => (
            <Link
              key={r.slug}
              href={`/restoran/${r.slug}`}
              className="block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
            >
              <div
                className={`relative h-36 bg-gradient-to-br ${r.coverGradient}`}
              >
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {r.rating.toFixed(1)}
                  <span className="opacity-80">({r.reviewCount})</span>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                  {"₺".repeat(r.priceLevel)}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.cuisine}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {r.address}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
