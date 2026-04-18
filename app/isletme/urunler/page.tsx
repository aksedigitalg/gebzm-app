import { Package } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ürünler / Stok</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ürün ve stok yönetimi</p>
      </header>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
        <Package className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold">Ürün eklenmemiş</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">İlk ürününüzü eklemek için + butonuna tıklayın.</p>
      </div>
    </div>
  );
}
