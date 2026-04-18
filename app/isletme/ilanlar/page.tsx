import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İş İlanlarım</h1>
          <p className="mt-1 text-sm text-muted-foreground">Personel arama ilanlarınız</p>
        </div>
        <Link href="/isletme/ilanlar/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />Yeni İlan
        </Link>
      </header>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
        <Briefcase className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold">Henüz iş ilanı yok</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Personel aramak için yeni ilan oluşturun.</p>
        <Link href="/isletme/ilanlar/yeni"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" />İlan Oluştur
        </Link>
      </div>
    </div>
  );
}
