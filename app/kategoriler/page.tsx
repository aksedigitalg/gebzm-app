import Link from "next/link";
import {
  Sparkles, UtensilsCrossed, Utensils, Coffee,
  Store, ShoppingBag, Wrench, Tag, Briefcase,
  MapPin, Bus, PhoneCall,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const categories = [
  { label: "Gebzem AI",      desc: "Şehir asistanına sor",           icon: Sparkles,       href: "/ai",         color: "from-primary to-secondary" },
  { label: "Restoran",       desc: "Masa rezervasyonu",              icon: UtensilsCrossed, href: "/restoran",   color: "from-orange-500 to-red-600" },
  { label: "Yemek Teslimat", desc: "Eve sipariş ver",                icon: Utensils,        href: "/yemek",      color: "from-rose-500 to-orange-500" },
  { label: "Kafe",           desc: "Kahve, tatlı, hafif yemek",      icon: Coffee,          href: "/kafe",       color: "from-amber-500 to-orange-600" },
  { label: "Market",         desc: "Gıda & temizlik ürünleri",       icon: Store,           href: "/market",     color: "from-emerald-500 to-teal-600" },
  { label: "Mağaza",         desc: "Giyim, elektronik, ev-yaşam",    icon: ShoppingBag,     href: "/magaza",     color: "from-sky-500 to-blue-600" },
  { label: "Hizmetler",      desc: "Kuaför, usta, doktor",           icon: Wrench,          href: "/hizmetler",  color: "from-violet-500 to-purple-600" },
  { label: "İlanlar",        desc: "Emlak, araç, elektronik",        icon: Tag,             href: "/ilanlar",    color: "from-pink-500 to-rose-600" },
  { label: "İş İlanları",    desc: "Kariyer fırsatları",             icon: Briefcase,       href: "/is-ilanlari", color: "from-indigo-500 to-blue-600" },
  { label: "Harita",         desc: "Şehirde neler var",              icon: MapPin,          href: "/harita",     color: "from-cyan-500 to-teal-600" },
  { label: "Ulaşım",         desc: "Marmaray, otobüs, YHT",          icon: Bus,             href: "/ulasim",     color: "from-amber-500 to-yellow-600" },
  { label: "Acil Numaralar", desc: "Hızlı erişim",                   icon: PhoneCall,       href: "/acil",       color: "from-red-500 to-rose-600" },
];

export default function KategorilerPage() {
  return (
    <>
      <PageHeader title="Kategoriler" subtitle="Gebze'deki tüm hizmetler" />
      <div className="px-5 pb-10 pt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((c) => {
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
      </div>
    </>
  );
}
