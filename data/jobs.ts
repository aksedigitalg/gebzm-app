export type JobType = "tam-zamanli" | "yari-zamanli" | "sozlesmeli" | "staj" | "uzaktan";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  category: string;
  salary?: string;
  postedDate: string; // ISO
  applicants: number;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  logoColor: string;
}

export const jobTypeLabels: Record<JobType, string> = {
  "tam-zamanli": "Tam Zamanlı",
  "yari-zamanli": "Yarı Zamanlı",
  "sozlesmeli": "Sözleşmeli",
  "staj": "Staj",
  "uzaktan": "Uzaktan",
};

export const jobCategories = [
  { id: "all", label: "Tümü" },
  { id: "yazilim", label: "Yazılım" },
  { id: "satis", label: "Satış" },
  { id: "muhasebe", label: "Muhasebe" },
  { id: "muhendislik", label: "Mühendislik" },
  { id: "uretim", label: "Üretim" },
  { id: "saglik", label: "Sağlık" },
  { id: "egitim", label: "Eğitim" },
];

export const jobs: JobListing[] = [
  {
    id: "j-1",
    title: "Yazılım Geliştirici (Frontend)",
    company: "Gebze Teknoloji A.Ş.",
    location: "Gebze, Kocaeli",
    type: "tam-zamanli",
    category: "yazilim",
    salary: "40.000 - 70.000 TL",
    postedDate: "2026-04-13T10:00:00",
    applicants: 27,
    experience: "2-4 yıl",
    description:
      "React ve Next.js ile müşteri odaklı web uygulamaları geliştirmek, UI/UX tasarımcılarıyla iş birliği yapmak, performans optimizasyonu ve test yazımı konularında çalışmak için deneyimli frontend geliştirici arıyoruz.",
    requirements: [
      "React, Next.js ve TypeScript deneyimi (min. 2 yıl)",
      "HTML, CSS, Tailwind CSS bilgisi",
      "Git ve versiyon kontrolü tecrübesi",
      "REST API ve GraphQL entegrasyonu",
      "Responsive tasarım bilgisi",
    ],
    benefits: [
      "Özel sağlık sigortası",
      "Yemek kartı",
      "Esnek çalışma saatleri",
      "Hibrit model (2 gün home office)",
      "Eğitim bütçesi",
    ],
    logoColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "j-2",
    title: "Üretim Mühendisi",
    company: "Gebze Otomotiv Sanayi",
    location: "Güzeller OSB, Gebze",
    type: "tam-zamanli",
    category: "muhendislik",
    salary: "35.000 - 55.000 TL",
    postedDate: "2026-04-11T14:30:00",
    applicants: 52,
    experience: "3-5 yıl",
    description:
      "Otomotiv yan sanayi firmamızda üretim süreçlerinin iyileştirilmesi, kalite kontrolü ve vardiya planlaması için üretim mühendisi.",
    requirements: [
      "Makine/Endüstri Mühendisliği lisans",
      "Otomotiv sektörü deneyimi",
      "Lean Manufacturing bilgisi",
      "İyi derecede İngilizce",
      "Vardiyalı çalışmaya uygun",
    ],
    benefits: ["Servis", "Yemek", "Özel Sigorta", "Prim Sistemi"],
    logoColor: "from-orange-500 to-red-600",
  },
  {
    id: "j-3",
    title: "Satış Temsilcisi (Bölge)",
    company: "Marmara Tekstil",
    location: "Gebze, Kocaeli",
    type: "tam-zamanli",
    category: "satis",
    salary: "Prim + 25.000 TL baz",
    postedDate: "2026-04-12T09:45:00",
    applicants: 38,
    experience: "1-3 yıl",
    description:
      "Müşteri portföyü yönetimi, yeni müşteri kazanımı ve satış hedeflerine ulaşmak için saha satış temsilcisi arıyoruz.",
    requirements: [
      "Lise / Önlisans mezunu",
      "Ehliyet (aktif kullanım)",
      "B2B satış deneyimi tercih sebebi",
      "Seyahate engeli olmayan",
    ],
    benefits: ["Araç Tahsisi", "Yakıt Kartı", "Telefon", "Prim"],
    logoColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "j-4",
    title: "Muhasebe Uzmanı",
    company: "Kıbrıs Finans Danışmanlık",
    location: "Gebze Merkez",
    type: "tam-zamanli",
    category: "muhasebe",
    salary: "30.000 - 45.000 TL",
    postedDate: "2026-04-10T16:00:00",
    applicants: 64,
    experience: "3-7 yıl",
    description:
      "E-fatura, e-defter, ön muhasebe, KDV, gelir vergisi beyanname hazırlama konularında deneyimli muhasebe uzmanı.",
    requirements: [
      "İİBF / Maliye / İşletme lisans",
      "Logo / Mikro / Luca gibi programlar",
      "SMMM Stajı tercih sebebi",
      "İleri düzey Excel",
    ],
    benefits: ["Yemek Kartı", "Servis"],
    logoColor: "from-violet-500 to-purple-600",
  },
  {
    id: "j-5",
    title: "Kalite Kontrol Uzmanı (Staj)",
    company: "TÜBİTAK MAM",
    location: "Gebze",
    type: "staj",
    category: "muhendislik",
    salary: "Asgari ücret",
    postedDate: "2026-04-09T11:00:00",
    applicants: 112,
    experience: "Öğrenci / Yeni Mezun",
    description:
      "TÜBİTAK MAM Malzeme Enstitüsü'nde metalurji ve malzeme mühendisliği stajı. 3 ay süreli, ücretli.",
    requirements: [
      "Mühendislik öğrencisi (3./4. sınıf)",
      "Laboratuvar çalışmasına uygun",
      "İyi derecede İngilizce",
    ],
    benefits: ["Staj Sertifikası", "Yemek", "Servis"],
    logoColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "j-6",
    title: "Hemşire",
    company: "Gebze Yaşam Hastanesi",
    location: "Gebze",
    type: "tam-zamanli",
    category: "saglik",
    salary: "28.000 - 38.000 TL",
    postedDate: "2026-04-13T07:00:00",
    applicants: 21,
    experience: "Deneyim tercih sebebi",
    description:
      "Özel hastanemizin poliklinik bölümünde görev alacak, hasta iletişimi güçlü hemşire arıyoruz.",
    requirements: [
      "Hemşirelik lisans / önlisans",
      "Diploma ve kimlik",
      "Vardiyalı çalışmaya uygun",
    ],
    benefits: ["Özel Sigorta", "Yemek", "Lojman İmkanı"],
    logoColor: "from-rose-500 to-pink-600",
  },
  {
    id: "j-7",
    title: "İngilizce Öğretmeni (Yarı Zamanlı)",
    company: "Gebze Dil Akademisi",
    location: "Gebze Merkez",
    type: "yari-zamanli",
    category: "egitim",
    salary: "Ders başı 300 - 500 TL",
    postedDate: "2026-04-08T13:20:00",
    applicants: 15,
    experience: "1+ yıl",
    description:
      "Lise ve üniversite hazırlık öğrencilerine İngilizce dersleri verecek yarı zamanlı öğretmen.",
    requirements: [
      "C1 seviye İngilizce",
      "Öğretmenlik / Dil Edebiyat mezunu",
      "Hafta içi akşam & hafta sonu müsait",
    ],
    benefits: ["Esnek Saat", "Yemek"],
    logoColor: "from-amber-500 to-orange-600",
  },
  {
    id: "j-8",
    title: "Senior Backend Developer (Uzaktan)",
    company: "İstanbul Yazılım",
    location: "Uzaktan (Türkiye)",
    type: "uzaktan",
    category: "yazilim",
    salary: "80.000 - 130.000 TL",
    postedDate: "2026-04-14T09:30:00",
    applicants: 89,
    experience: "5+ yıl",
    description:
      "Node.js / Go ile yüksek trafikli servisler geliştirecek, mikroservis mimarisi konusunda deneyimli backend mühendisi.",
    requirements: [
      "Node.js veya Go deneyimi (5+ yıl)",
      "PostgreSQL, Redis",
      "Docker, Kubernetes",
      "CI/CD, test otomasyonu",
      "Akıcı İngilizce",
    ],
    benefits: ["Tam Uzaktan", "Özel Sigorta", "Eğitim Bütçesi", "Ekipman"],
    logoColor: "from-indigo-500 to-purple-700",
  },
];
