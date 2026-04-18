import { Calendar } from "lucide-react";
export default function Page() {
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Etkinlikler</h1></header>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-semibold">Henüz etkinlik yok</p>
        <p className="mt-1 text-xs text-muted-foreground">Etkinlikler eklendiğinde burada görünecek.</p>
      </div>
    </div>
  );
}
