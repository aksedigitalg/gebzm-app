import { PageHeader } from "@/components/PageHeader";
import MapWrapper from "@/components/MapWrapper";

export const metadata = { title: "Harita" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ yer?: string }>;
}) {
  const { yer } = await searchParams;
  return (
    <>
      <PageHeader title="Harita" subtitle="Gebze'deki tüm noktalar" />
      <div className="px-5 pb-6 pt-4">
        <div className="h-[calc(100vh-180px)] min-h-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <MapWrapper focusSlug={yer} />
        </div>
      </div>
    </>
  );
}
