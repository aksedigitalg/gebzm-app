import Link from "next/link";
import {
  Map, Compass, Bus, PhoneCall,
  ChevronRight, Wrench, Scissors, Tag, MapPin, PartyPopper,
} from "lucide-react";
import { HomeHeader } from "@/components/HomeHeader";
import { AdSlider } from "@/components/AdSlider";
import { quickServices } from "@/data/home-sections";

export const revalidate = 30;

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const quickLinks = [
  { href: "/harita", label: "Harita", description: "Şehirdeki noktaları keşfet", icon: Map, color: "from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400" },
  { href: "/hizmetler", label: "Hizmetler", description: "Usta, kuaför, doktor", icon: Wrench, color: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
  { href: "/ilanlar", label: "İlanlar", description: "Emlak, araç, elektronik", icon: Tag, color: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400" },
  { href: "/ulasim", label: "Ulaşım", description: "Marmaray, otobüs, YHT", icon: Bus, color: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400" },
  { href: "/duraklar", label: "Gebze Haritası", description: "Park, eczane, hastane, durak ve daha fazlası", icon: MapPin, color: "from-sky-500/15 to-sky-500/5 text-sky-600 dark:text-sky-400" },
  { href: "/etkinlikler", label: "Etkinlikler", description: "Konser, tiyatro, sergi, festival", icon: PartyPopper, color: "from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400" },
  { href: "/acil", label: "Acil Numaralar", description: "Hızlı erişim", icon: PhoneCall, color: "from-red-500/15 to-red-500/5 text-red-600 dark:text-red-400" },
  { href: "/kategoriler", label: "Tüm Kategoriler", description: "Tüm hizmetleri keşfet", icon: Compass, color: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400" },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  restoran: { label: "Restoran",        color: "from-orange-500 to-red-600" },
  yemek:    { label: "Yemek Teslimat",  color: "from-rose-500 to-orange-500" },
  kafe:     { label: "Kafe & Pastane",  color: "from-amber-500 to-orange-600" },
  market:   { label: "Market",          color: "from-emerald-500 to-teal-600" },
  magaza:   { label: "Mağaza",          color: "from-sky-500 to-blue-600" },
  doktor:   { label: "Doktor & Klinik", color: "from-cyan-500 to-blue-600" },
  kuafor:   { label: "Kuaför & Berber", color: "from-pink-500 to-fuchsia-600" },
  usta:     { label: "Usta",            color: "from-amber-600 to-orange-700" },
  emlakci:  { label: "Emlakçı",         color: "from-blue-600 to-indigo-700" },
  galerici: { label: "Oto Galeri",      color: "from-slate-600 to-zinc-700" },
};

async function getRecentBusinesses() {
  try {
    const res = await fetch(`${API}/businesses`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return (await res.json()).slice(0, 4);
  } catch { return []; }
}

async function getRecentListings() {
  try {
    const res = await fetch(`${API}/listings`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return (await res.json()).slice(0, 4);
  } catch { return []; }
}

export default async function HomePage() {
  const [businesses, listings] = await Promise.all([
    getRecentBusinesses(),
    getRecentListings(),
  ]);

  return (
    <div className="pb-6">
      <div className="lg:hidden">
        <HomeHeader />
      </div>
      <div className="mt-5 space-y-7 px-5 lg:mt-4 lg:space-y-10 lg:px-0">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground shadow-lg lg:p-10">
          <div className="relative z-10 lg:max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest opacity-80">Hoş geldin</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight lg:text-4xl">Gebze&apos;yi keşfetmeye hazır mısın?</h2>
            <p className="mt-2 max-w-md text-sm opacity-90 lg:text-base">Hizmetler, ilanlar, harita ve daha fazlası — tek uygulamada.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/hizmetler" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25">
                <Wrench className="h-4 w-4" />Hizmetler
              </Link>
              <Link href="/harita" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90">
                <Map className="h-4 w-4" />Harita
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </section>

        <AdSlider placement="home-slider" />

        {/* Hızlı Erişim */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hızlı Erişim</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${link.color} p-4 transition hover:shadow-md`}>
                  <div className="flex items-start justify-between">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                    <ChevronRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground">{link.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Hızlı Servisler */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hızlı Servisler</h3>
          <div className="-mx-5 flex gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:pb-0">
            {quickServices.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link key={s.label} href={s.href}
                  className={`flex w-[72px] shrink-0 flex-col items-center gap-1.5 lg:w-auto ${i === 0 ? "ml-5 lg:ml-0" : ""} ${i === quickServices.length - 1 ? "mr-5 lg:mr-0" : ""}`}>
                  <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                    <Icon className={`h-6 w-6 ${s.color}`} strokeWidth={1.75} />
                  </div>
                  <span className="line-clamp-1 text-[11px] font-medium text-muted-foreground">{s.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Platformdaki İşletmeler */}
        {businesses.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">İşletmeler</h3>
              <Link href="/hizmetler" className="text-xs font-medium text-primary hover:underline">Tümünü gör</Link>
            </div>
            <div className="-mx-5 flex snap-x gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
              {businesses.map((b: { id: string; name: string; type: string; description: string; logo_url: string }) => {
                const cfg = typeConfig[b.type] || { label: b.type, color: "from-slate-500 to-gray-600" };
                return (
                  <Link key={b.id} href={["restoran","yemek","kafe"].includes(b.type) ? `/restoran/${b.id}` : `/hizmetler/${b.id}`}
                    className={`group flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md first:ml-5 last:mr-5 lg:w-auto lg:first:ml-0 lg:last:mr-0`}>
                    <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${cfg.color}`}>
                      {b.logo_url
                        ? <img src={b.logo_url} alt="" className="h-full w-full object-cover" />
                        : <Scissors className="h-10 w-10 text-white/70" strokeWidth={1.5} />
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate">{b.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{cfg.label}</p>
                      {b.description && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{b.description}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Son İlanlar */}
        {listings.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Son İlanlar</h3>
              <Link href="/ilanlar" className="text-xs font-medium text-primary hover:underline">Tümünü gör</Link>
            </div>
            <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {listings.map((l: { id: string; title: string; price: number; location: string; photos: string[] }) => (
                <Link key={l.id} href={`/ilanlar/${l.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-sm">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                    {l.photos?.[0]
                      ? <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                      : <Tag className="h-6 w-6 text-muted-foreground/50" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.title}</p>
                    <p className="text-xs font-bold text-primary">{l.price.toLocaleString("tr-TR")} ₺</p>
                    {l.location && <p className="text-[11px] text-muted-foreground truncate">{l.location}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
