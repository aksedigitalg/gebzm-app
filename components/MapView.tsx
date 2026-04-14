"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { places, categoryLabels, type Place } from "@/data/places";

const GEBZE_CENTER: [number, number] = [40.8028, 29.4303];

// Custom SVG marker icon (no emoji, teal brand)
const markerIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:28px;height:36px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36">
      <path d="M14 0C6.3 0 0 6.1 0 13.6 0 24 14 36 14 36s14-12 14-22.4C28 6.1 21.7 0 14 0Z" fill="#0e7490"/>
      <circle cx="14" cy="13.5" r="5" fill="#ffffff"/>
    </svg>
  </div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -32],
});

function FocusOnPlace({ place }: { place?: Place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.setView(place.coordinates, 15, { animate: true });
  }, [place, map]);
  return null;
}

export default function MapView({ focusSlug }: { focusSlug?: string }) {
  const focused = useMemo(
    () => places.find((p) => p.slug === focusSlug),
    [focusSlug]
  );

  return (
    <MapContainer
      center={focused?.coordinates ?? GEBZE_CENTER}
      zoom={focused ? 15 : 13}
      scrollWheelZoom
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      <FocusOnPlace place={focused} />
      {places.map((p) => (
        <Marker key={p.slug} position={p.coordinates} icon={markerIcon}>
          <Popup>
            <div className="min-w-[180px] font-sans">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {categoryLabels[p.category]}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {p.name}
              </p>
              <p className="mt-1 text-xs text-gray-600">{p.shortDescription}</p>
              <Link
                href={`/gezilecek/${p.slug}`}
                className="mt-2 inline-block text-xs font-semibold text-cyan-700 hover:underline"
              >
                Detaylara git →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
