"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  DollarSign,
  Users,
  LayoutGrid,
  Image as ImageIcon,
  Check,
  Eye,
} from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import {
  objectiveLabels,
  objectiveDescriptions,
  placementLabels,
  type CampaignObjective,
  type Placement,
  type BudgetType,
} from "@/lib/ads";

const steps = [
  "Hedef",
  "Bütçe & Takvim",
  "Hedefleme",
  "Yerleşim",
  "Reklam",
  "Önizleme",
];

const gradientOptions = [
  "from-orange-500 to-red-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-sky-600",
  "from-slate-600 to-zinc-700",
];

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<CampaignObjective>("visits");
  const [budgetType, setBudgetType] = useState<BudgetType>("daily");
  const [budget, setBudget] = useState(100);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [location, setLocation] = useState("Gebze");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [interests, setInterests] = useState<string[]>(["Yemek"]);
  const [placements, setPlacements] = useState<Placement[]>(["home-slider"]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("Detaylar");
  const [gradient, setGradient] = useState(gradientOptions[0]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    router.replace("/isletme/reklam/kampanyalar");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/isletme/reklam/kampanyalar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          aria-label="Geri"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">Yeni Kampanya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adım {step + 1}/{steps.length} · {steps[step]}
          </p>
        </div>
      </header>

      <StepIndicator total={steps.length} current={step} />

      {/* Form kapsayıcı */}
      <div className="rounded-2xl border border-border bg-card p-6">
        {step === 0 && (
          <ObjectiveStep
            name={name}
            setName={setName}
            objective={objective}
            setObjective={setObjective}
          />
        )}
        {step === 1 && (
          <BudgetStep
            budgetType={budgetType}
            setBudgetType={setBudgetType}
            budget={budget}
            setBudget={setBudget}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        )}
        {step === 2 && (
          <TargetingStep
            location={location}
            setLocation={setLocation}
            ageMin={ageMin}
            setAgeMin={setAgeMin}
            ageMax={ageMax}
            setAgeMax={setAgeMax}
            gender={gender}
            setGender={setGender}
            interests={interests}
            setInterests={setInterests}
          />
        )}
        {step === 3 && (
          <PlacementStep
            placements={placements}
            setPlacements={setPlacements}
          />
        )}
        {step === 4 && (
          <AdCreativeStep
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            cta={cta}
            setCta={setCta}
            gradient={gradient}
            setGradient={setGradient}
          />
        )}
        {step === 5 && (
          <ReviewStep
            name={name}
            objective={objective}
            budget={budget}
            budgetType={budgetType}
            startDate={startDate}
            endDate={endDate}
            location={location}
            ageMin={ageMin}
            ageMax={ageMax}
            placements={placements}
            title={title}
            description={description}
            cta={cta}
            gradient={gradient}
          />
        )}
      </div>

      {/* Aksiyon butonları */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Geri
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Sonraki Adım
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Yayınlanıyor..." : "Kampanyayı Yayınla"}
            {!saving && <Check className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 0: Objective ───
function ObjectiveStep({
  name,
  setName,
  objective,
  setObjective,
}: {
  name: string;
  setName: (v: string) => void;
  objective: CampaignObjective;
  setObjective: (v: CampaignObjective) => void;
}) {
  const objectives: CampaignObjective[] = [
    "visits",
    "orders",
    "reservations",
    "listings",
    "awareness",
  ];
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Target}
        title="Kampanya Hedefi"
        subtitle="İşletmeniz için neyi başarmak istediğinizi seçin"
      />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Kampanya Adı
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Hafta Sonu Mangal Kampanyası"
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          Hedef
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {objectives.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setObjective(o)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                objective === o
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <p className="text-sm font-semibold">{objectiveLabels[o]}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {objectiveDescriptions[o]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Budget ───
function BudgetStep({
  budgetType,
  setBudgetType,
  budget,
  setBudget,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  budgetType: BudgetType;
  setBudgetType: (v: BudgetType) => void;
  budget: number;
  setBudget: (v: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={DollarSign}
        title="Bütçe & Takvim"
        subtitle="Ne kadar ve ne zaman harcayacağınızı seçin"
      />
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          Bütçe Türü
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["daily", "total"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setBudgetType(t)}
              className={`rounded-xl border p-3 text-left transition ${
                budgetType === t
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <p className="text-sm font-semibold">
                {t === "daily" ? "Günlük Bütçe" : "Toplam Bütçe"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t === "daily"
                  ? "Günde en fazla şu kadar harca"
                  : "Toplamda bu kadar harca, bitince dur"}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {budgetType === "daily" ? "Günlük Bütçe (TL)" : "Toplam Bütçe (TL)"}
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          {budgetType === "daily"
            ? `Tahmini 30 gün: ₺${(budget * 30).toLocaleString("tr")}`
            : `Tahmini günlük: ₺${Math.round(budget / 30).toLocaleString("tr")}`}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Başlangıç
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Bitiş
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Targeting ───
function TargetingStep(props: {
  location: string;
  setLocation: (v: string) => void;
  ageMin: number;
  setAgeMin: (v: number) => void;
  ageMax: number;
  setAgeMax: (v: number) => void;
  gender: "all" | "male" | "female";
  setGender: (v: "all" | "male" | "female") => void;
  interests: string[];
  setInterests: (v: string[]) => void;
}) {
  const {
    location,
    setLocation,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    gender,
    setGender,
    interests,
    setInterests,
  } = props;
  const allInterests = [
    "Yemek",
    "Et",
    "Kafe",
    "Alışveriş",
    "Moda",
    "Sağlık",
    "Spor",
    "Aile",
    "Otomotiv",
    "Emlak",
    "Gezi",
    "Kültür",
    "Teknoloji",
  ];
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Users}
        title="Hedefleme"
        subtitle="Reklamı kime göstermek istiyorsunuz"
      />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Lokasyon
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="Gebze">Gebze (sadece ilçe)</option>
          <option value="Gebze, Darıca">Gebze + Darıca</option>
          <option value="Gebze, Darıca, Çayırova">Gebze + Darıca + Çayırova</option>
          <option value="Kocaeli">Tüm Kocaeli</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Minimum Yaş
          </label>
          <input
            type="number"
            value={ageMin}
            onChange={(e) => setAgeMin(Number(e.target.value))}
            min={13}
            max={99}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Maksimum Yaş
          </label>
          <input
            type="number"
            value={ageMax}
            onChange={(e) => setAgeMax(Number(e.target.value))}
            min={13}
            max={99}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          Cinsiyet
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                gender === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              }`}
            >
              {g === "all" ? "Tümü" : g === "male" ? "Erkek" : "Kadın"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          İlgi Alanları
        </label>
        <div className="flex flex-wrap gap-2">
          {allInterests.map((i) => {
            const selected = interests.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setInterests(
                    selected ? interests.filter((x) => x !== i) : [...interests, i]
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {selected ? "✓ " : "+ "}
                {i}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Placement ───
function PlacementStep({
  placements,
  setPlacements,
}: {
  placements: Placement[];
  setPlacements: (v: Placement[]) => void;
}) {
  const all: Placement[] = [
    "home-slider",
    "category-banner",
    "search-results",
    "map-premium",
    "listing-featured",
  ];
  const toggle = (p: Placement) => {
    setPlacements(
      placements.includes(p)
        ? placements.filter((x) => x !== p)
        : [...placements, p]
    );
  };
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={LayoutGrid}
        title="Yerleşim"
        subtitle="Reklamınız nerede gösterilsin"
      />
      <div className="space-y-2">
        {all.map((p) => {
          const selected = placements.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{placementLabels[p]}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {descriptions[p]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const descriptions: Record<Placement, string> = {
  "home-slider": "Ana sayfada en üstte büyük banner olarak gösterilir",
  "category-banner": "Yemek/Restoran/Kategori sayfalarında üst banner",
  "search-results": "Kullanıcılar arama yaptığında sponsorlu sonuç olarak",
  "map-premium": "Haritada özel renkli marker ile öne çıkarılır",
  "listing-featured": "İlan listelerinde öne çıkarılmış olarak",
};

// ─── Step 4: Ad Creative ───
function AdCreativeStep(props: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  cta: string;
  setCta: (v: string) => void;
  gradient: string;
  setGradient: (v: string) => void;
}) {
  const { title, setTitle, description, setDescription, cta, setCta, gradient, setGradient } = props;
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={ImageIcon}
        title="Reklam İçeriği"
        subtitle="Kullanıcıların göreceği metni ve görseli hazırla"
      />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Başlık (max 50 karakter)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          placeholder="Örn: Aile Dostu Mangal Keyfi"
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Açıklama (max 120 karakter)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
          placeholder="Kısa ve etkileyici bir açıklama"
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Eylem Butonu (CTA)
        </label>
        <select
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="Detaylar">Detaylar</option>
          <option value="Sipariş Ver">Sipariş Ver</option>
          <option value="Rezervasyon">Rezervasyon Yap</option>
          <option value="Randevu Al">Randevu Al</option>
          <option value="Teklif Al">Teklif Al</option>
          <option value="İlanı Gör">İlanı Gör</option>
          <option value="Ara">Ara</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          Arka Plan Rengi
        </label>
        <div className="grid grid-cols-4 gap-2">
          {gradientOptions.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradient(g)}
              className={`h-12 rounded-xl bg-gradient-to-br transition ${g} ${
                gradient === g ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review ───
function ReviewStep(props: {
  name: string;
  objective: CampaignObjective;
  budget: number;
  budgetType: BudgetType;
  startDate: string;
  endDate: string;
  location: string;
  ageMin: number;
  ageMax: number;
  placements: Placement[];
  title: string;
  description: string;
  cta: string;
  gradient: string;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Eye}
        title="Önizleme"
        subtitle="Kampanyanı yayınlamadan önce son bir kontrol"
      />
      {/* Reklam önizleme */}
      <div className="rounded-2xl border border-border bg-background p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Reklam Önizleme
        </p>
        <div
          className={`relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${props.gradient} p-5 text-white shadow-lg`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            SPONSORLU
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">
            {props.title || "Başlık"}
          </p>
          <p className="mt-1 text-xs opacity-90">
            {props.description || "Açıklama"}
          </p>
          <button className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {props.cta}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Summary label="Kampanya" value={props.name || "—"} />
        <Summary label="Hedef" value={objectiveLabels[props.objective]} />
        <Summary
          label="Bütçe"
          value={`₺${props.budget} /${props.budgetType === "daily" ? "gün" : "toplam"}`}
        />
        <Summary label="Takvim" value={`${props.startDate} → ${props.endDate}`} />
        <Summary label="Lokasyon" value={props.location} />
        <Summary label="Yaş" value={`${props.ageMin} - ${props.ageMax}`} />
        <Summary
          label="Yerleşim"
          value={props.placements.map((p) => placementLabels[p]).join(" + ")}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Target;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
