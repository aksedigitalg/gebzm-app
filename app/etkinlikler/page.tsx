import Link from "next/link";
import { Calendar, MapPin, Ticket, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { events, eventCategoryLabels } from "@/data/events";
import { formatDateTR } from "@/lib/utils";

export const metadata = { title: "Etkinlikler" };

export default function Page() {
  const sorted = [...events].sort(
    (a, b) => +new Date(a.date) - +new Date(b.date)
  );

  return (
    <>
      <PageHeader
        title="Etkinlikler"
        subtitle={`${sorted.length} yaklaşan etkinlik`}
      />
      <div className="px-5 pb-6 pt-4">
        <div className="space-y-3">
          {sorted.map((e) => {
            const date = new Date(e.date);
            const day = date.toLocaleDateString("tr-TR", { day: "2-digit" });
            const month = date.toLocaleDateString("tr-TR", { month: "short" });
            return (
              <Link
                key={e.id}
                href={`/etkinlikler/${e.id}`}
                className="relative block overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="text-xl font-bold leading-none">{day}</span>
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {eventCategoryLabels[e.category]}
                    </span>
                    <h3 className="mt-1.5 text-sm font-semibold leading-snug">
                      {e.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {e.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTR(e.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {e.location}
                      </span>
                      {e.price && (
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          {e.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
