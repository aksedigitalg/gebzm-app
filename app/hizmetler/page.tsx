import { Wrench, Scissors, Stethoscope, MapPin } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Hizmetler" };
export const revalidate = 60;

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

const typeConfig: Record<string, { label: string; color: string }> = {
  kuafor: { label: "Kuaför", color: "from-pink-500 to-rose-600" },
  usta:   { label: "Usta",   color: "from-blue-500 to-indigo-600" },
  doktor: { label: "Doktor", color: "from-emerald-500 to-teal-600" },
};

interface Biz { id: string; name: string; type: string; phone: string; address: string; description: string; logo_url: string; }

async function getProviders(): Promise<Biz[]> {
  try {
    const res = await fetch(`${API}/businesses`, { next: { revalidate: 60 } });
    const all: Biz[] = await res.json();
    return all.filter((b) => ["kuafor", "usta", "doktor"].includes(b.type));
  } catch { return []; }
}

export default async function Page() {
  const providers = await getProviders();

  return (
    <>
      <PageHeader title="Hizmetler" subtitle="Usta, kuaför, doktor ve daha fazlası" back="/kategoriler" />
      <div className="px-5 pb-6 pt-4">
        {providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold">Henüz hizmet sağlayıcı eklenmemiş</p>
            <p className="mt-1 text-xs text-muted-foreground">Hizmet sağlayıcılar platforma katıldıkça burada listelenecek.</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {providers.map((p) => {
              const cfg = typeConfig[p.type] || { label: p.type, color: "from-slate-500 to-gray-600" };
              return (
                <Link key={p.id} href={`/hizmetler/${p.id}`}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.color} text-white overflow-hidden`}>
                    {p.logo_url
                      ? <img src={p.logo_url} alt={p.name} className="h-full w-full object-cover" />
                      : <Scissors className="h-7 w-7" strokeWidth={1.75} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <span className={`shrink-0 rounded-full bg-gradient-to-br ${cfg.color} px-2 py-0.5 text-[10px] font-bold text-white`}>
                        {cfg.label}
                      </span>
                    </div>
                    {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                    {p.address && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />{p.address}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
