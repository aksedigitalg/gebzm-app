"use client";
export const dynamic = "force-dynamic";
import { Car } from "lucide-react";
import { BusinessListings } from "@/components/BusinessListings";

export default function Page() {
  return (
    <BusinessListings
      title="Vasıta İlanlarım"
      emptyText="Henüz vasıta ilanı yok"
      emptyBtn="Araç İlanı Oluştur"
      headerIcon={Car}
      headerColor="from-slate-600 to-zinc-700"
    />
  );
}
