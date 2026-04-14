import MapWrapper from "@/components/MapWrapper";

export const metadata = { title: "Harita" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ yer?: string }>;
}) {
  const { yer } = await searchParams;
  return (
    <div
      className="fixed inset-x-0 top-0 z-10 bg-card"
      style={{
        bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
      }}
    >
      <MapWrapper focusSlug={yer} />
    </div>
  );
}
