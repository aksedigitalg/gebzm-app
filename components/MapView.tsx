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
import type { MapPoint } from "@/data/services";

const GEBZE_CENTER: [number, number] = [40.8028, 29.4303];

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

function FocusOnPlace({ point }: { point?: MapPoint }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo(point.coordinates, 16, { duration: 0.8 });
  }, [point, map]);
  return null;
}

export default function MapView({
  points,
  focusSlug,
}: {
  points: MapPoint[];
  focusSlug?: string;
}) {
  const focused = useMemo(
    () => points.find((p) => p.slug === focusSlug),
    [points, focusSlug]
  );

  return (
    <MapContainer
      center={focused?.coordinates ?? GEBZE_CENTER}
      zoom={focused ? 16 : 13}
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      <FocusOnPlace point={focused} />
      {points.map((p) => (
        <Marker key={p.slug} position={p.coordinates} icon={markerIcon}>
          <Popup>
            <div className="min-w-[180px] font-sans">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {p.category}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {p.name}
              </p>
              {p.shortDescription && (
                <p className="mt-1 text-xs text-gray-600">
                  {p.shortDescription}
                </p>
              )}
              {p.href && (
                <Link
                  href={p.href}
                  className="mt-2 inline-block text-xs font-semibold text-cyan-700 hover:underline"
                >
                  Detaylara git →
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
