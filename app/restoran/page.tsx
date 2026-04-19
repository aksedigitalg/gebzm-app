import Link from "next/link";
import { UtensilsCrossed, MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Restoran" };
export const revalidate = 30;

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Biz { id: string; name: string; type: string; address: string; description: string; logo_url: string; cover_url: string; }

async function getRestaurants() {
  try {
    const res = await fetch(`${API}/businesses?type=restoran`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return await res.json() as Biz[];
  } catch { return []; }
}

export default async function Page() {
  const restaurants = await getRestaurants();

  return (
    <>
      <PageHeader title="Restoranlar" subtitle="Yerinde yemek mekanları" back="/kategoriler" />
      <div className="px-5 pb-6 pt-4">
        <Link href="/isletme/kayit"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 transition hover:bg-primary/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Restoranınızı Ekleyin</p>
            <p className="text-xs text-muted-foreground">Ücretsiz başvurun, müşterilere ulaşın</p>
          </div>
        </Link>

        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold">Henüz restoran eklenmemiş</p>
            <p className="mt-1 text-xs text-muted-foreground">Restoranlar platforma katıldıkça burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
            {restaurants.map(r => (
              <Link key={r.id} href={`/restoran/${r.id}`}
                className="block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-500/40 to-red-600/40">
                  {(r.cover_url || r.logo_url) && (
                    <img src={r.cover_url || r.logo_url} alt={r.name} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{r.name}</p>
                  {r.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.description}</p>}
                  {r.address && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{r.address}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
