"use client";

import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { places, categoryLabels } from "@/data/places";
import { getAllServiceTypes, serviceTitles, getServicePoints } from "@/data/services";

export default function Page() {
  const serviceTypes = getAllServiceTypes();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mekanlar (POI)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Haritadaki tüm noktalar · Hızlı servisler ve gezilecek yerler
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Nokta
        </button>
      </header>

      {/* Hızlı servisler */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Hızlı Servisler
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceTypes.map((t) => {
            const points = getServicePoints(t) ?? [];
            return (
              <Link
                key={t}
                href={`/harita?servis=${t}`}
                target="_blank"
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold">{serviceTitles[t]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {points.length} nokta
                  </p>
                </div>
                <MapPin className="h-5 w-5 text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Gezilecek yerler */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Gezilecek Yerler ({places.length})
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Yer</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Adres</th>
                <th className="px-4 py-3 font-medium">Koordinat</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {places.map((p) => (
                <tr key={p.slug} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabels[p.category]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.address}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {p.coordinates[0].toFixed(4)}, {p.coordinates[1].toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
