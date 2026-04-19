import { IlanlarClient } from "@/components/IlanlarClient";

export const metadata = { title: "İlanlar — Gebzem" };
export const revalidate = 30;

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function getAllListings() {
  try {
    const res = await fetch(`${API}/listings`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export default async function Page() {
  const listings = await getAllListings();
  return <IlanlarClient initialListings={listings} />;
}
