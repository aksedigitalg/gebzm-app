"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  MapPin,
  Calendar,
  Utensils,
  Phone,
  Landmark,
} from "lucide-react";
import { places, categoryLabels } from "@/data/places";
import { events } from "@/data/events";
import { guideItems, guideCategoryLabels } from "@/data/guide";
import { emergencyContacts } from "@/data/emergency";

type Hit =
  | { kind: "place"; slug: string; title: string; subtitle: string }
  | { kind: "event"; id: string; title: string; subtitle: string }
  | { kind: "guide"; id: string; title: string; subtitle: string }
  | { kind: "emergency"; id: string; title: string; subtitle: string }
  | { kind: "listing"; id: string; title: string; subtitle: string };

function search(q: string): Hit[] {
  const s = q.trim().toLocaleLowerCase("tr");
  if (!s) return [];

  const results: Hit[] = [];

  for (const p of places) {
    if (
      p.name.toLocaleLowerCase("tr").includes(s) ||
      p.address.toLocaleLowerCase("tr").includes(s) ||
      p.shortDescription.toLocaleLowerCase("tr").includes(s)
    ) {
      results.push({
        kind: "place",
        slug: p.slug,
        title: p.name,
        subtitle: `Gezilecek · ${categoryLabels[p.category]}`,
      });
    }
  }

  for (const e of events) {
    if (
      e.title.toLocaleLowerCase("tr").includes(s) ||
      e.location.toLocaleLowerCase("tr").includes(s)
    ) {
      results.push({
        kind: "event",
        id: e.id,
        title: e.title,
        subtitle: `Etkinlik · ${e.location}`,
      });
    }
  }

  for (const g of guideItems) {
    if (
      g.name.toLocaleLowerCase("tr").includes(s) ||
      g.address.toLocaleLowerCase("tr").includes(s)
    ) {
      results.push({
        kind: "guide",
        id: g.id,
        title: g.name,
        subtitle: `Rehber · ${guideCategoryLabels[g.category]}`,
      });
    }
  }

  for (const c of emergencyContacts) {
    if (c.name.toLocaleLowerCase("tr").includes(s)) {
      results.push({
        kind: "emergency",
        id: c.id,
        title: c.name,
        subtitle: `Acil · ${c.phone}`,
      });
    }
  }

  return results.slice(0, 20);
}

const quickCategories = [
  { label: "Tarihi", href: "/gezilecek?kategori=tarihi" },
  { label: "Doğa", href: "/gezilecek?kategori=doga" },
  { label: "Restoran", href: "/rehber?kategori=restoran" },
  { label: "Kafe", href: "/rehber?kategori=kafe" },
  { label: "Etkinlikler", href: "/etkinlikler" },
  { label: "Acil", href: "/acil" },
];

function iconFor(kind: Hit["kind"]) {
  switch (kind) {
    case "place":
      return Landmark;
    case "event":
      return Calendar;
    case "guide":
      return Utensils;
    case "emergency":
      return Phone;
    case "listing":
      return Search;
  }
}

function hrefFor(hit: Hit): string {
  switch (hit.kind) {
    case "place":
      return `/gezilecek/${hit.slug}`;
    case "event":
      return "/etkinlikler";
    case "guide":
      return "/rehber";
    case "emergency":
      return "/acil";
    case "listing":
      return `/ilanlar/${hit.id}`;
  }
}

export function SearchSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => search(q), [q]);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragCaptured = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQ("");
      setDragY(0);
      dragStartY.current = null;
      dragCaptured.current = false;
    }
  }, [isOpen]);

  // iOS Maps tarzı: her yerden sürükle, içerik scroll edilebiliyorsa native scroll'a izin ver
  const onPointerDown = (e: React.PointerEvent) => {
    // Input/button gibi interaktif elementlerden başlatma
    const target = e.target as HTMLElement;
    if (target.closest("input, button, a, textarea")) return;
    dragStartY.current = e.clientY;
    dragCaptured.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current == null) return;
    const delta = e.clientY - dragStartY.current;

    if (delta <= 0) return; // sadece aşağı sürükleme

    // Scroll alanında mı? scrollTop > 0 ise native scroll yap, sheet'i hareket ettirme
    const content = contentRef.current;
    const target = e.target as HTMLElement;
    const inContent = content?.contains(target) ?? false;
    if (inContent && content && content.scrollTop > 0 && !dragCaptured.current) {
      // Native scroll çalışsın
      dragStartY.current = null;
      return;
    }

    // Pointer'ı yakala → native scroll'u durdur
    if (!dragCaptured.current) {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      dragCaptured.current = true;
    }
    setDragY(delta);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragCaptured.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (dragY > 120) onClose();
    setDragY(0);
    dragStartY.current = null;
    dragCaptured.current = false;
  };

  // ESC kapatma
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet — her yerden sürüklenebilir */}
      <div
        ref={sheetRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-card shadow-2xl ${
          dragCaptured.current
            ? ""
            : "transition-transform duration-300 ease-out"
        }`}
        style={{
          height: "95dvh",
          transform: isOpen
            ? `translateY(${dragY}px)`
            : "translateY(100%)",
          touchAction: "pan-y",
        }}
      >
        {/* Drag handle (görsel) */}
        <div className="flex items-center justify-center pt-3 pb-3">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/50" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-5 pb-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mekan, etkinlik, numara..."
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="h-[calc(95dvh-5.5rem)] overflow-y-auto px-5 pb-10 no-scrollbar"
        >
          {q.trim().length === 0 ? (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hızlı Kategoriler
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickCategories.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    onClick={onClose}
                    className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium transition hover:bg-muted"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>

              <h3 className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Öne Çıkanlar
              </h3>
              <div className="space-y-2">
                {places.slice(0, 5).map((p) => (
                  <Link
                    key={p.slug}
                    href={`/gezilecek/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:bg-muted/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {categoryLabels[p.category]}
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Sonuç bulunamadı.
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((hit, i) => {
                const Icon = iconFor(hit.kind) ?? Search;
                return (
                  <Link
                    key={`${hit.kind}-${i}`}
                    href={hrefFor(hit)}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:bg-muted/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {hit.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {hit.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
