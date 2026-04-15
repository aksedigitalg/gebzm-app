"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { platformAds, type Placement } from "@/lib/ads";

interface Props {
  placement: Placement;
}

export function AdSlider({ placement }: Props) {
  const ads = platformAds.filter((a) => a.placements.includes(placement));

  if (ads.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5 px-5">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sponsorlu
        </span>
      </div>
      <div className="-mx-5 flex gap-3 overflow-x-auto snap-x scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar">
        {ads.map((ad, i) => (
          <Link
            key={ad.id}
            href={ad.ctaUrl}
            className={`relative flex h-44 w-[85vw] max-w-[380px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${ad.gradient} p-5 text-white shadow-lg transition hover:shadow-xl first:ml-5 last:mr-5`}
          >
            <div className="absolute left-4 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Sponsorlu
            </div>
            <p className="text-[11px] font-medium opacity-90">
              {ad.businessName} · {ad.businessType}
            </p>
            <p className="mt-1 text-lg font-bold leading-tight">{ad.title}</p>
            <p className="mt-1 text-xs opacity-90">{ad.description}</p>
            <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900">
              {ad.cta} →
            </div>
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          </Link>
        ))}
      </div>
    </section>
  );
}
