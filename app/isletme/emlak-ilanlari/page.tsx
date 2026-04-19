"use client";
export const dynamic = "force-dynamic";
import { Home } from "lucide-react";
import { BusinessListings } from "@/components/BusinessListings";

export default function Page() {
  return (
    <BusinessListings
      title="Emlak İlanlarım"
      emptyText="Henüz emlak ilanı yok"
      emptyBtn="Emlak İlanı Oluştur"
      headerIcon={Home}
      headerColor="from-blue-600 to-indigo-700"
    />
  );
}
