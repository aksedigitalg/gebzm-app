"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Banknote,
  FileText,
  CheckCircle2,
  Save,
  Send,
} from "lucide-react";

const jobTypes = [
  "Tam Zamanlı",
  "Yarı Zamanlı",
  "Sözleşmeli",
  "Staj",
  "Uzaktan",
];

const categories = [
  "Satış",
  "Servis / Garson",
  "Mutfak / Aşçı",
  "Temizlik",
  "Yönetim",
  "Ofis",
  "Diğer",
];

const experienceLevels = [
  "Deneyim aranmıyor",
  "0-1 yıl",
  "1-3 yıl",
  "3-5 yıl",
  "5+ yıl",
];

const sampleBenefits = [
  "Yemek",
  "Servis",
  "Özel Sigorta",
  "Prim",
  "Bayram İkramiyesi",
  "Eğitim",
  "Esnek Saat",
  "Yıllık İzin",
];

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState(jobTypes[0]);
  const [category, setCategory] = useState(categories[0]);
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [location, setLocation] = useState("Mustafa Paşa Mah., Gebze");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [showSalary, setShowSalary] = useState(true);
  const [description, setDescription] = useState("");
  const [reqs, setReqs] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>(["Yemek", "Servis"]);
  const [saved, setSaved] = useState(false);

  const addReq = () => setReqs([...reqs, ""]);
  const updReq = (i: number, v: string) =>
    setReqs((prev) => prev.map((r, idx) => (idx === i ? v : r)));
  const delReq = (i: number) => setReqs((prev) => prev.filter((_, idx) => idx !== i));

  const toggleBenefit = (b: string) =>
    setBenefits((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );

  const submit = async (publish: boolean) => {
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => router.replace("/isletme/ilanlar"), 900);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/isletme/ilanlar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          aria-label="Geri"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yeni İş İlanı</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            İlanı yayınlamadan önce taslak olarak kaydedebilirsiniz
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <form className="space-y-5 lg:col-span-2">
          <Section icon={Briefcase} title="Temel Bilgiler">
            <Field label="İlan Başlığı" required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Deneyimli Garson"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Kategori" required>
                <Select value={category} onChange={setCategory} options={categories} />
              </Field>
              <Field label="Çalışma Şekli" required>
                <Select value={type} onChange={setType} options={jobTypes} />
              </Field>
            </div>
            <Field label="Deneyim" required>
              <Select
                value={experience}
                onChange={setExperience}
                options={experienceLevels}
              />
            </Field>
          </Section>

          <Section icon={MapPin} title="Lokasyon">
            <Field label="Adres" required>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
          </Section>

          <Section icon={Banknote} title="Ücret">
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSalary}
                onChange={(e) => setShowSalary(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              İlanda ücret aralığını göster
            </label>
            {showSalary && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Minimum (TL)">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="25000"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Maksimum (TL)">
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="35000"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>
            )}
          </Section>

          <Section icon={FileText} title="İş Tanımı">
            <Field label="Açıklama" required>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pozisyon hakkında detaylı bilgi yazın: sorumluluklar, beklentiler, çalışma koşulları..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
          </Section>

          <Section icon={CheckCircle2} title="Aranan Nitelikler">
            <div className="space-y-2">
              {reqs.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={r}
                    onChange={(e) => updReq(i, e.target.value)}
                    placeholder={`${i + 1}. Nitelik`}
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  {reqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => delReq(i)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition hover:bg-red-500/20"
                      aria-label="Sil"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addReq}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted"
              >
                + Yeni Nitelik
              </button>
            </div>
          </Section>

          <Section icon={Save} title="Yan Haklar">
            <p className="mb-2 text-xs text-muted-foreground">
              İlanda gösterilecek avantajları seçin
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleBenefits.map((b) => {
                const selected = benefits.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBenefit(b)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {b}
                  </button>
                );
              })}
            </div>
          </Section>

          <div className="flex flex-wrap items-center gap-3">
            {saved && (
              <span className="text-sm font-semibold text-emerald-600">
                ✓ İlan kaydedildi, yönlendiriliyor...
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => submit(false)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <Save className="h-4 w-4" />
                Taslak Kaydet
              </button>
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={!title || !description}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Yayınla
              </button>
            </div>
          </div>
        </form>

        {/* Canlı önizleme */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Önizleme
            </p>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  <Briefcase className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {title || "İlan Başlığı"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Gebze Mangal Evi · {type}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {location}
                  </p>
                  {showSalary && salaryMin && (
                    <p className="mt-2 text-xs font-semibold text-primary">
                      {salaryMin}
                      {salaryMax && ` - ${salaryMax}`} TL
                    </p>
                  )}
                  {description && (
                    <p className="mt-2 line-clamp-3 text-[11px] text-muted-foreground">
                      {description}
                    </p>
                  )}
                  {benefits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {benefits.slice(0, 4).map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Save;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
