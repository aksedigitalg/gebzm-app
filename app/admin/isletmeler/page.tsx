"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminSession } from "@/lib/panel-auth";

interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

const typeLabel: Record<string, string> = {
  restoran: "Restoran", yemek: "Yemek", kafe: "Kafe", market: "Market",
  magaza: "Mağaza", doktor: "Doktor", kuafor: "Kuaför", usta: "Usta",
  emlakci: "Emlakçı", galerici: "Galerici",
};

export default function Page() {
  const [list, setList] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    api.admin.getBusinesses(t).then((data) => {
      setList(data as Business[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const approve = async (id: string, val: boolean) => {
    try {
      await api.admin.approveBusiness(id, val, token);
      setList((prev) => prev.map((b) => b.id === id ? { ...b, is_approved: val, is_active: val } : b));
    } catch { alert("İşlem başarısız"); }
  };

  const pending = list.filter((b) => !b.is_approved);
  const approved = list.filter((b) => b.is_approved);

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İşletmeler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length} onay bekliyor · {approved.length} aktif
        </p>
      </header>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-amber-600">Onay Bekleyenler</h2>
          <div className="space-y-2">
            {pending.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{typeLabel[b.type] || b.type} · {b.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(b.id, true)}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5" />Onayla
                  </button>
                  <button onClick={() => approve(b.id, false)}
                    className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20">
                    <X className="h-3.5 w-3.5" />Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tüm İşletmeler</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">İşletme</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tür</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{typeLabel[b.type] || b.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.is_approved ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {b.is_approved ? "Aktif" : "Onay Bekliyor"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.is_approved ? (
                      <button onClick={() => approve(b.id, false)} className="text-xs text-red-500 hover:underline">Askıya Al</button>
                    ) : (
                      <button onClick={() => approve(b.id, true)} className="text-xs text-emerald-600 hover:underline">Onayla</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Henüz işletme kaydı yok.</div>
          )}
        </div>
      </section>
    </div>
  );
}
