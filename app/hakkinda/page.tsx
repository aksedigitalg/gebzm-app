import { PageHeader } from "@/components/PageHeader";
import { Info, Code2, Sparkles } from "lucide-react";

export const metadata = { title: "Hakkında" };

export default function Page() {
  return (
    <>
      <PageHeader title="Hakkında" back="/menu" />
      <div className="space-y-4 px-5 pb-10 pt-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Gebzem</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Gebze&apos;yi keşfetmek isteyenler için hazırlanmış bir şehir rehberi
            prototipidir. Tarihi mekanlar, etkinlikler, ulaşım bilgileri ve acil
            numaralar tek uygulamada toplanmıştır.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Teknoloji</h3>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Next.js 15 (React)</li>
            <li>• TypeScript + Tailwind CSS</li>
            <li>• Leaflet (OpenStreetMap)</li>
            <li>• PWA desteği</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Versiyon</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            v0.1 — Prototip sürümü. Veriler statik örnek içerikten oluşur.
          </p>
        </section>
      </div>
    </>
  );
}
