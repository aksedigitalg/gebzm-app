import { notFound } from "next/navigation";
import { Star, ShieldCheck, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { serviceProviders } from "@/data/providers";
import { BusinessActions } from "@/components/BusinessActions";

const serviceMenus: Record<string, { id: string; label: string; duration?: string }[]> = {
  kuafor: [
    { id: "kesim", label: "Saç Kesimi", duration: "45 dk" },
    { id: "boya", label: "Saç Boyama", duration: "2 saat" },
    { id: "fon", label: "Fön & Şekillendirme", duration: "45 dk" },
    { id: "makyaj", label: "Makyaj", duration: "1 saat" },
  ],
  tesisatci: [
    { id: "tikanikik", label: "Tıkanıklık Açma", duration: "~1 saat" },
    { id: "armatur", label: "Armatür Değişimi", duration: "~45 dk" },
    { id: "kacak", label: "Su Kaçağı Tespiti", duration: "1-2 saat" },
  ],
  elektrikci: [
    { id: "elektrik-ariza", label: "Genel Arıza", duration: "~1 saat" },
    { id: "led-montaj", label: "LED Montaj", duration: "~30 dk" },
    { id: "sigorta", label: "Sigorta Değişimi", duration: "~30 dk" },
  ],
  temizlik: [
    { id: "ev-temizlik", label: "Ev Temizliği (Genel)", duration: "4 saat" },
    { id: "ofis-temizlik", label: "Ofis Temizliği", duration: "3 saat" },
    { id: "insaat", label: "İnşaat Sonrası", duration: "6 saat" },
  ],
  nakliye: [
    { id: "ev-tasima", label: "Ev Taşıma", duration: "1 gün" },
    { id: "parca", label: "Parça Taşıma" },
  ],
  boyaci: [
    { id: "ic-boya", label: "İç Mekan Boyama" },
    { id: "dis-boya", label: "Dış Cephe Boyama" },
  ],
  klima: [
    { id: "montaj", label: "Klima Montajı", duration: "2 saat" },
    { id: "bakim", label: "Klima Bakımı", duration: "1 saat" },
    { id: "gaz", label: "Gaz Dolumu", duration: "1 saat" },
  ],
  bahce: [
    { id: "cim", label: "Çim Bakımı" },
    { id: "peyzaj", label: "Peyzaj Düzenleme" },
  ],
  doktor: [
    { id: "muayene", label: "İlk Muayene", duration: "30 dk" },
    { id: "kontrol", label: "Kontrol", duration: "15 dk" },
    { id: "online", label: "Online Görüşme", duration: "20 dk" },
  ],
};

export async function generateStaticParams() {
  return serviceProviders.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = serviceProviders.find((x) => x.slug === slug);
  return { title: p?.name ?? "Hizmet Sağlayıcı" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = serviceProviders.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} subtitle={p.categoryLabel} back="/hizmetler" />
      <div className="px-5 pb-32 pt-5">
        {/* Profil başlığı */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-primary-foreground">
            {p.photo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold">{p.name}</p>
              {p.verified && (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {p.categoryLabel}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                <Star className="h-3 w-3 fill-current" />
                {p.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {p.reviewCount} değerlendirme
              </span>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Tamamlanan" value={p.completedJobs.toLocaleString("tr")} />
          <Stat label="Yanıt Süresi" value={p.responseTime} />
          <Stat label="Fiyat" value={p.priceRange} />
        </div>

        {/* Açıklama */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hakkında
          </h3>
          <p className="text-sm leading-relaxed">{p.description}</p>
        </section>

        {/* Özellikler */}
        <section className="mt-3 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Özellikler
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {p.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* Ek bilgi */}
        <section className="mt-3 space-y-2">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Hizmet Bölgesi
              </p>
              <p className="text-sm">{p.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ortalama Yanıt
              </p>
              <p className="text-sm">{p.responseTime}</p>
            </div>
          </div>
        </section>
      </div>

      <BusinessActions
        businessName={p.name}
        businessType={p.categoryLabel === "Kuaför" ? "Kuaför" : "Hizmet"}
        bookingLabel="Randevu Al"
        services={serviceMenus[p.category]}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
