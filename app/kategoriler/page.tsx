import Link from "next/link";
import {
  UtensilsCrossed, Utensils, Coffee, Store, ShoppingBag,
  Stethoscope, Scissors, Wrench, Building, Car,
  Tag, MapPin, Bus, PhoneCall, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const categories = [
  {
    group: "Yiyecek & İçecek",
    items: [
      { label: "Restoran", desc: "Yerinde yemek, masa rezervasyonu", icon: UtensilsCrossed, href: "/restoran", color: "from-orange-500 to-red-600" },
      { label: "Yemek Teslimat", desc: "Online sipariş, eve teslim", icon: Utensils, href: "/yemek", color: "from-rose-500 to-orange-500" },
      { label: "Kafe & Pastane", desc: "Kahve, tatlı, hafif yemek", icon: Coffee, href: "/kafe", color: "from-amber-500 to-orange-600" },
    ],
  },
  {
    group: "Alışveriş",
    items: [
      { label: "Market", desc: "Gıda, temizlik, ürünler", icon: Store, href: "/market", color: "from-emerald-500 to-teal-600" },
      { label: "Mağaza", desc: "Giyim, elektronik, ev-yaşam", icon: ShoppingBag, href: "/magaza", color: "from-sky-500 to-blue-600" },
    ],
  },
  {
    group: "Hizmetler",
    items: [
      { label: "Doktor & Klinik", desc: "Muayene, randevu", icon: Stethoscope, href: "/hizmetler?tip=doktor", color: "from-cyan-500 to-blue-600" },
      { label: "Kuaför & Berber", desc: "Saç, bakım, makyaj", icon: Scissors, href: "/hizmetler?tip=kuafor", color: "from-pink-500 to-fuchsia-600" },
      { label: "Usta & Tamir", desc: "Tesisat, elektrik, boya", icon: Wrench, href: "/hizmetler?tip=usta", color: "from-amber-600 to-orange-700" },
    ],
  },
  {
    group: "Gayrimenkul & Araç",
    items: [
      { label: "Emlakçı", desc: "Satılık, kiralık konut & arsa", icon: Building, href: "/emlakci", color: "from-blue-600 to-indigo-700" },
      { label: "Oto Galeri", desc: "Sıfır & ikinci el araçlar", icon: Car, href: "/galerici", color: "from-slate-600 to-zinc-700" },
    ],
  },
  {
    group: "Keşfet",
    items: [
      { label: "İlanlar", desc: "Emlak, vasıta, elektronik", icon: Tag, href: "/ilanlar", color: "from-violet-500 to-purple-600" },
      { label: "Harita", desc: "Şehirde neler var", icon: MapPin, href: "/harita", color: "from-cyan-500 to-teal-600" },
      { label: "Ulaşım", desc: "Marmaray, otobüs, YHT", icon: Bus, href: "/ulasim", color: "from-amber-500 to-yellow-600" },
      { label: "Acil Numaralar", desc: "Hızlı erişim", icon: PhoneCall, href: "/acil", color: "from-red-500 to-rose-600" },
      { label: "Gebzem AI", desc: "Şehir asistanına sor", icon: Sparkles, href: "/ai", color: "from-primary to-secondary" },
    ],
  },
];

export default function KategorilerPage() {
  return (
    <>
      <PageHeader title="Kategoriler" subtitle="Gebze'deki tüm hizmetler" />
      <div className="px-5 pb-10 pt-4 space-y-7">
        {categories.map((group) => (
          <section key={group.group}>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.group}
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {group.items.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{c.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
