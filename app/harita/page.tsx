import MapWrapper from "@/components/MapWrapper";
import { places, categoryLabels } from "@/data/places";
import { getServicePoints, type MapPoint } from "@/data/services";

export const metadata = { title: "Harita" };

function placesToMapPoints(): MapPoint[] {
  return places.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: categoryLabels[p.category],
    address: p.address,
    coordinates: p.coordinates,
    shortDescription: p.shortDescription,
    href: `/gezilecek/${p.slug}`,
  }));
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ yer?: string; servis?: string }>;
}) {
  const { yer, servis } = await searchParams;
  const servicePoints = servis ? getServicePoints(servis) : undefined;
  const points = servicePoints ?? placesToMapPoints();

  return (
    <div
      className="fixed inset-x-0 top-0 z-10 bg-card"
      style={{
        bottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <MapWrapper points={points} focusSlug={yer} />
    </div>
  );
}
