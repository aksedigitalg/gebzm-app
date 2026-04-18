"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";

interface Listing { id: string; title: string; category: string; price: number; location: string; }

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

export default function Page() {
  const [list, setList] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/listings`)
      .then(r => r.json()).then(d => { setList(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kullanıcı İlanları</h1>
        <p className="mt-1 text-sm text-muted-foreground">{list.length} ilan</p>
      </header>
      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Tag className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold">Henüz ilan yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Başlık</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fiyat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Konum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((l) => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{l.category}</td>
                  <td className="px-4 py-3 text-xs">{l.price.toLocaleString("tr-TR")} ₺</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
