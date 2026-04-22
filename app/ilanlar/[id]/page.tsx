import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Phone, MessageCircle, Eye, Tag, User, Store, ChevronRight, Shield } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { formatTRY, timeAgoTR } from "@/lib/format";
import TabFocusRefresher from "@/components/TabFocusRefresher";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function getListing(id: string) {
  try {
    const res = await fetch(`${API}/listings/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getBusiness(id: string) {
  try {
    const res = await fetch(`${API}/businesses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function generateStaticParams() { return []; }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();

  const biz = l.business_id ? await getBusiness(l.business_id) : null;

  const SellerCard = () => (
    <div className="space-y-3">
      {/* Profil */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          İlan Sahibi
        </p>

        {biz ? (
          <Link href={`/hizmetler/${biz.id}`} className="group flex items-center gap-3 rounded-xl transition">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <Store className="h-6 w-6" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight group-hover:text-primary transition-colors">{biz.name}</p>
              {biz.address && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{biz.address}</span>
                </p>
              )}
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                Profili Gör <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {l.listing_type === "kurumsal" ? <Store className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold">
                {l.listing_type === "kurumsal" ? "Kurumsal Satıcı" : "Bireysel Satıcı"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(l.created_at).toLocaleDateString("tr-TR")} tarihinden beri üye
              </p>
            </div>
          </div>
        )}

        {/* Güven rozeti */}
        <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          Gebzem üzerinden güvenli iletişim
        </div>
      </div>

      {/* CTA — sadece desktop sağ panelde */}
      <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <MessageCircle className="h-4 w-4" />
          Mesaj Gönder
        </button>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-semibold transition hover:bg-muted">
          <Phone className="h-4 w-4" />
          Ara
        </button>
      </div>

      {/* İlan meta */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-sm">
        {l.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {l.location}
          </div>
        )}
        {l.created_at && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            {timeAgoTR(l.created_at)}
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4 shrink-0 text-primary" />
          {l.views} görüntülenme
        </div>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-primary" />
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">{l.category}</span>
          {l.price_type !== "sabit" && (
            <span className="text-xs text-muted-foreground">
              {l.price_type === "pazarlik" ? "Pazarlık Var" : "Takas Olur"}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TabFocusRefresher />

      <div className="mx-auto max-w-6xl pb-36 lg:pb-10">
        {/* Desktop: 2 kolon — Mobil: tek kolon */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start lg:px-5 lg:pt-6">

          {/* SOL — %70 içerik */}
          <div className="min-w-0">
            {/* Fotoğraf galerisi */}
            <div className="overflow-hidden lg:rounded-2xl">
              {l.photos?.length > 0 ? (
                <PhotoGallery photos={l.photos} title={l.title} />
              ) : (
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 lg:h-80">
                  <Tag className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
                </div>
              )}
            </div>

            <div className="space-y-4 px-5 pt-5 lg:px-0">
              {/* Başlık & Fiyat */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-lg font-bold leading-tight lg:text-xl">{l.title}</h1>
                  {l.listing_type === "kurumsal" && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">PRO</span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-primary lg:text-3xl">{formatTRY(l.price)}</p>
              </div>

              {/* Mobil meta — desktop'ta sağ panelde */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground lg:hidden">
                {l.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{l.location}</span>}
                {l.created_at && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgoTR(l.created_at)}</span>}
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{l.views} görüntülenme</span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize">{l.category}</span>
              </div>

              {/* Açıklama */}
              {l.description && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Açıklama</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{l.description}</p>
                </div>
              )}

              {/* Özellikler */}
              {l.attributes && Object.keys(l.attributes).length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İlan Özellikleri</h3>
                  <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                    {Object.entries(l.attributes as Record<string, string>).map(([k, v]) => v && (
                      <div key={k} className="flex flex-col">
                        <dt className="text-[11px] text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                        <dd className="font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Mobil profil kartı — desktop'ta sağ panelde */}
              <div className="lg:hidden">
                <SellerCard />
              </div>
            </div>
          </div>

          {/* SAĞ — sticky profil (sadece desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <SellerCard />
            </div>
          </div>
        </div>
      </div>

      {/* Mobil fixed CTA (desktop'ta sağ panelde var) */}
      <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-4 lg:hidden">
        <div className="flex w-full max-w-md gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
            <MessageCircle className="h-4 w-4" />Mesaj Gönder
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold">
            <Phone className="h-4 w-4" />Ara
          </button>
        </div>
      </div>
    </>
  );
}
