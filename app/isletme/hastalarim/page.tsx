"use client";

import { Search, Phone, Calendar, FileText, Plus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "E" | "K";
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
  totalVisits: number;
  tags: string[];
}

const patients: Patient[] = [
  { id: "p-1", name: "Ahmet Yılmaz", age: 42, gender: "E", phone: "+90 555 111 22 33", lastVisit: "Dün", nextAppointment: "Bugün 14:00", totalVisits: 12, tags: ["Diyabet", "Hipertansiyon"] },
  { id: "p-2", name: "Elif Kaya", age: 35, gender: "K", phone: "+90 532 444 55 66", lastVisit: "1 hafta önce", nextAppointment: "Bugün 15:30", totalVisits: 5, tags: ["Kontrol"] },
  { id: "p-3", name: "Mert Demir", age: 28, gender: "E", phone: "+90 543 777 88 99", lastVisit: "3 hafta önce", totalVisits: 2, tags: ["Yeni Hasta"] },
  { id: "p-4", name: "Zeynep Şahin", age: 54, gender: "K", phone: "+90 505 222 33 44", lastVisit: "1 ay önce", nextAppointment: "Yarın 13:00", totalVisits: 8, tags: ["Kronik Takip"] },
  { id: "p-5", name: "Can Aslan", age: 67, gender: "E", phone: "+90 533 666 77 88", lastVisit: "3 gün önce", totalVisits: 24, tags: ["Düzenli", "Yaşlı"] },
  { id: "p-6", name: "Berna Öztürk", age: 31, gender: "K", phone: "+90 544 999 00 11", lastVisit: "Dün", totalVisits: 1, tags: ["Yeni Hasta"] },
];

export default function Page() {
  const newPatients = patients.filter((p) => p.tags.includes("Yeni Hasta")).length;
  const todayAppointments = patients.filter((p) => p.nextAppointment?.includes("Bugün")).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hastalarım</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {patients.length} kayıtlı hasta · Bugün {todayAppointments} randevu · {newPatients} yeni
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Hasta
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Hasta ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {patients.map((p) => (
            <li key={p.id} className="flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {p.age} yaş · {p.gender === "E" ? "Erkek" : "Kadın"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3 w-3" />
                    {p.phone}
                  </a>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {p.totalVisits} ziyaret
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Son: {p.lastVisit}
                  </span>
                  {p.nextAppointment && (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Calendar className="h-3 w-3" />
                      Sonraki: {p.nextAppointment}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                Detay
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
