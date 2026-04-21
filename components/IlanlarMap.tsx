"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

interface Listing {
  id: string; title: string; price: number; price_type: string;
  location?: string; photos?: string[]; listing_type: string; category: string;
}

interface Props {
  listings: Listing[];
}

// Gebze merkezi
const GEBZE = { lat: 40.8029, lng: 29.5162 };

function hashCoords(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = Math.imul(31, h) + id.charCodeAt(i) | 0; }
  const lat = GEBZE.lat + ((Math.abs(h) % 800) - 400) / 10000;
  const lng = GEBZE.lng + ((Math.abs(h >> 8) % 800) - 400) / 10000;
  return [lat, lng];
}

function formatPrice(p: number) {
  return p.toLocaleString("tr-TR") + " ₺";
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function IlanlarMap({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const L = require("leaflet");

    // Marker icon fix for Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const map = L.map(containerRef.current, {
      center: [GEBZE.lat, GEBZE.lng],
      zoom: 13,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    listings.forEach((l) => {
      const [lat, lng] = hashCoords(l.id);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: var(--primary, #0e7490);
          color: white;
          border-radius: 8px 8px 2px 8px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        ">${formatPrice(l.price)}</div>`,
        iconAnchor: [0, 28],
        popupAnchor: [0, -30],
      });

      const popup = L.popup({ maxWidth: 220, className: "gebzem-popup" }).setContent(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          ${l.photos?.[0]
            ? `<img src="${l.photos[0]}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
            : `<div style="width:100%;height:80px;background:#f1f5f9;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:24px;">🏷️</div>`
          }
          <p style="font-size:12px;font-weight:600;margin:0 0 4px;line-height:1.4;">${esc(l.title)}</p>
          <p style="font-size:14px;font-weight:700;color:#0e7490;margin:0 0 8px;">${formatPrice(l.price)}</p>
          ${l.location ? `<p style="font-size:11px;color:#64748b;margin:0 0 8px;">📍 ${esc(l.location)}</p>` : ""}
          <a href="/ilanlar/${l.id}" style="
            display:block;text-align:center;background:#0e7490;color:white;
            text-decoration:none;border-radius:20px;padding:6px 12px;
            font-size:12px;font-weight:600;
          ">İncele →</a>
        </div>
      `);

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(popup);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [listings]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: 400 }}
    />
  );
}
