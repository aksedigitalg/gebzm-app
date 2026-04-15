"use client";

import { Search, Filter, MoreVertical } from "lucide-react";

interface User {
  id: string;
  name: string;
  phone: string;
  joined: string;
  orders: number;
  status: "active" | "inactive" | "blocked";
}

const users: User[] = [
  { id: "u-1", name: "Ahmet Yılmaz", phone: "+90 555 111 22 33", joined: "2026-04-12", orders: 8, status: "active" },
  { id: "u-2", name: "Elif Kaya", phone: "+90 532 444 55 66", joined: "2026-04-11", orders: 14, status: "active" },
  { id: "u-3", name: "Mert Demir", phone: "+90 543 777 88 99", joined: "2026-04-10", orders: 3, status: "active" },
  { id: "u-4", name: "Zeynep Şahin", phone: "+90 505 222 33 44", joined: "2026-04-09", orders: 22, status: "active" },
  { id: "u-5", name: "Can Aslan", phone: "+90 533 666 77 88", joined: "2026-04-08", orders: 0, status: "inactive" },
  { id: "u-6", name: "Berna Öztürk", phone: "+90 544 999 00 11", joined: "2026-04-07", orders: 45, status: "active" },
  { id: "u-7", name: "Emre Koç", phone: "+90 536 888 99 00", joined: "2026-04-06", orders: 5, status: "active" },
  { id: "u-8", name: "Deniz Aydın", phone: "+90 541 333 44 55", joined: "2026-04-05", orders: 0, status: "blocked" },
  { id: "u-9", name: "Seda Çelik", phone: "+90 534 111 44 77", joined: "2026-04-04", orders: 11, status: "active" },
  { id: "u-10", name: "Kerem Tan", phone: "+90 542 222 55 88", joined: "2026-04-03", orders: 7, status: "active" },
];

const statusStyles: Record<User["status"], { label: string; class: string }> = {
  active: { label: "Aktif", class: "bg-emerald-500/10 text-emerald-600" },
  inactive: { label: "Pasif", class: "bg-slate-500/10 text-slate-600" },
  blocked: { label: "Engelli", class: "bg-red-500/10 text-red-600" },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toplam 12.480 kullanıcı · 37 bu hafta katıldı
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filtrele
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Kullanıcı</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Katıldı</th>
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{u.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.joined).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{u.orders}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[u.status].class}`}>
                      {statusStyles[u.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="Menü">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
