import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { MapPin, Phone, Scissors } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BusinessActions } from "@/components/BusinessActions";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const typeConfig: Record<string, { label: string; bookingLabel: string; color: string }> = {
  kuafor: { label: "Kuaför", bookingLabel: "Randevu Al", color: "from-pink-500 to-rose-600" },
  usta:   { label: "Usta",   bookingLabel: "Talep Gönder", color: "from-blue-500 to-indigo-600" },
  doktor: { label: "Doktor", bookingLabel: "Randevu Al", color: "from-emerald-500 to-teal-600" },
};

async function getBusiness(id: string) {
  try {
    // Direkt ID ile çek — cache yok
    const res = await fetch(`${API}/businesses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) notFound();

  const cfg = typeConfig[biz.type] || { label: biz.type, bookingLabel: "Randevu Al", color: "from-slate-500 to-gray-600" };

  return (
    <>
      <PageHeader title={biz.name} subtitle={cfg.label} back="/hizmetler" />
      <div className="pb-36">
        {/* Kapak */}
        <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${cfg.color}`}>
          {biz.cover_url && <img src={biz.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
        </div>

        <div className="px-5 pt-5 space-y-4">
          {/* Başlık */}
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.color} text-white overflow-hidden`}>
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <Scissors className="h-7 w-7" strokeWidth={1.75} />
              }
            </div>
            <div>
              <h1 className="text-lg font-bold">{biz.name}</h1>
              <span className={`inline-block rounded-full bg-gradient-to-br ${cfg.color} px-2.5 py-0.5 text-[11px] font-bold text-white`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Açıklama */}
          {biz.description && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hakkında</h3>
              <p className="text-sm leading-relaxed">{biz.description}</p>
            </div>
          )}

          {/* İletişim */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İletişim</h3>
            {biz.address && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />{biz.address}
              </p>
            )}
            {biz.phone && (
              <a href={`tel:${biz.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Phone className="h-4 w-4 shrink-0" />{biz.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <BusinessActions
        businessName={biz.name}
        businessType="Kuaför"
        bookingLabel={cfg.bookingLabel}
        businessId={biz.id}
      />
    </>
  );
}
