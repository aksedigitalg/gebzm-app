"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Tag, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { formatTRY } from "@/lib/format";

interface Listing {
  id: string;
  title: string;
  category: string;
  sub_category: string;
  price: number;
  currency: string;
  location: string;
  status: string;
  photos: string[];
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  emlak: "Emlak", vasita: "Vasıta", elektronik: "Elektronik",
  "ev-yasam": "Ev & Yaşam", moda: "Moda", "is-makineleri": "İş Makineleri",
};

export default function IlanlarimPage() {
  const [list, setList] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.user.getMyListings().then(data => {
      setList(data as Listing[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deleteListing = async (id: string) => {
    if (!confirm("İlanı silmek istediğinizden emin misiniz?")) return;
    try {
      await api.user.deleteListing(id);
      setList(prev => prev.filter(l => l.id !== id));
    } catch { alert("Silme başarısız"); }
  };

  return (
    <>
      <PageHeader title="İlanlarım" back="/profil" />
      <div className="px-5 pb-6 pt-4">
        <Link href="/ilanlar/yeni"
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />Yeni İlan Ver
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Tag className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold">Henüz ilanınız yok</p>
            <p className="mt-1 text-xs text-muted-foreground">İlk ilanınızı hemen verin!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(l => (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  {l.photos.length > 0 ? (
                    <img src={l.photos[0]} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Tag className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {categoryLabels[l.category] || l.category}{l.sub_category ? ` · ${l.sub_category}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      {formatTRY(l.price)}
                    </p>
                    {l.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{l.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/ilanlar/yeni?edit=${l.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background py-2 text-xs font-semibold transition hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />Düzenle
                  </Link>
                  <button onClick={() => deleteListing(l.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50/50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100/50 dark:border-red-900/40 dark:bg-red-950/20">
                    <Trash2 className="h-3.5 w-3.5" />Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
