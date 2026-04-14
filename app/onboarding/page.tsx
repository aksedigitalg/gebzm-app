"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, MapPin, CalendarHeart, ChevronRight } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { setOnboarded } from "@/lib/auth";

const slides = [
  {
    icon: Compass,
    title: "Gebze'yi Keşfet",
    description:
      "Tarihi yerler, doğa rotaları ve gizli köşeler — hepsi tek uygulamada, parmaklarının ucunda.",
  },
  {
    icon: MapPin,
    title: "Haritayla Gez",
    description:
      "İlgini çeken mekanları haritada gör, yol tarifi al, en yakın duraklara kolayca ulaş.",
  },
  {
    icon: CalendarHeart,
    title: "Şehirde Neler Oluyor?",
    description:
      "Konser, festival, etkinlik takvimi — Gebze'de bugün ve yarın ne var, hiç kaçırma.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  const next = () => {
    if (isLast) {
      setOnboarded();
      router.replace("/giris");
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pt-8 pb-6">
      <div className="flex items-center justify-between">
        <StepIndicator total={slides.length} current={step} />
        <button
          type="button"
          onClick={() => {
            setOnboarded();
            router.replace("/giris");
          }}
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          Atla
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-10 flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25 blur-2xl" />
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl">
            <Icon className="h-20 w-20" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {slide.description}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={next}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          {isLast ? "Başla" : "Devam Et"}
          <ChevronRight className="h-4 w-4" />
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            Geri
          </button>
        )}
      </div>
    </div>
  );
}
