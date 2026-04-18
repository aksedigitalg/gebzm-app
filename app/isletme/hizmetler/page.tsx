import { Wrench } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Hizmetlerim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sunduğunuz hizmetler</p>
      </header>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
        <Wrench className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold">Henüz hizmet eklenmemiş</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Sunduğunuz hizmetleri ekleyin.</p>
      </div>
    </div>
  );
}
