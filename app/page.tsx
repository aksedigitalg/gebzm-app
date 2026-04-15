import Link from "next/link";
import {
  Map,
  Calendar,
  Compass,
  Bus,
  Utensils,
  PhoneCall,
  ChevronRight,
  Landmark,
  MapPin,
} from "lucide-react";
import { places } from "@/data/places";
import { events } from "@/data/events";
import { formatDateTR } from "@/lib/utils";
import { HomeHeader } from "@/components/HomeHeader";
import { AdSlider } from "@/components/AdSlider";
import { quickServices } from "@/data/home-sections";

const quickLinks = [
  {
    href: "/harita",
    label: "Harita",
    description: "Şehirdeki noktaları keşfet",
    icon: Map,
    color: "from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
  },
  {
    href: "/gezilecek",
    label: "Gezilecek Yerler",
    description: "Tarihi ve doğal rotalar",
    icon: Compass,
    color: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/etkinlikler",
    label: "Etkinlikler",
    description: "Konser, festival, sergi",
    icon: Calendar,
    color: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/ulasim",
    label: "Ulaşım",
    description: "Marmaray, otobüs, YHT",
    icon: Bus,
    color: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
  },
  {
    href: "/rehber",
    label: "Rehber",
    description: "Restoran, kafe, hastane",
    icon: Utensils,
    color: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
  },
  {
    href: "/acil",
    label: "Acil Numaralar",
    description: "Hızlı erişim",
    icon: PhoneCall,
    color: "from-red-500/15 to-red-500/5 text-red-600 dark:text-red-400",
  },
];

export default function HomePage() {
  const highlights = places.slice(0, 4);
  const upcoming = [...events]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 3);

  return (
    <div className="pb-6">
      <div className="lg:hidden">
        <HomeHeader />
      </div>
      <div className="mt-5 space-y-7 px-5 lg:mt-4 lg:space-y-10 lg:px-0">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground shadow-lg lg:p-10">
        <div className="relative z-10 lg:max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">
            Hoş geldin
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight lg:text-4xl">
            Gebze&apos;yi keşfetmeye hazır mısın?
          </h2>
          <p className="mt-2 max-w-md text-sm opacity-90 lg:text-base">
            Tarihi mekanlar, doğa rotaları, etkinlikler ve şehir rehberi — hepsi
            tek uygulamada.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/gezilecek"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
            >
              <Compass className="h-4 w-4" />
              Keşfet
            </Link>
            <Link
              href="/harita"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              <Map className="h-4 w-4" />
              Harita
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </section>

      <AdSlider placement="home-slider" />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Hızlı Erişim
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${link.color} p-4 transition hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                  <ChevronRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">
                    {link.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hızlı Servisler */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Hızlı Servisler
        </h3>
        <div className="-mx-5 flex gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:pb-0">
          {quickServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className={`flex w-[72px] shrink-0 flex-col items-center gap-1.5 lg:w-auto ${
                  i === 0 ? "ml-5 lg:ml-0" : ""
                } ${i === quickServices.length - 1 ? "mr-5 lg:mr-0" : ""}`}
              >
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                  <Icon className={`h-6 w-6 ${s.color}`} strokeWidth={1.75} />
                </div>
                <span className="line-clamp-1 text-[11px] font-medium text-muted-foreground">
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Öne Çıkanlar
          </h3>
          <Link
            href="/gezilecek"
            className="text-xs font-medium text-primary hover:underline"
          >
            Tümünü gör
          </Link>
        </div>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {highlights.map((p) => (
            <Link
              key={p.slug}
              href={`/gezilecek/${p.slug}`}
              className="group relative flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md first:ml-5 last:mr-5 lg:w-auto lg:first:ml-0 lg:last:mr-0"
            >
              <div className="relative h-32 w-full bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25">
                <Landmark
                  className="absolute bottom-3 left-3 h-8 w-8 text-primary/70"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {p.shortDescription}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{p.address}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Yaklaşan Etkinlikler
          </h3>
          <Link
            href="/etkinlikler"
            className="text-xs font-medium text-primary hover:underline"
          >
            Tümü
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.map((e) => (
            <Link
              key={e.id}
              href="/etkinlikler"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDateTR(e.date)} · {e.location}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
