@AGENTS.md

# Gebzem — Proje Rehberi

> Bu dosya tüm proje bağlamını özetler. Her Claude Code oturumu başlangıcında otomatik yüklenir. **Yeni özellik eklerken / hata düzeltirken önce bu dosyayı oku.**

---

## 📖 Proje Özeti

**Gebzem**, Gebze (Kocaeli) şehrine özel bir **tam özellikli şehir rehberi prototipi**. 3 farklı arayüz:

1. **Kullanıcı Uygulaması (Mobile PWA)** — son kullanıcılar için — tarihi yerler, harita, etkinlik, yemek siparişi, market, alışveriş, ilan, iş ilanı, AI asistan, rezervasyon, randevu, mesajlaşma
2. **Admin Paneli (Web)** — platform yöneticisi için — işletme onayları, kullanıcı yönetimi, içerik moderasyonu, istatistikler
3. **İşletme Paneli (Web)** — 10 farklı işletme türü için — menü, rezervasyon, randevu, ürün, stok, kampanya, sipariş, ilan yönetimi, müşteri mesajlaşması

**Amaç:** Müşteriye sunulacak tam profesyonel bir **mockup/prototip**. Backend henüz yok — tüm veri statik veya `localStorage` tabanlı.

**Sahibi:** `aksedigitalg <info@aksedigital.com>`
**Repo:** https://github.com/aksedigitalg/gebzm-app
**Deploy:** DigitalOcean (138.68.69.122) — nginx + PM2 + Let's Encrypt, domain: https://gebzem.app

---

## 🔧 Teknoloji Stack

| Katman | Teknoloji | Notlar |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Turbopack kullanılmıyor, Webpack |
| Dil | **TypeScript** strict | Type güvenli |
| Styling | **Tailwind CSS v4** | `@theme inline`, CSS variables, no config file |
| UI Ikonları | **lucide-react** | Sadece 2D, emoji yok (kural) |
| Harita | **Leaflet + react-leaflet** | Dynamic import (SSR kapalı) |
| Harita Tiles | **CartoDB Positron** | Açık gri tema, attribution gizli (prototip için) |
| Font | **Geist Sans + Geist Mono** | Google Fonts, next/font |
| Paket | **npm** | package-lock.json kontrollü |
| Deploy | **Vercel** | Her `git push` otomatik deploy |
| PWA | Manifest + SVG ikon | Service worker YOK |

**Önemli Not:** `AGENTS.md` projenin Next.js sürümünün breaking değişiklikler içerdiğini belirtir. Herhangi bir API kullanırken `node_modules/next/dist/docs/` kontrol et. Örneğin:
- `dynamic(import, { ssr: false })` — Server Component'te çalışmaz, client wrapper gerekir (`MapWrapper.tsx` pattern'i)
- `searchParams` ve `params` — **Promise** olarak gelir, `await` ile çözülür
- `viewport` metadata'dan ayrıldı → `export const viewport: Viewport = {...}`

---

## 🏗️ Mimari Genel Bakış

### Tek Repo, Üç Dünya

```
┌─────────────────────────────────────────┐
│          GEBZEM (Next.js App)            │
│                                          │
│  ┌──────────┬──────────┬───────────┐    │
│  │ Mobile   │  Admin   │  Business │    │
│  │ PWA      │  Panel   │  Panel    │    │
│  │ (user)   │  (web)   │  (web)    │    │
│  └──────────┴──────────┴───────────┘    │
│                                          │
│  Shared: components, data, lib, utils    │
└─────────────────────────────────────────┘
```

### 3-Katmanlı Auth İzolasyonu

Her katman **ayrı localStorage session** kullanır, birbirine karışmaz:
- `gebzem_user` → kullanıcı oturumu
- `gebzem_admin` → admin oturumu
- `gebzem_business` → işletme oturumu

**Route Isolation:**
- `AuthProvider` (user auth) **sadece mobile rotalara müdahale eder**
- `/admin/*` ve `/isletme/*` → AuthProvider atlanır, kendi layout'larında kendi auth mantıkları var
- `AppShell` panel rotalarında bottom nav göstermez

**Kritik Bypass Koduna Bak:** `components/AppShell.tsx`, `components/AuthProvider.tsx`, `lib/panel-auth.ts`

---

## 🔐 Auth Sistemi

### 1. Kullanıcı (Mobile User)

**Flow:**
```
İlk açılış → /onboarding (3 slide) → /giris → Ana sayfa
Çıkış yapınca → /giris
Yeni deploy olunca (BUILD_ID değişir) → onboarding tekrar 1 kere
```

**Dosyalar:**
- `lib/auth.ts` — `getUser`, `setUser`, `clearUser`, `isOnboarded`, `setOnboarded`, `syncBuildVersion`, `isAuthRoute`
- `components/AuthProvider.tsx` — context, rota koruma, flash önleme
- `app/onboarding/page.tsx`, `app/giris/page.tsx`, `app/kayit/page.tsx`, `app/sifremi-unuttum/page.tsx`

**Build ID Sistemi:**
- `next.config.ts` → `NEXT_PUBLIC_BUILD_ID = Date.now().toString()` her build'de yeni
- `syncBuildVersion()` → localStorage'daki build ID ≠ güncel → onboarded flag sıfırlanır
- Yani **her deploy sonrası onboarding 1 kere gösterilir**, sonra kaybolur

**Mock Kabul:**
- OTP: herhangi 6 hane
- Şifre: min 4 karakter
- Telefon: 10 hane TR formatı

### 2. Admin

**Flow:** `/admin/giris` → session set → `/admin` dashboard

**Dosyalar:**
- `lib/panel-auth.ts` — `AdminSession`, `getAdminSession`, `setAdminSession`, `clearAdminSession`, `isAdminRoute`
- `app/admin/layout.tsx` — session kontrol, login yoksa `/admin/giris`'e, login varsa children

**Mock:** Herhangi email/şifre kabul.

### 3. İşletme (Business)

**Flow:** `/isletme/giris` → tür seçimi + session set → `/isletme` dashboard

**Dosyalar:**
- `lib/panel-auth.ts` — `BusinessSession`, `getBusinessSession`, `setBusinessSession`, `clearBusinessSession`, `isBusinessRoute`
- `lib/business-types.ts` — 10 tür config, 12 modül kaydı
- `app/isletme/layout.tsx` — session kontrol + **dinamik sidebar**

**BusinessSession:**
```ts
{ id: string; name: string; type: BusinessTypeId; email: string }
```

`type` alanı kritik: `restoran | yemek | kafe | market | magaza | doktor | kuafor | usta | emlakci | galerici`. Bu değere göre sidebar ve dashboard dinamik render edilir.

---

## 👤 Kullanıcı Uygulaması (Mobile PWA)

### Ana Sayfalar

| Rota | Amaç |
|---|---|
| `/` | Ana sayfa — HomeHeader + hero + hızlı servisler + öne çıkanlar + etkinlikler |
| `/onboarding` | 3 slide tanıtım |
| `/giris`, `/kayit`, `/sifremi-unuttum` | Auth akışı |
| `/profil` | Kullanıcı profili — avatar + ayarlar + çıkış + "İşletmenizi Ekleyin" promo |
| `/profil/mesajlar` | Kullanıcı-işletme konuşma listesi |
| `/profil/mesajlar/[id]` | Tek konuşma chat ekranı |
| `/kategoriler` | 9 kategori grid (Gebzem AI, Yemek, Restoran, vb.) |
| `/harita` | Leaflet, POI marker'ları, alt kart kaydırıcı, zoom kontrolleri yok |
| `/harita?servis=X` | Hızlı servis POI'leri (eczane, ATM, benzinlik, vb.) |
| `/gezilecek` | Tarihi/doğa yerleri listesi |
| `/gezilecek/[slug]` | Yer detayı |
| `/etkinlikler` + `/etkinlikler/[id]` | Etkinlik liste + detay |
| `/ulasim` | Marmaray, YHT, otobüs, feribot |
| `/rehber` | Restoran, kafe, AVM, hastane, market |
| `/acil` | Acil numaralar |
| `/hakkinda` | Proje hakkında |
| `/ai` | **Gebzem AI chat** — hazır Gebze cevapları |

### Kategori Sayfaları (Kullanıcı)

Kategoriler sayfasından erişilen tam mockup sayfaları:

| Rota | Ne Yapar |
|---|---|
| `/yemek` + `/yemek/[slug]` | Migros Yemek tarzı — restoranlar + menü |
| `/restoran` + `/restoran/[slug]` | Dine-in mekanlar + rezervasyon |
| `/market` | Migros/Şok tarzı market — kampanya slider, kategori, ürünler |
| `/alisveris` + `/alisveris/[kategori]` + `/alisveris/urun/[id]` | Hepsiburada tarzı |
| `/hizmetler` + `/hizmetler/[slug]` | Armut.com tarzı — usta, kuaför, doktor |
| `/ilanlar` + `/ilanlar/[id]` | Sahibinden tarzı — emlak, vasıta, vs. |
| `/is-basvurusu` + `/is-basvurusu/[id]` | Kariyer.net tarzı — iş ilanları |

### Bottom Nav (6 öğe)

`Ana Sayfa · Kategoriler · Harita · Ara · Keşfet · Profil`

- **Ara** — sekme değil, `SearchSheet` popup açar
- `/ai`, `/onboarding`, auth sayfalarında **gizlenir**

### Özel UI Bileşenleri (user-only)

- **`HomeHeader`** — avatar, zaman-bazlı selamlama (günaydın/iyi günler/akşamlar/geceler) + ikon, bildirim + arama
- **`SearchSheet`** — iPhone-stili bottom sheet, **her yerden drag-to-close**, global arama (mekan + etkinlik + rehber + acil)
- **`BusinessActions`** — restoran/hizmet detayda "Rezervasyon/Randevu" + "Soru Sor" sticky bar
- **`Dialog`** — ortak bottom sheet modal
- **`ZoomLock`** — iOS gesture + double-tap zoom engelleme (harita muaf)
- **`BottomNav`** — sabit alt menü
- **`MapWrapper` + `MapView`** — dynamic import pattern (SSR off for Leaflet)

---

## 🛡️ Admin Paneli (`/admin/*`)

**Tasarım:** Koyu tema login → aydınlık dashboard. Sol sidebar + üst arama bar.

### Sayfalar

| Rota | İçerik |
|---|---|
| `/admin/giris` | Koyu tema login |
| `/admin` | Dashboard — 4 stat kart, line/bar chart, son aktivite, hızlı işlemler |
| `/admin/isletmeler` | Tüm işletmeler tablosu — onay bekleyenler üstte ✓/✗ |
| `/admin/kullanicilar` | 10 demo kullanıcı, aktif/pasif/engelli |
| `/admin/ilanlar` | Sahibinden ilanları — raporlanmışlar highlight |
| `/admin/isler` | İş ilanları listesi |
| `/admin/etkinlikler` | Etkinlik kart grid, düzenle/sil, yeni ekle |
| `/admin/mesajlar` | Destek mesajları — öncelik etiketli (yüksek/normal/düşük) |
| `/admin/mekanlar` | POI'ler — hızlı servisler + gezilecek yerler tablosu |
| `/admin/ayarlar` | Platform ayarları — genel, bildirim, güvenlik, komisyon |

**Sidebar Nav:** `app/admin/layout.tsx` içinde `navItems` sabit (işletme paneli gibi dinamik değil).

---

## 🏪 İşletme Paneli (`/isletme/*`)

**Kritik Özellik:** **10 farklı işletme türü**, her biri kendi özel modüllerini görür. Giriş sırasında tür seçilir (`BusinessTypeId`).

### Business Type Config

`lib/business-types.ts` içinde:

```ts
businessTypes: Record<BusinessTypeId, BusinessTypeConfig>
```

Her config'te:
- `label` (görünür etiket)
- `description`
- `icon` (Lucide)
- `color` (Tailwind gradient sınıfları — `from-X to-Y`)
- `modules: ModuleId[]` — bu tür hangi özel modüllere erişir

### 10 İşletme Türü

| ID | Etiket | Özel Modüller |
|---|---|---|
| `restoran` | Restoran | `menu` + `rezervasyonlar` |
| `yemek` | Yemek (Teslimat) | `menu` + `siparisler` |
| `kafe` | Kafe / Pastane | `menu` + `rezervasyonlar` |
| `market` | Market | `urunler` + `kampanyalar` + `siparisler` |
| `magaza` | Mağaza | `urunler` + `kampanyalar` + `siparisler` |
| `doktor` | Doktor / Klinik | `randevular` + `hizmetler` + `hastalarim` |
| `kuafor` | Kuaför / Berber | `hizmetler` + `randevular` |
| `usta` | Usta | `hizmetler` + `talepler` |
| `emlakci` | Emlakçı | `emlak-ilanlari` + `portfoy` |
| `galerici` | Galerici (Oto) | `vasita-ilanlari` |

### Ortak Modüller (Herkes Görür)

Tüm türlerde her zaman bulunan sidebar item'ları (`buildNav` fonksiyonunda sabit):
- Dashboard
- İşletme Profilim (`/isletme/profil`)
- **... type-specific modules ...**
- İş İlanlarım (`/isletme/ilanlar`) + `/isletme/ilanlar/yeni` (personel aramak için)
- Müşteri Mesajları (`/isletme/mesajlar`)
- Yorumlar (`/isletme/yorumlar`)
- İstatistikler (`/isletme/istatistik`)
- Ayarlar (`/isletme/ayarlar`)

### Tüm İşletme Sayfaları

```
/isletme
├── giris/                    # Tür seçimli login
├── layout.tsx                # Dinamik sidebar
├── page.tsx                  # Dashboard (türe duyarlı widgetlar)
├── profil/                   # İşletme bilgileri düzenle
├── menu/                     # Restoran/yemek/kafe (menü ürünleri)
├── rezervasyonlar/           # Restoran/kafe
├── randevular/               # Doktor/kuaför
├── hizmetler/                # Doktor/kuaför/usta (sundukları hizmetler)
├── hastalarim/               # Doktor
├── urunler/                  # Market/mağaza (stok yönetimi)
├── kampanyalar/              # Market/mağaza
├── siparisler/               # Yemek/market/mağaza (online sipariş yönetimi)
├── talepler/                 # Usta (gelen hizmet talepleri, teklif ver)
├── emlak-ilanlari/           # Emlakçı
├── portfoy/                  # Emlakçı (analiz + komisyon)
├── vasita-ilanlari/          # Galerici
├── ilanlar/                  # İş ilanları (ortak)
│   └── yeni/                 # İş ilanı verme formu (canlı önizleme ile)
├── mesajlar/                 # Müşteri chat (2-panel)
├── yorumlar/                 # Yıldız dağılımı + yanıtla
├── istatistik/               # Detaylı analiz
└── ayarlar/                  # Hesap, fatura, abonelik
```

### Dinamik Dashboard

`app/isletme/page.tsx` içinde `getDashboardConfig(typeId)` → her tür için farklı stat kartları, "yaklaşan" liste başlığı, link.

Örnek:
- **Doktor:** "Bugünkü Randevu", "Hasta Sayısı", "Yeni Mesaj", "Aylık Gelir"
- **Market:** "Bugünkü Sipariş", "Stok Uyarısı", "Aktif Kampanya", "Günlük Gelir"
- **Emlakçı:** "Aktif İlan", "Bu Ay Satış/Kira", "Gelen Başvuru", "Aylık Komisyon"

---

## 📂 Dosya Yapısı (Özet)

```
app/
├── (mobile user routes — 30+ sayfa)
├── admin/                    # Admin paneli
├── isletme/                  # İşletme paneli (dinamik)
├── layout.tsx                # Root — AuthProvider + SearchProvider + AppShell
├── globals.css               # Tema, scrollbar gizleme, touch-action
└── page.tsx                  # Ana sayfa (user home)

components/
├── AppShell.tsx              # Rota tipine göre farklı shell
├── AuthProvider.tsx          # User auth context + rota koruma
├── SearchProvider.tsx        # Search sheet context
├── SearchSheet.tsx           # iPhone-stili global arama
├── BottomNav.tsx             # 6 öğeli alt menü
├── HomeHeader.tsx            # Avatar + greeting
├── BusinessActions.tsx       # Rezervasyon/randevu/soru modalı
├── Dialog.tsx                # Generic bottom sheet modal
├── ZoomLock.tsx              # iOS zoom engelleyici
├── MapView.tsx + MapWrapper.tsx  # Leaflet wrapper
├── PageHeader.tsx            # Sticky sayfa başlığı + back button
├── StepIndicator.tsx         # Onboarding/multi-step progress
├── OtpInput.tsx              # 6 haneli OTP
├── PhoneInput.tsx, PasswordInput.tsx
└── panel/
    ├── PanelShell.tsx        # Admin + işletme için sidebar + topbar
    ├── StatCard.tsx          # Dashboard stat kartı
    └── SimpleChart.tsx       # BarChart + LineChart (pure SVG)

data/
├── places.ts                 # 8 Gebze tarihi/doğa yeri
├── events.ts                 # 6 etkinlik
├── transport.ts              # Marmaray, YHT, otobüs, feribot
├── guide.ts                  # Rehber (restoran, kafe, hastane)
├── emergency.ts              # Acil numaralar
├── services.ts               # POI servisleri (eczane, ATM, vb.)
├── food.ts                   # Yemek teslimat restoranları + menüleri
├── restaurants.ts            # Dine-in restoranlar
├── providers.ts              # Hizmet sağlayıcıları + doktorlar (Service Categories)
├── classifieds.ts            # Sahibinden tarzı ilanlar
├── jobs.ts                   # İş ilanları (Kariyer.net)
├── market.ts                 # Market ürünleri + kampanyalar
├── shopping.ts               # Alışveriş kategori + ürünleri
└── home-sections.ts          # Hızlı servisler + kategoriler (home için)

lib/
├── auth.ts                   # Kullanıcı auth + build ID senkronizasyonu
├── panel-auth.ts             # Admin + işletme session helpers
├── business-types.ts         # 10 tür × 12 modül config — kritik dosya
├── messages.ts               # localStorage tabanlı konuşma yönetimi
├── ai-responses.ts           # Hazır Gebze AI cevapları (12 kural + fallback)
├── greeting.ts               # Zaman bazlı selamlama helper
├── format.ts                 # formatTRY, timeAgoTR
└── utils.ts                  # cn (Tailwind merge), formatDateTR

public/
├── manifest.json             # PWA manifest
├── icon.svg, icon-192.svg, icon-512.svg
└── favicon.ico
```

---

## 🎨 Tasarım Sistemi

### Renk Paleti (globals.css)

CSS custom properties + Tailwind `@theme inline`:

```css
--primary: #0e7490 (koyu turkuaz)
--secondary: #10b981 (zümrüt)
--accent: #0891b2
--background: #f8fafc (light) / #0b1220 (dark)
--card: #ffffff / #111a2e
--foreground: #0f172a / #e2e8f0
--border: #e2e8f0 / #1e293b
```

### Tipografi
- **Font:** Geist Sans (body), Geist Mono (code)
- Başlıklar: `text-2xl font-bold` (h1), `text-sm font-semibold uppercase tracking-wider` (section label)
- Body: `text-sm` (default), `text-xs` (small), `text-[11px]` (micro)

### Yatay Boşluk — **Tek Kural: 20px (px-5)**

**Bu kritik.** Her sayfa wrapper'ı `px-5` kullanır. Tutarlılığı bozma.

- Ana uygulama sayfaları: `px-5 pb-6 pt-4`
- Auth sayfaları: `px-5 pt-X` + `style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}`
- PageHeader içi: `px-5`
- Yatay kaydırıcılar: `-mx-5 scroll-pl-5 scroll-pr-5 ... first:ml-5 last:mr-5` (WebKit padding bug'ı için **margin pattern**)

### Alt Menü Boşluğu

Ana sayfa son içerik ↔ alt nav: **5px** (`calc(76px + env(safe-area-inset-bottom, 0px) + 5px)`)

### Mobile Yüksekliği

- **`h-[100svh]`** auth sayfalarında (sabit, oynamaz)
- **`min-h-[100dvh]`** body'de
- `overflow-hidden + overscroll-behavior:none` elastic bounce kilidi

### iOS Özel Kurallar

- Tüm input'lar `font-size: 16px` (zoom engellemek için, `globals.css`'te global)
- `user-scalable: false, maximum-scale: 1` (viewport meta)
- `ZoomLock` komponenti gesture + double-tap engelliyor
- `touch-action: manipulation` html/body'de
- **Leaflet muaf** — `.leaflet-container { touch-action: none }` override

### Yatay Scroller Pattern (ÖNEMLİ)

WebKit (iOS Safari) scroll container'ında **padding-left** bazen yok sayılır. O yüzden **margin tabanlı** kullan:

```tsx
<div className="-mx-5 flex gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 no-scrollbar">
  {items.map((it, i) => (
    <Card className="first:ml-5 last:mr-5 ..." />
  ))}
</div>
```

**Kaç yerde bu pattern var:** ana sayfa (hızlı servisler, öne çıkanlar), gezilecek filtreler, rehber filtreler, yemek filtreler, market kampanya, market kategori, ilanlar filtreler, is-basvurusu filtreler.

---

## 📊 Data Layer

### Yaklaşım

**Backend YOK.** Tüm veri iki kaynaktan:

1. **Statik TypeScript dosyaları** (`data/*.ts`) — Next.js build'de prerender edilir, CDN'den servis edilir
2. **localStorage** — kullanıcı state, oturum, mesajlar

### Önemli Dosyalar

| Dosya | İçerik |
|---|---|
| `data/places.ts` | `Place[]` — 8 Gebze lokasyonu (Çoban Paşa, Hannibal, Eskihisar, vb.) |
| `data/services.ts` | `MapPoint[]` — 40+ POI (eczane/ATM/benzinlik/vs), `getServicePoints(type)` |
| `data/food.ts` | `FoodRestaurant[]` + `MenuItem[]` — 7 restoran, kategori filtreli |
| `data/restaurants.ts` | `DineInRestaurant[]` — 6 dine-in |
| `data/providers.ts` | `ServiceProvider[]` + `ServiceCategory[]` — tesisatçı, kuaför, doktor (11 tür + 11 sağlayıcı) |
| `data/classifieds.ts` | `Classified[]` — 8 ilan × 6 kategori |
| `data/jobs.ts` | `JobListing[]` — 8 iş ilanı |
| `data/market.ts` | `MarketProduct[]` + `MarketCampaign[]` — 30+ ürün, 9 kategori |
| `data/shopping.ts` | `ShopProduct[]` + `ShopCategory[]` — 8 mega kategori + alt kategoriler |
| `data/events.ts` | `CityEvent[]` — 6 etkinlik |
| `data/transport.ts` | `TransportLine[]` — Marmaray/YHT/otobüs/feribot |
| `data/emergency.ts` | `EmergencyContact[]` — 112, polis, itfaiye, hastane |
| `data/guide.ts` | `GuideItem[]` — 7 rehber mekanı |
| `data/home-sections.ts` | `quickServices` + `homeCategories` — home page satırları |

### localStorage Anahtarları

```
gebzem_user           → AuthUser
gebzem_onboarded      → "1" | null
gebzem_build_id       → BUILD_ID (deploy tespit için)
gebzem_admin          → AdminSession
gebzem_business       → BusinessSession
gebzem_conversations  → Conversation[] (mesajlar)
```

### Mesajlar Sistemi

`lib/messages.ts`:
- `getConversations()`, `getConversation(id)`, `addConversation(params)`, `appendMessage(id, text)`
- 2 seed konuşma ilk açılışta otomatik eklenir (Gebze Mangal rezervasyonu, Berna Kuaför randevusu)
- Kullanıcı mesaj gönderince 1.5s sonra sahte işletme yanıtı gelir
- `window.dispatchEvent(new Event('gebzem-messages-update'))` → canlı güncelleme

---

## 🔗 Routing Map (Hepsi)

### Public / User
```
/                         Ana sayfa
/onboarding               3 slide tanıtım
/giris, /kayit, /sifremi-unuttum   Auth
/profil                   Kullanıcı profili
/profil/mesajlar          Konuşma listesi
/profil/mesajlar/[id]     Tek konuşma chat
/kategoriler              Kategori grid
/harita                   Harita (yer?servis paramı)
/gezilecek                Tarihi yerler listesi
/gezilecek/[slug]         Yer detayı
/etkinlikler              Etkinlik listesi
/etkinlikler/[id]         Etkinlik detayı
/ulasim                   Ulaşım bilgisi
/rehber                   Rehber listesi
/acil                     Acil numaralar
/hakkinda                 Hakkında
/ai                       AI chat
/yemek + /yemek/[slug]    Yemek teslimat + menü
/restoran + /restoran/[slug]
/market                   Market ürünleri
/alisveris                Mega kategoriler
/alisveris/[kategori]     Kategori ürünleri
/alisveris/urun/[id]      Ürün detay
/hizmetler + /hizmetler/[slug]
/ilanlar + /ilanlar/[id]
/is-basvurusu + /is-basvurusu/[id]
```

### Admin
```
/admin/giris
/admin                    Dashboard
/admin/isletmeler
/admin/kullanicilar
/admin/ilanlar
/admin/isler
/admin/etkinlikler
/admin/mesajlar
/admin/mekanlar
/admin/ayarlar
```

### İşletme
```
/isletme/giris            (tür seçici)
/isletme                  Dashboard (türe duyarlı)
/isletme/profil
/isletme/menu
/isletme/rezervasyonlar
/isletme/randevular
/isletme/hizmetler
/isletme/hastalarim
/isletme/urunler
/isletme/kampanyalar
/isletme/siparisler
/isletme/talepler
/isletme/emlak-ilanlari
/isletme/portfoy
/isletme/vasita-ilanlari
/isletme/ilanlar + /isletme/ilanlar/yeni  (iş ilanı yönetimi)
/isletme/mesajlar
/isletme/yorumlar
/isletme/istatistik
/isletme/ayarlar
```

---

## 🧩 Component Kütüphanesi

### Shell Komponentleri
- **`AppShell`** — Rota tipine göre (user / auth / ai / panel) farklı layout render eder
- **`PanelShell`** — Admin + işletme için ortak sidebar + topbar (collapsible mobile)
- **`PageHeader`** — Sticky top, başlık + altbaşlık + back button

### Auth/Form Komponentleri
- **`AuthProvider`** — Client context, rota koruma, flash prevention
- **`StepIndicator`** — Multi-step progress dot
- **`OtpInput`** — 6 kutu, auto-focus, paste desteği
- **`PhoneInput`** — +90 prefix, TR format
- **`PasswordInput`** — show/hide toggle

### UI Komponentleri
- **`BottomNav`** — Mobile alt menü (hiding rules var)
- **`HomeHeader`** — Avatar + greeting + bildirim + arama
- **`SearchProvider` + `SearchSheet`** — Global arama popup (her yerden drag)
- **`BusinessActions`** — Restoran/hizmet detayında sticky CTA + rezervasyon/randevu/soru modalları
- **`Dialog`** — Generic bottom sheet
- **`ZoomLock`** — iOS gesture engelleyici

### Map Komponentleri
- **`MapWrapper`** — Client wrapper, dynamic import MapView, alt kart kaydırıcı
- **`MapView`** — Leaflet MapContainer, markers, popups, flyTo focus

### Panel Komponentleri
- **`StatCard`** — Gradient ikon + label + value + trend
- **`BarChart`** — CSS-based bar chart
- **`LineChart`** — Pure SVG line + area fill

---

## 📐 Kodlama Konvansiyonları

### 1. Dosya Düzeni

```tsx
"use client"; // if needed

import { ... } from "next/...";
import { ... } from "lucide-react";
import { ... } from "@/components/...";
import { ... } from "@/lib/...";
import { ... } from "@/data/...";

// types / interfaces
// constants
// main export
// sub-components (small helper functions)
```

### 2. Client/Server

- `"use client"` **sadece gerekliyse** (state, effect, router, event handler)
- Data-fetch olmayan static sayfalar server component kalabilir
- Dynamic route params **Promise** olarak gelir: `params: Promise<{ slug: string }>` → `const { slug } = await params`
- `searchParams` da **Promise**

### 3. Styling

- Tailwind **arbitrary value** izinli (`w-[72vw]`, `pb-[18px]`, vs.)
- Custom CSS variables kullan (`bg-primary`, `text-muted-foreground`)
- Gradient'lar için `from-X to-Y` string format (config'te saklanabilir)
- Koşullu sınıflar için `cn()` helper (tailwind-merge + clsx)

### 4. Metinler

- **Tümü Türkçe** (UI, data, mesajlar)
- **Emoji kullanma** (UI kuralı — sadece Lucide ikonları)
- Tutarlı terminoloji: "Onayla/Reddet", "Aktif/Pasif", "Kaydet/İptal"

### 5. İkonlar

- Sadece **lucide-react**. Emoji kullanma.
- `h-4 w-4` (küçük), `h-5 w-5` (normal), `h-6 w-6` (büyük başlık)
- `strokeWidth={1.75}` default, `strokeWidth={2.25}` active state

### 6. Responsive

- Mobile-first (default)
- Breakpointler: `sm:` 640, `md:` 768, `lg:` 1024
- Panel sayfalarında sidebar `lg:` altında collapsible
- `max-w-3xl` kullanıcı uygulamasında 768px desktop sınırı

---

## ⚡ Geliştirme İş Akışı

### Komutlar

```bash
npm run dev       # Next dev server (localhost:3000)
npm run build     # Production build test
npx tsc --noEmit  # Type check
```

### Commit Konvansiyonu

Kısa, iş odaklı, Türkçe. Karakterler ASCII (Windows Git encoding için).

```
feat: alt menu revizyonu + harita tam ekran
fix: arama popup drag-down kapatma
chore: trigger rebuild
```

### Git Credentials

- `aksedigitalg <info@aksedigital.com>` kullan
- Windows Git Credential Manager kayıtlı — terminal'den push sessiz gider
- Eski stale credentials silindi (`gbzqr41`, `aksedigital`, `qrlex2026`)

### Deploy

- `git push origin main` → Vercel otomatik build + deploy (~1-2 dk)
- `NEXT_PUBLIC_BUILD_ID` her build'de yeni (onboarding sıfırlama için)
- Build log: Vercel dashboard'dan veya commit status'tan

### Yeni Özellik Ekleme Kural Seti

1. **Önce planla, sonra yaz** — özellikle mimariye dokunan işler
2. **Data layer** ilk: `data/*.ts` yaz, demo veri koy
3. **Component** ikinci: reusable parça varsa `components/*`'a
4. **Route** son: `app/*/page.tsx`
5. **Type-safe ol** — TypeScript strict, any'den kaçın
6. **Tutarlılığa dikkat et:** px-5, bottom nav height, iOS safe-area, emoji yok kuralı
7. **Test:** `npx tsc --noEmit` sonra `npm run build` — ikisi de geçerse push

---

## 🚀 Deployment

### Vercel Setup

- **Framework:** Next.js (otomatik algılandı)
- **Build:** `next build`
- **Env Vars:** Şu an hiçbiri manuel değil (BUILD_ID next.config.ts'te)

### PWA Test

Mobile Safari / Chrome'dan Vercel URL aç → "Ana Ekrana Ekle" → standalone launch. Manifest + ikonlar → splash screen olur.

### Müşteri Sunumu

URL: `gebzm-app.vercel.app`
- `/` — kullanıcı tarafı (önce PWA yap: Ana Ekrana Ekle)
- `/admin/giris` — admin demo
- `/isletme/giris` — işletme demo (tür seç: restoran, doktor, emlakçı, vs.)

---

## ⚠️ Bilinen Sorunlar / Kısıtlar

### 1. WebKit Padding Bug
iOS Safari scroll container'ında `padding-left` yok sayılabilir. **Fix:** margin pattern (`first:ml-5 last:mr-5 scroll-pl-5`).

### 2. ESLint Uyarısı
`AuthProvider.tsx:46` — `setState in useEffect` warning. Kritik değil, performans önerisi. React 19 davranışı.

### 3. Service Worker YOK
PWA online çalışır, offline'da boş ekran. İleride `next-pwa` eklenebilir.

### 4. Backend YOK
Tüm veri statik. Kullanıcı etkileşimleri (giriş, mesaj, rezervasyon) **sadece localStorage'da**. Sayfayı tarayıcı önbelleğini temizlersen kaybolur.

### 5. Desktop Görünümü
Kullanıcı uygulaması `max-w-3xl` (768px) mobile-first. Desktop'ta iki yan boş alan. İstenirse responsive grid eklenebilir.

### 6. Leaflet Attribution
Yasal olarak production'da OpenStreetMap + CartoDB attribution görünür olmalı. **Şu an gizli** (prototip). Canlı launch'ta `attributionControl={true}` yap.

### 7. Mock OTP
Herhangi 6 hane kabul. Canlı launch'ta gerçek SMS servisi (Twilio, Netgsm) lazım.

### 8. Admin/İşletme Login
Herhangi email/şifre kabul. Backend gelince gerçek auth.

### 9. BusinessSession.type `string` tipi
Aslında `BusinessTypeId` olması gerek, ama backward compat için `string` bırakıldı. `lib/business-types.ts` içinde `getBusinessType(id)` null-safe fallback verir.

---

## 🔮 Gelecek Yol Haritası

### Kısa Vade (1-2 Hafta)
1. **Supabase Backend** — tek seferde büyük altyapı değişimi:
   - Auth (OTP, email, phone)
   - Database (users, businesses, messages, reservations, orders, listings)
   - Storage (fotoğraflar)
   - Real-time (mesajlaşma, bildirim)
2. **Push Notification** (web push + mobile push for Flutter)
3. **Gerçek AI** — OpenAI/Claude API entegrasyonu
4. **Ödeme** — iyzico/Stripe (sipariş, rezervasyon depozit)
5. **Gerçek fotoğraflar** — placeholder yerine
6. **Admin "Onay İşlemleri"** — gerçek akış

### Orta Vade (1-2 Ay)
1. **Flutter App** — kullanıcı tarafını native'e taşı (aynı Supabase backend)
2. **Offline desteği** — PWA service worker + data caching
3. **Çok Dilli** — İngilizce, Arapça (turistler için)
4. **Analytics** — Google Analytics / Plausible
5. **SEO** — meta tags, sitemap, og-image

### Uzun Vade (3+ Ay)
1. **Google Play / App Store** — Flutter üzerinden
2. **Belediye Entegrasyonu** — gerçek duyurular, sular, atık toplama
3. **Canlı Harita Verisi** — trafik, toplu taşıma real-time
4. **Gebze Business Subscription** — premium özellikler işletmelere
5. **İlan Yayınlama Paketi** — ücretli öne çıkar, foto sınırı vb.

---

## 📚 Önemli Referanslar

### İlham Alınan Uygulamalar
- **Migros Yemek / Yemeksepeti** → `/yemek`
- **Hepsiburada / Trendyol** → `/alisveris`
- **Sahibinden** → `/ilanlar`
- **Kariyer.net / LinkedIn** → `/is-basvurusu`
- **Armut.com** → `/hizmetler`
- **TripAdvisor / Foursquare** → `/restoran`
- **Google Maps** → `/harita` + alt kart kaydırıcı
- **iOS Maps Sheet** → `SearchSheet` drag davranışı

### Gebze Hakkında (data için)
- Çoban Mustafa Paşa Külliyesi (1523-1529, Mimar Sinan öncesi)
- Hannibal'in Mezarı (M.Ö. 183, Libyssa)
- Eskihisar Kalesi (Bizans, 12. yy)
- Osman Hamdi Bey Müzesi
- Ballıkayalar Tabiat Parkı
- Marmaray Gebze istasyonu
- YHT Gebze (İstanbul-Ankara hattı)

---

## 🧭 Hızlı Başvuru — Nerede Ne Var?

| "Şunu yapmak istiyorum" | Bak |
|---|---|
| Yeni sayfa ekle | `app/yeni-sayfa/page.tsx` — PageHeader + yapıyı kopyala |
| Yeni kategori ekle | `data/home-sections.ts` (home), `app/kategoriler/page.tsx` |
| Yeni işletme türü ekle | `lib/business-types.ts` + yeni modül sayfası |
| Auth mantığı değiştir | `lib/auth.ts` + `components/AuthProvider.tsx` |
| Admin yeni sayfası | `app/admin/layout.tsx` (nav array) + yeni sayfa |
| Harita pattern değiştir | `components/MapView.tsx`, `components/MapWrapper.tsx` |
| Global arama sonucu ekle | `components/SearchSheet.tsx` → `search()` fonksiyonuna yeni kaynak ekle |
| Business dashboard widget'ı | `app/isletme/page.tsx` → `getDashboardConfig(type)` case ekle |
| Yeni mesaj özelliği | `lib/messages.ts` |
| AI cevabı ekle | `lib/ai-responses.ts` → `rules` array'ine yeni keyword |

---

---

## 🏗️ Backend Mimari Planı

> Prototip tamamlandı. Sıradaki aşama: gerçek backend. Bu bölüm tüm mimari kararları ve maliyetleri içerir.

### Genel Mimari

```
Kullanıcılar (Next.js Web + Flutter Mobil)
      ↓
Cloudflare (WAF + DDoS koruması + CDN) — ücretsiz
      ↓
Hetzner Sunucular (Go API + PostgreSQL + Redis + Meilisearch)
      ↓
Cloudflare R2 (Fotoğraflar WebP + Videolar HLS) — egress ücretsiz
      ↓
OpenStreetMap API (harita/POI) + Nöbetçi Eczane API + Firebase FCM (bildirim)
```

### Teknoloji Stack

| Katman | Seçim | Alternatif Neden Değil |
|---|---|---|
| Backend API | Go + Fiber | Node.js 50K'da 3x fazla RAM |
| Veritabanı | PostgreSQL | MySQL — JSONB yok, full-text zayıf |
| Arama | Meilisearch (self-hosted) | Elasticsearch — çok ağır/pahalı |
| Cache | Redis | Fiyat karşılaştırma, session, rate limit |
| Medya storage | Cloudflare R2 | AWS S3 — egress ücretli |
| Fotoğraf format | WebP (FFmpeg) | JPEG'den %40 küçük |
| Video format | HLS segmentler (FFmpeg) | MP4 — streaming için uygun değil |
| Harita | OpenStreetMap + Overpass API | Google Maps — çok pahalı |
| Push bildirim | Firebase FCM | 50K kullanıcıya tamamen ücretsiz |
| SMS/OTP | Netgsm | Türkiye'ye özel, ucuz |
| Ödeme | iyzico | Türkiye'ye özel, kolay entegrasyon |
| Frontend | Vercel (Next.js) | Mevcut, değiştirilmiyor |
| Mobil | Flutter | Backend hazır olunca |

### Ölçek Verileri

- 50K aktif kullanıcı, 50K kayıtlı hesap
- 200K ilan × 50 fotoğraf + 1 video
- 50K kullanıcı × günde 25 ilan × 50 foto + 1 video görüntüleme
- 100 market × 500 ürün = 50K ürün, fiyat karşılaştırma
- 10K kullanıcı × günde 3-5 fiyat karşılaştırma sorgusu
- 5K+ işletme, günde 1-2 rezervasyon/randevu/teklif
- Günde 5K+ hizmet talebi bildirimi (kombim bozuldu → ustalara)

### Sunucu Aşamaları (Hetzner)

| Aşama | Kullanıcı | Sunucular | Maliyet |
|---|---|---|---|
| Aşama 1 | 0–10K | 1× CPX31 (hepsi bir arada) | €22/ay |
| Aşama 2 | 10K–30K | CPX41 API + CPX41 DB + CX22 cache | €55/ay |
| Aşama 3 | 30K–50K | 2× CPX41 API + CPX51 DB + 2× CPX31 | €136/ay |

### Aylık Toplam Maliyet

| Kalem | Aşama 1 | Aşama 2 | Aşama 3 (50K) |
|---|---|---|---|
| Hetzner sunucular | $25 | $61 | $150 |
| Cloudflare R2 storage | $5 | $40 | $83 |
| Cloudflare R2 ops (okuma) | $2 | $40 | $101 |
| Vercel Pro | $0 | $20 | $20 |
| Cloudflare Pro (WAF) | $0 | $20 | $20 |
| Nöbetçi eczane API | $20 | $20 | $20 |
| Firebase FCM | $0 | $0 | $0 |
| Domain | $1 | $1 | $1 |
| **TOPLAM (AI hariç)** | **~$53/ay** | **~$202/ay** | **~$395/ay** |

> AI (Claude Haiku) sonraki aşamada eklenecek — tahminen +$10-20/ay

### Medya İşleme Akışı

```
Kullanıcı dosya yükler
      ↓
Go API → presigned URL üretir
      ↓
Dosya direkt R2'ye yüklenir (Go API'yi bypass eder, bant genişliği kazanır)
      ↓
Go worker kuyruğu: FFmpeg ile işleme
  - Fotoğraf → WebP 1200px max, thumbnail 400px
  - Video → HLS segmentlere böl (360p + 720p)
      ↓
İşlenmiş dosyalar R2'ye taşınır
Cloudflare CDN otomatik cache'ler (egress ücretsiz)
```

### Fiyat Karşılaştırma Motoru

- PostgreSQL'de `market_products` tablosu: market_id, product_name, price, updated_at
- Redis cache: kullanıcı sepetini 30 dakika cache'le (fiyatlar sık değişmez)
- Sorgu: "Bu listedeki ürünler hangi markette en ucuz?" → GROUP BY market + SUM(price)
- Sonuç: ilk 5 market sıralaması + ürün bazlı en ucuz market listesi

### Hizmet Talebi Bildirimi (Kombim bozuldu → Ustalara)

- Kullanıcı talep oluşturur → PostgreSQL'e kaydedilir
- Go worker: ilgili kategori ustalarını sorgular
- Firebase FCM ile toplu push bildirim gönderilir
- Usta teklif verir → kullanıcıya bildirim

### Geliştirme Sırası (Backend)

1. **Go projesi kur** — Fiber, PostgreSQL bağlantısı, JWT auth
2. **Veritabanı şeması** — users, businesses, listings, products, messages, reservations
3. **Auth API** — kayıt, OTP (Netgsm), giriş, refresh token
4. **İlan API** — CRUD, fotoğraf/video upload (R2 presigned URL)
5. **Market/fiyat karşılaştırma API**
6. **Mesajlaşma API** — WebSocket (Go native)
7. **Rezervasyon/randevu/teklif API**
8. **Bildirim sistemi** — FCM entegrasyonu
9. **Next.js'i backend'e bağla** — localStorage → gerçek API
10. **Flutter** — aynı API, native mobil

---

---

## 🖥️ Sunucu Bilgileri

| Bilgi | Değer |
|---|---|
| Provider | DigitalOcean |
| Sunucu Adı | gebzem-api |
| IP | 138.68.69.122 |
| Bölge | Frankfurt (FRA1) |
| Plan | Basic $24/mo — 2 vCPU, 2GB RAM, 90GB NVMe |
| OS | Ubuntu 24.04 LTS |
| SSH | `ssh root@138.68.69.122` |

### Kurulu Servisler
- **Go 1.24.2** — `/usr/local/go/bin`
- **PostgreSQL 16** — kurulu, çalışıyor
- **Redis** — kurulu
- **Fiber v2.52.12** — Go web framework

### PostgreSQL Bilgileri
- Kullanıcı: `gebzem` / Şifre: `gebzem2026`
- Veritabanı: `gebzem_db`
- Bağlantı: `postgres://gebzem:gebzem2026@localhost:5432/gebzem_db?sslmode=disable`

### Proje Dizini ve Dosyalar
```
/opt/gebzem-api/
├── main.go          # Fiber app, DB bağlantısı, CORS, logger
├── .env             # PORT, DB_URL, REDIS_URL, JWT_SECRET
├── go.mod / go.sum
├── config/
│   └── db.go        # ConnectDB() — PostgreSQL bağlantısı
├── handlers/        # (boş — sıradaki)
├── middleware/      # (boş)
├── models/          # (boş)
└── routes/          # (boş)
```

### Komutlar
- `go run main.go` — API başlat (port 8080)
- `kill %1` — arka plandaki API'yi durdur
- `ufw allow 8080` — port zaten açık

### Önemli Not: Dosya Yazma Yöntemi
Terminale heredoc (`<< 'EOF'`) yapıştırınca bozuluyor. **Her zaman Python kullan:**
```bash
python3 << 'PYEOF'
f = open('/opt/gebzem-api/dosya.go', 'w')
f.write("""...""")
f.close()
print("OK")
PYEOF
```

### Geliştirme Sırası Durumu
- [x] DigitalOcean sunucu kuruldu (Frankfurt, $24/mo)
- [x] Ubuntu 24.04 güncellendi
- [x] Go 1.24.2 kuruldu (`/usr/local/go/bin`)
- [x] PostgreSQL + Redis kuruldu
- [x] Go projesi oluşturuldu (`go mod init gebzem-api`)
- [x] Bağımlılıklar eklendi (Fiber, JWT, pq, redis, godotenv, crypto)
- [x] main.go — Fiber app + DB bağlantısı çalışıyor
- [x] config/db.go — PostgreSQL bağlantısı OK
- [x] Veritabanı şeması oluşturuldu (users, businesses, conversations, messages, reservations, otp_codes)
- [x] DB izinleri verildi (`GRANT ALL PRIVILEGES ON ALL TABLES TO gebzem`)
- [x] handlers/auth.go — SendOTP, VerifyOTP, BusinessRegister, BusinessLogin
- [x] routes/routes.go — `/api/v1/auth/*` route'ları
- [x] models/user.go — User, Business struct'ları
- [x] Auth test edildi — OTP gönder/doğrula/JWT token çalışıyor
- [x] SSH key kuruldu (Claude Code → sunucu doğrudan bağlanabiliyor)
- [x] middleware/auth.go — JWT middleware (AuthRequired, BusinessRequired, AdminRequired)
- [x] handlers/user.go — GetMe, UpdateMe, GetConversations, StartConversation, GetMessages, SendMessage, GetMyReservations, CreateReservation
- [x] handlers/business.go — GetBusinessMe, UpdateBusinessMe, GetBusinessConversations, BusinessReplyMessage
- [x] handlers/reservation.go — CreateReservation, GetMyReservations, GetBusinessReservations, UpdateReservationStatus
- [x] routes/routes.go — /api/v1/user/* + /api/v1/business/* tüm route'lar
- [x] Systemd service kuruldu (otomatik başlatma, restart on failure)
- [x] lib/api.ts — Next.js API client (auth + user + business)
- [x] giris/page.tsx — OTP tabanlı gerçek login
- [x] kayit/page.tsx — Gerçek OTP + token akışı
- [x] isletme/giris/page.tsx — Backend login + demo fallback
- [x] Next.js frontend'i backend'e bağlandı

### SSH Key (Claude Code → Sunucu)
- Local key: `~/.ssh/gebzem`
- Bağlantı: `ssh -i ~/.ssh/gebzem root@138.68.69.122`
- Artık Claude Code direkt sunucuya bağlanıp kod yazabiliyor

### Deploy Bilgisi
- Frontend: `/opt/gebzem-web` → PM2 (gebzem-web) → port 3000
- Backend: `/opt/gebzem-api` → systemd (gebzem-api) → port 8080
- nginx → gebzem.app → / frontend, /api/ backend
- SSL: Let's Encrypt (otomatik yenileme aktif)
- Güncelleme: `cd /opt/gebzem-web && git pull && npm run build && pm2 restart gebzem-web`

### Sonraki Oturumda Devam Noktası
1. Push notification (FCM) entegrasyonu
2. Medya upload (fotoğraf yükleme - R2 presigned URL)
3. Google OAuth entegrasyonu (admin'den toggle ile aç/kapa)
4. Vercel projesi silinecek (artık DigitalOcean'da)
5. Netgsm entegrasyonu (ıslak imza sonrası)

### Tamamlanan Sistem Özeti (Son Durum)
- OTP: Twilio Verify (çalışıyor, gerçek SMS)
- Email kayıt/giriş: çalışıyor (admin toggle ile aç/kapa)
- Google OAuth: admin'de toggle var, backend henüz yok
- Profil: edit + şifre değiştir (API'ye bağlı)
- Yardım/Gizlilik/Güvenlik sayfaları: var
- Dark mode: profil sayfasında toggle (localStorage)
- Admin görünüm: renk/font/hero başlık/toggle'lar
- İlanlar: 14 ilan (emlak, vasıta, elektronik, mobilya, moda, makine)
- İş ilanları: 13 ilan
- Restoranlar: 10 dine-in restoran

---

**Son Güncelleme:** 2026-04-18 · Sistem tam çalışır durumda — OTP (Twilio Verify), profil düzenle, yardım/gizlilik/güvenlik sayfaları, dark mode toggle, admin görünüm ayarları (renk/font/toggle), daha fazla ilan/iş/restoran verisi

**Bu dosyayı her önemli özellik ekleyişte güncelle.** Özellikle: yeni route, yeni data dosyası, yeni konvansiyon, mimari değişiklik.
