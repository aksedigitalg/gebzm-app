"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAdminSession } from "@/lib/panel-auth";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function Page() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    api.admin.getUsers(t).then((data) => {
      setList(data as User[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = async (id: string, current: boolean) => {
    try {
      await api.admin.toggleUser(id, !current, token);
      setList((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !current } : u));
    } catch { alert("İşlem başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toplam {list.length} kullanıcı
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Kullanıcı</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Kayıt</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name || "İsimsiz"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.phone}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                    {u.is_active ? "Aktif" : "Engelli"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(u.id, u.is_active)}
                    className={`text-xs hover:underline ${u.is_active ? "text-red-500" : "text-emerald-600"}`}>
                    {u.is_active ? "Engelle" : "Aktif Et"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Henüz kullanıcı kaydı yok.</div>
        )}
      </div>
    </div>
  );
}
