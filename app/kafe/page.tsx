import Link from "next/link";
import { Coffee, MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const revalidate = 30;

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Biz { id: string; name: string; type: string; description: string; logo_url: string; address: string; }

async function getBusinesses(): Promise<Biz[]> {
  try {
    const res = await fetch(`${API}/businesses`, { next: { revalidate: 30 } });
    const all: Biz[] = await res.json();
    return all.filter((b: { type: string }) => b.type === "kafe");
  } catch { return []; }
}

export default async function Page() {
  const businesses = await getBusinesses();
  return (
    <>
      <PageHeader title="Kafe & Pastane" subtitle="Kahve, tatlı, hafif yemek" back="/kategoriler" />
      <div className="px-5 pb-6 pt-4">
        <Link href="/isletme/kayit"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 transition hover:bg-primary/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">İşletmenizi Ekleyin</p>
            <p className="text-xs text-muted-foreground">Gebzem'de yerinizi alın — ücretsiz</p>
          </div>
        </Link>
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Coffee className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold">Henüz kafe eklenmemiş</p>
            <p className="mt-1 text-xs text-muted-foreground">Kafeler platforma katıldıkça burada listelenecek.</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {businesses.map((b) => (
              <Link key={b.id} href={`/restoran/${b.id}`}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden">
                  {b.logo_url
                    ? <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover" />
                    : <Coffee className="h-7 w-7" strokeWidth={1.75} />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <span className="shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">Kafe</span>
                  </div>
                  {b.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>}
                  {b.address && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />{b.address}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
