import {
  TrainFront,
  Bus,
  Ship,
  Clock,
  Route,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { transportLines, type TransportLine } from "@/data/transport";

export const metadata = { title: "Ulaşım" };

const iconFor = (type: TransportLine["type"]) => {
  switch (type) {
    case "marmaray":
    case "yht":
      return TrainFront;
    case "feribot":
      return Ship;
    default:
      return Bus;
  }
};

const groupLabels: Record<TransportLine["type"], string> = {
  marmaray: "Raylı Sistem",
  yht: "Yüksek Hızlı Tren",
  feribot: "Deniz Ulaşımı",
  otobus: "Otobüs",
};

export default function Page() {
  const grouped = transportLines.reduce<
    Record<string, TransportLine[]>
  >((acc, line) => {
    (acc[line.type] ??= []).push(line);
    return acc;
  }, {});

  const order: TransportLine["type"][] = ["marmaray", "yht", "otobus", "feribot"];

  return (
    <>
      <PageHeader
        title="Ulaşım"
        subtitle="Marmaray, YHT, otobüs ve feribot"
      />
      <div className="space-y-6 px-4 pb-10 pt-4">
        {order
          .filter((t) => grouped[t])
          .map((type) => (
            <section key={type}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {groupLabels[type]}
              </h3>
              <div className="space-y-3">
                {grouped[type].map((line) => {
                  const Icon = iconFor(line.type);
                  return (
                    <article
                      key={line.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold">{line.name}</h4>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Route className="h-3 w-3" />
                            {line.route}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-muted/60 p-2">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                İlk - Son Sefer
                              </p>
                              <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold">
                                <Clock className="h-3 w-3" />
                                {line.firstDeparture} - {line.lastDeparture}
                              </p>
                            </div>
                            <div className="rounded-xl bg-muted/60 p-2">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Sefer Sıklığı
                              </p>
                              <p className="mt-0.5 text-xs font-semibold">
                                {line.interval}
                              </p>
                            </div>
                          </div>

                          {line.notes && (
                            <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <Info className="mt-0.5 h-3 w-3 shrink-0" />
                              <span>{line.notes}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}
