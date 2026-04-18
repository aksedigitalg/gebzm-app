import { Tag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { marketCampaigns } from "@/data/market";

export default function KampanyalarPage() {
  return (
    <>
      <PageHeader title="Kampanyalar" subtitle="Güncel fırsatlar ve indirimler" />
      <div className="px-5 pb-6 pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketCampaigns.map((c) => (
            <div
              key={c.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-5 text-white shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                  <p className="mt-1 text-sm opacity-90">{c.subtitle}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-white/20 p-2">
                  <Tag className="h-5 w-5" />
                </div>
              </div>
              <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                {c.cta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
