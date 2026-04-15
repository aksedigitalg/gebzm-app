import { notFound } from "next/navigation";
import { MapPin, Clock, Image as ImageIcon, Heart, Share2, Phone, MessageCircle, User, Store } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { classifieds } from "@/data/classifieds";
import { formatTRY, timeAgoTR } from "@/lib/format";

export async function generateStaticParams() {
  return classifieds.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = classifieds.find((x) => x.id === id);
  return { title: c?.title ?? "İlan" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = classifieds.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <>
      <PageHeader title="İlan Detayı" subtitle={c.subCategory} back="/ilanlar" />
      <div className="pb-32">
        {/* Fotoğraf galerisi (placeholder) */}
        <div
          className={`relative h-56 bg-gradient-to-br ${c.coverGradient}`}
        >
          <ImageIcon className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white/40" strokeWidth={1.25} />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {c.photoCount} foto
          </span>
          <button
            type="button"
            aria-label="Favorilere ekle"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Paylaş"
            className="absolute right-3 top-[56px] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-5">
          {/* Başlık + fiyat */}
          <p className="text-base font-semibold leading-snug">{c.title}</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatTRY(c.price)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {c.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgoTR(c.date)}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              İlan No: {c.id}
            </span>
          </div>

          {/* Açıklama */}
          <section className="mt-5 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Açıklama
            </h3>
            <p className="text-sm leading-relaxed">{c.description}</p>
          </section>

          {/* Özellikler */}
          <section className="mt-3 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              İlan Özellikleri
            </h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {Object.entries(c.features).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Satıcı */}
          <section className="mt-3 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              İlan Sahibi
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {c.seller.type === "store" ? (
                  <Store className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {c.seller.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {c.seller.type === "store" ? "Kurumsal" : "Sahibinden"} · Üye {c.seller.memberSince}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CTA bar */}
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <div className="mx-auto flex max-w-[600px] gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Mesaj Gönder
          </button>
          {c.seller.phone && (
            <a
              href={`tel:${c.seller.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold shadow-lg transition hover:bg-muted"
            >
              <Phone className="h-4 w-4" />
              Ara
            </a>
          )}
        </div>
      </div>
    </>
  );
}
