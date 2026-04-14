import {
  Siren,
  ShieldAlert,
  Hospital,
  Building2,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  emergencyContacts,
  emergencyCategoryLabels,
  type EmergencyContact,
} from "@/data/emergency";

export const metadata = { title: "Acil Numaralar" };

const icons: Record<EmergencyContact["category"], typeof Siren> = {
  acil: Siren,
  guvenlik: ShieldAlert,
  saglik: Hospital,
  belediye: Building2,
};

const order: EmergencyContact["category"][] = [
  "acil",
  "guvenlik",
  "saglik",
  "belediye",
];

export default function Page() {
  const grouped = emergencyContacts.reduce<
    Record<string, EmergencyContact[]>
  >((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Acil Numaralar"
        subtitle="Tek dokunuşla arayabilirsin"
      />
      <div className="space-y-6 px-5 pb-10 pt-4">
        {order
          .filter((c) => grouped[c])
          .map((cat) => {
            const Icon = icons[cat];
            return (
              <section key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {emergencyCategoryLabels[cat]}
                  </h3>
                </div>
                <div className="space-y-2">
                  {grouped[cat].map((c) => (
                    <a
                      key={c.id}
                      href={`tel:${c.phone}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md active:scale-[0.99]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.phone}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Phone className="h-5 w-5" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </>
  );
}
