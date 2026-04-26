import { notFound } from "next/navigation";
import { Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { InteractiveOrderMenu } from "@/components/InteractiveOrderMenu";

export const dynamic = "force-dynamic";

const API =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/v1";

async function getData(id: string) {
  try {
    const [biz, menu, delivery] = await Promise.all([
      fetch(`${API}/businesses/${id}`, { cache: "no-store" }).then(r =>
        r.ok ? r.json() : null
      ),
      fetch(`${API}/businesses/${id}/menu`, { cache: "no-store" }).then(r =>
        r.ok ? r.json() : { categories: [], items: [] }
      ),
      // Teslimat ayarları opsiyonel — backend hazır değilse undefined döner
      fetch(`${API}/businesses/${id}/delivery`, { cache: "no-store" })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);
    return { biz, menu, delivery };
  } catch {
    return { biz: null, menu: { categories: [], items: [] }, delivery: null };
  }
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  restoran: { label: "Restoran", color: "from-orange-500 to-red-600" },
  yemek: { label: "Yemek Teslimat", color: "from-rose-500 to-orange-500" },
  kafe: { label: "Kafe & Pastane", color: "from-amber-500 to-orange-600" },
  market: { label: "Market", color: "from-emerald-500 to-teal-600" },
  magaza: { label: "Mağaza", color: "from-sky-500 to-blue-600" },
};

const FOOD_TYPES = new Set(["restoran", "yemek", "kafe"]);

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { biz, menu, delivery } = await getData(id);
  if (!biz) notFound();

  const cfg = TYPE_CONFIG[biz.type] || { label: biz.type, color: "from-slate-500 to-gray-600" };
  // Geri butonu: yemek için /restoran/[id], market/mağaza için /hizmetler/[slug]
  const back = FOOD_TYPES.has(biz.type)
    ? `/restoran/${id}`
    : `/hizmetler/${biz.slug || id}`;

  return (
    <>
      <PageHeader
        title={`${biz.name} · Sipariş`}
        subtitle={cfg.label}
        back={back}
      />
      <div className="px-5 pb-32 pt-4">
        {/* Üstte özet kart */}
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${cfg.color} text-white`}
          >
            {biz.logo_url ? (
              <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UtensilsCrossed className="h-6 w-6" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{biz.name}</p>
            {delivery && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {delivery.estimated_delivery_min && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />~{delivery.estimated_delivery_min} dk
                  </span>
                )}
                {delivery.delivery_fee != null && (
                  <span>
                    Teslimat:{" "}
                    {Number(delivery.delivery_fee) === 0
                      ? "Ücretsiz"
                      : `${Number(delivery.delivery_fee).toLocaleString("tr-TR")} ₺`}
                  </span>
                )}
                {delivery.min_order_amount > 0 && (
                  <span>Min: {Number(delivery.min_order_amount).toLocaleString("tr-TR")} ₺</span>
                )}
              </div>
            )}
            {biz.address && (
              <p className="mt-1 flex items-start gap-1 truncate text-[11px] text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="truncate">{biz.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* İnteraktif menü */}
        <InteractiveOrderMenu
          business={{ id: biz.id, name: biz.name, type: biz.type }}
          menu={menu}
          delivery={delivery}
        />
      </div>
    </>
  );
}
