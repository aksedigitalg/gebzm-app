import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Phone, MessageCircle, Eye, Tag, User, Store, ChevronRight, ChevronLeft } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { formatTRY, timeAgoTR } from "@/lib/format";

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

  return (
    <>
      <div className="pb-36">
        {/* Fotoğraf galerisi — floating geri butonu */}
        <div className="relative">
          <Link href="/ilanlar"
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          {l.photos?.length > 0 ? (
            <PhotoGallery photos={l.photos} title={l.title} />
          ) : (
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <Tag className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
            </div>
          )}
        </div>

        <div className="space-y-4 px-5 pt-5">
          {/* Başlık & Fiyat */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg font-bold leading-tight">{l.title}</h1>
              {l.listing_type === "kurumsal" && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">PRO</span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">{formatTRY(l.price)}</p>
              {l.price_type !== "sabit" && (
                <span className="text-sm text-muted-foreground">
                  {l.price_type === "pazarlik" ? "• Pazarlık Var" : "• Takas Olur"}
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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

          {/* İşletme Profili (business_id varsa) */}
          {biz && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İlan Sahibi İşletme</h3>
              <Link href={`/hizmetler/${biz.id}`}
                className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition hover:bg-muted">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                  {biz.logo_url
                    ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                    : <Store className="h-5 w-5" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{biz.name}</p>
                  {biz.address && <p className="text-xs text-muted-foreground truncate">{biz.address}</p>}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </div>
          )}

          {/* Bireysel satıcı */}
          {!biz && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İlan Sahibi</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {l.listing_type === "kurumsal" ? <Store className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{l.listing_type === "kurumsal" ? "Kurumsal Satıcı" : "Bireysel Satıcı"}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString("tr-TR")} tarihinde yayınlandı</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-4 lg:left-[88px]">
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
