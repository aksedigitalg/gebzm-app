import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Clock, Phone, MessageCircle, Eye, Tag,
  User, Store, ChevronRight, Shield
} from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { formatTRY, timeAgoTR } from "@/lib/format";
import TabFocusRefresher from "@/components/TabFocusRefresher";
import { DarkPageEffect } from "@/components/DarkPageEffect";

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
          <Link href={`/hizmetler/${biz.id}`} className="group flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <Store className="h-6 w-6" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{biz.name}</p>
              {biz.address && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="h-3 w-3 shrink-0" />{biz.address}
                </p>
              )}
              <p className="mt-1 text-xs font-medium text-primary">Profili Gör</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              {l.listing_type === "kurumsal" ? <Store className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {l.listing_type === "kurumsal" ? "Kurumsal Satıcı" : "Bireysel Satıcı"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleDateString("tr-TR")} tarihinde yayınlandı
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
          <Shield className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <span className="text-xs text-muted-foreground">Gebzem üzerinden güvenli iletişim</span>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90">
          <MessageCircle className="h-4 w-4" />
          Mesaj Gönder
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted">
          <Phone className="h-4 w-4" />
          Telefonu Gör
        </button>
      </div>

      {/* İlan detayları */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="divide-y divide-border">
          {l.location && (
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{l.location}</span>
            </div>
          )}
          {l.created_at && (
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{timeAgoTR(l.created_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 py-2.5 text-sm">
            <Eye className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{l.views} görüntülenme</span>
          </div>
          <div className="flex items-center gap-3 py-2.5">
            <Tag className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">{l.category}</span>
              {l.price_type !== "sabit" && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {l.price_type === "pazarlik" ? "Pazarlık Var" : "Takas Olur"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DarkPageEffect />
      <TabFocusRefresher />

      <div className="lg:-mx-6 lg:-mt-4">
        <div className="mx-auto max-w-6xl pb-36 lg:pb-20 lg:px-6">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8 lg:pt-6">

            {/* SOL */}
            <div className="min-w-0">
              <div className="overflow-hidden lg:rounded-2xl">
                {l.photos?.length > 0 ? (
                  <PhotoGallery photos={l.photos} title={l.title} />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-muted lg:h-96">
                    <Tag className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
                  </div>
                )}
              </div>

              <div className="space-y-4 px-5 pt-5 lg:px-0">

                {/* Başlık & Fiyat */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-xl font-bold leading-snug text-foreground lg:text-2xl">{l.title}</h1>
                    {l.listing_type === "kurumsal" && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">PRO</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="text-3xl font-bold text-primary lg:text-4xl">{formatTRY(l.price)}</p>
                    {l.price_type !== "sabit" && (
                      <span className="text-sm text-muted-foreground">
                        {l.price_type === "pazarlik" ? "Pazarlık Var" : "Takas Olur"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobil meta */}
                <div className="flex flex-wrap gap-2 lg:hidden">
                  {l.location && (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" />{l.location}
                    </span>
                  )}
                  {l.created_at && (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 text-primary" />{timeAgoTR(l.created_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3 text-primary" />{l.views} görüntülenme
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground capitalize">{l.category}</span>
                </div>

                {/* Açıklama */}
                {l.description && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Açıklama</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{l.description}</p>
                  </div>
                )}

                {/* Özellikler */}
                {l.attributes && Object.keys(l.attributes).length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İlan Özellikleri</p>
                    <div className="divide-y divide-border">
                      {Object.entries(l.attributes as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between py-3">
                          <span className="text-sm text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                          <span className="text-sm font-semibold text-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobil profil */}
                <div className="lg:hidden">
                  <SellerCard />
                </div>
              </div>
            </div>

            {/* SAĞ sticky */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <SellerCard />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobil fixed CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-5 pt-3 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground">
            <MessageCircle className="h-4 w-4" />Mesaj Gönder
          </button>
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground">
            <Phone className="h-4 w-4" />Ara
          </button>
        </div>
      </div>
    </>
  );
}
