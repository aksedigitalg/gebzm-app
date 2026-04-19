import { Tag } from "lucide-react";
import { BusinessListings } from "@/components/BusinessListings";

export default function Page() {
  return (
    <BusinessListings
      title="İlanlarım"
      emptyText="Henüz ilan yok"
      emptyBtn="İlan Oluştur"
      headerIcon={Tag}
      headerColor="from-blue-500 to-indigo-600"
    />
  );
}
