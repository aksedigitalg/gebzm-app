@AGENTS.md

# Gebzem — Proje Rehberi

> Bu dosya tüm proje bağlamını özetler. Her Claude Code oturumu başlangıcında otomatik yüklenir. **Yeni özellik eklerken / hata düzeltirken önce bu dosyayı oku.**

---

## 📖 Proje Özeti

**Gebzem**, Gebze (Kocaeli) şehrine özel bir **tam özellikli şehir rehberi platformu**. 3 farklı arayüz:

1. **Kullanıcı Uygulaması** — hizmetler, ilanlar, harita, rezervasyon, randevu, anlık mesajlaşma, bildirimler
2. **Admin Paneli (Web)** — işletme onayları, kullanıcı yönetimi, platform ayarları, görünüm
3. **İşletme Paneli (Web)** — profil (logo/kapak), rezervasyon/randevu yönetimi, müşteri mesajlaşması

**Sahibi:** `aksedigitalg <info@aksedigital.com>`
**Repo:** https://github.com/aksedigitalg/gebzm-app
**Domain:** https://gebzem.app
**Admin Giriş:** `info@gebzemapp.com` / `80148014`

---

## 🔧 Teknoloji Stack

| Katman | Teknoloji | Notlar |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Turbopack kapalı, Webpack |
| Dil | **TypeScript** strict | Type güvenli |
| Styling | **Tailwind CSS v4** | `@theme inline`, CSS variables, no config file |
| Font | **Google Sans** | next/font/google |
| UI İkonları | **lucide-react** | Sadece 2D, emoji yok (kural) |
| Harita | **Leaflet + react-leaflet** | Dynamic import (SSR kapalı) |
| Backend | **Go 1.24 + Fiber v2** | Systemd ile çalışıyor |
| DB | **PostgreSQL 16** | `postgres://gebzem:gebzem2026@localhost:5432/gebzem_db` |
| Realtime | **WebSocket** | gofiber/contrib/websocket |
| SMS | **Twilio Verify** (OTP) + Netgsm (yedek) | Admin'den toggle |
| Deploy | **DigitalOcean** | PM2 (Next.js) + systemd (Go) + nginx |
| Auto-deploy | **GitHub Webhook** | `/opt/gebzem-web/deploy.sh` |

**Önemli Next.js notları:**
- `searchParams` ve `params` — **Promise** olarak gelir, `await` ile çözülür
- `viewport` metadata'dan ayrıldı → `export const viewport: Viewport = {...}`
- `dynamic(import, { ssr: false })` — Server Component'te çalışmaz (`MapWrapper.tsx` pattern'i)
- Kritik sayfalarda `export const dynamic = "force-dynamic"` (hizmetler, ana sayfa)

---

## 🏗️ Sunucu Bilgileri

| | |
|---|---|
| Provider | DigitalOcean (Frankfurt) |
| IP | 138.68.69.122 |
| SSH | `ssh -i ~/.ssh/gebzem root@138.68.69.122` |
| Next.js | `/opt/gebzem-web` — PM2 (gebzem-web) port 3000 |
| Go API | `/opt/gebzem-api` — systemd (gebzem-api) port 8080 |
| Uploads | `/var/www/uploads/` → `gebzem.app/uploads/` |
| nginx | `/etc/nginx/sites-enabled/gebzem` |
| SSL | Let's Encrypt (otomatik yenileme aktif) |

**Go API güncelle:** `cd /opt/gebzem-api && go build -o gebzem-api-bin . && systemctl restart gebzem-api`
**Next.js güncelle:** `git push origin main` → webhook otomatik deploy (~45 sn)

---

## 🔐 Auth Sistemi

### 3 Ayrı Dünya

| | localStorage Key | Token Süresi |
|---|---|---|
| Kullanıcı | `gebzem_user` | JWT 30 gün |
| İşletme | `gebzem_business` | JWT 30 gün |
| Admin | `gebzem_admin` | JWT 24 saat |

**Route Isolation:**
- `AuthProvider` sadece `/profil/*` rotalarını korur (kullanıcı)
- `/admin/*` ve `/isletme/*` → kendi layout'larında kendi auth mantıkları
- İşletme `is_approved=true` olmadan token verilmez

**OTP:** Twilio Verify — gerçek SMS. Demo kod: `111111` her zaman geçerli.
**Admin:** `info@gebzemapp.com` / `80148014` (sunucu `.env`'de, `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

---

## 📡 API Endpoint'leri

**Base URL:** `https://gebzem.app/api/v1`

### Auth
```
POST /auth/send-otp            → OTP gönder (Twilio Verify)
POST /auth/verify-otp          → OTP doğrula + JWT token
POST /auth/email/register      → Email ile kayıt
POST /auth/email/login         → Email ile giriş
POST /auth/business/register   → İşletme kayıt (admin onayı gerekir)
POST /auth/business/login      → İşletme giriş (is_approved=true zorunlu)
POST /auth/admin/login         → Admin giriş
```

### Kullanıcı (Bearer token gerekli)
```
GET/PUT  /user/me
PUT      /user/password
GET/POST /user/conversations
GET/POST /user/conversations/:id/messages
GET/POST /user/reservations
GET/POST /user/listings
PUT/DELETE /user/listings/:id
GET      /user/notifications
PUT      /user/notifications/read-all
POST     /upload              → Fotoğraf yükle (/var/www/uploads)
```

### İşletme (Bearer token gerekli)
```
GET/PUT  /business/me         → Profil (name, phone, address, description, logo_url, cover_url)
GET      /business/conversations
GET/POST /business/conversations/:id/messages
GET      /business/reservations
PUT      /business/reservations/:id/status
GET      /business/notifications
PUT      /business/notifications/read-all
```

### Public
```
GET /businesses               → Tüm onaylı işletmeler (?type=kuafor|usta|doktor)
GET /listings                 → Kullanıcı ilanları (?category=...)
GET /listings/:id
```

### Admin (Bearer token gerekli)
```
GET /admin/stats
GET /admin/users + PUT /admin/users/:id/toggle
GET /admin/businesses + PUT /admin/businesses/:id/approve
GET/POST /admin/settings
GET/PUT  /admin/profile
GET      /admin/notifications
PUT      /admin/notifications/read-all
```

### WebSocket
```
WS wss://gebzem.app/ws/conversations/:id?token=JWT → Anlık mesajlaşma
```

---

## 🗄️ Veritabanı

**Bağlantı:** `postgres://gebzem:gebzem2026@localhost:5432/gebzem_db`

### Tablolar

| Tablo | Kritik Sütunlar |
|---|---|
| `users` | phone (nullable), name, email, password_hash, auth_type |
| `businesses` | name, type, email, password_hash, phone, address, description, **logo_url, cover_url**, is_approved, is_active |
| `conversations` | user_id, business_id, last_message, updated_at |
| `messages` | conversation_id, sender_id, **sender_role** (user/business), **text** (nullable), content (nullable) |
| `reservations` | user_id, business_id, date (DATE), time (TIME), **type** (rezervasyon/randevu), **status** (bekliyor/onaylandi/reddedildi/tamamlandi), party_size, note |
| `user_listings` | user_id, title, category, price, **photos (text[])**, features (jsonb), status |
| `settings` | key, value |
| `otp_codes` | phone, code, expires_at, used |
| `notifications` | user_id, business_id, admin (bool), type, title, body, is_read |

### DB Temizleme
```sql
sudo -u postgres psql -d gebzem_db -c "
TRUNCATE user_listings, messages, conversations, reservations, otp_codes, notifications RESTART IDENTITY CASCADE;
DELETE FROM businesses;
DELETE FROM users;
"
```

---

## 📁 Dosya Yapısı

```
app/
├── page.tsx                  # Ana sayfa — API'den işletmeler + ilanlar (force-dynamic)
├── giris/, kayit/            # Kullanıcı OTP auth
├── profil/
│   ├── page.tsx              # Profil — mesajlar, ilanlar, randevular, ayarlar
│   ├── mesajlar/[id]/        # Chat — WebSocket + HTTP fallback
│   ├── rezervasyonlarim/     # Liste + Takvim görünümü toggle
│   ├── ilanlarim/            # Kullanıcının ilanları
│   └── duzenle/              # Profil düzenle (ad, email, şifre)
├── hizmetler/[slug]/         # force-dynamic, API'den kuafor/usta/doktor
├── ilanlar/yeni/             # İlan oluştur/düzenle (?edit=id)
├── isletme/
│   ├── giris/                # Email + şifre (tip seçimi yok)
│   ├── kayit/                # 2 adımlı kayıt formu
│   ├── profil/               # Logo + kapak yükle + bilgiler
│   ├── mesajlar/             # WebSocket anlık mesajlaşma
│   ├── rezervasyonlar/       # Tüm tipler — onayla/reddet
│   ├── randevular/           # Tüm tipler — onayla/reddet
│   └── ...                   # (diğerleri boş state)
├── admin/
│   ├── giris/                # Koyu tema login
│   ├── page.tsx              # Dashboard — gerçek API stats
│   ├── isletmeler/           # Onayla/reddet
│   ├── kullanicilar/         # Listele/engelle
│   ├── ilanlar/              # API'den gerçek ilanlar
│   ├── ayarlar/              # Twilio/Netgsm/Resend/Google
│   ├── gorunum/              # Renkler/font/toggle'lar
│   └── profil/               # Admin email/şifre değiştir

components/
├── AppShell.tsx              # Layout + PageWrapper (pageFadeIn animasyonu)
├── PageLoader.tsx            # Sayfa geçiş overlay (overlayFadeOut 250ms)
├── AuthProvider.tsx          # Sync init — flash yok, sadece /profil/* korumalı
├── BusinessActions.tsx       # CTA bar: fixed bottom-5, lg:left-[88px] ortali
├── NotificationBell.tsx      # Bell ikonu — 15sn polling, badge, dropdown
├── DesktopSidebar.tsx        # 5 item dikey orta: Ana Sayfa, Arama, Kategoriler, AI, Kampanyalar
├── DesktopTopBar.tsx         # Arama + selamlama + NotificationBell
├── PanelShell.tsx            # Admin + İşletme: sidebar + topbar + NotificationBell
├── PhotoUpload.tsx           # Fotoğraf upload (JWT ile /upload endpoint)
├── panel/StatCard.tsx        # Stat kartı
├── panel/SimpleChart.tsx     # BarChart + LineChart (SVG)
└── ...

lib/
├── api.ts                    # Tüm API çağrıları — getToken(), getBusinessToken()
├── auth.ts                   # User localStorage — AuthUser: { phone, token, id, firstName, lastName }
├── panel-auth.ts             # Admin/Business localStorage — token alanı var
└── business-types.ts         # 10 işletme türü × modüller config

data/ (statik şehir içeriği — panel sayfalarında kullanılmıyor)
├── places.ts                 # 8 Gebze tarihi yeri
├── services.ts               # 40+ POI (eczane, ATM, benzinlik...)
├── transport.ts              # Marmaray, YHT, otobüs, feribot
├── emergency.ts              # Acil numaralar
├── guide.ts                  # Rehber mekanları
└── home-sections.ts          # quickServices + homeCategories
```

---

## 🎨 Tasarım Sistemi

### Renkler (globals.css)
```css
--primary: #0e7490  (turkuaz) / dark: #22d3ee
--secondary: #10b981 (emerald) / dark: #34d399
--background: #f8fafc / dark: #0b1220
--card: #ffffff / dark: #111a2e
```
Admin görünüm ayarları DB'de (`primary_color`, `secondary_color`)

### Kurallar
- **Font:** Google Sans
- **Padding:** `px-5` (20px) — her sayfa wrapper'ı
- **Emoji yok** — sadece Lucide ikonları
- **Tarih formatı:** `r.date.slice(0,10).split("-").reverse().join(".")` → `01.06.2026`
- **Dark mode:** `prefers-color-scheme` + profil toggle (localStorage `gebzem_theme`)
- **iOS:** input font-size 16px (zoom önleme), ZoomLock component

### iOS/WebKit Scroller Pattern
```tsx
<div className="-mx-5 flex gap-3 overflow-x-auto scroll-pl-5 no-scrollbar">
  {items.map((it, i) => (
    <Card className="first:ml-5 last:mr-5" />
  ))}
</div>
```

### Sayfa Geçiş Animasyonu
- `PageLoader` — pathname değişince 250ms bg-background overlay (flash yok)
- `pageFadeIn` keyframe — `from: { opacity:0, translateY:4px }` → 0.15s
- `AppShell` → `PageWrapper key={pathname}` — her route değişiminde re-mount

---

## 🏪 İşletme Türleri (10 adet)

| ID | Etiket | Özel Modüller |
|---|---|---|
| `restoran` | Restoran | menu, rezervasyonlar |
| `yemek` | Yemek Teslimat | menu, siparisler |
| `kafe` | Kafe | menu, rezervasyonlar |
| `market` | Market | urunler, kampanyalar, siparisler |
| `magaza` | Mağaza | urunler, kampanyalar, siparisler |
| `doktor` | Doktor | randevular, hizmetler, hastalarim |
| `kuafor` | Kuaför | hizmetler, randevular |
| `usta` | Usta | hizmetler, talepler |
| `emlakci` | Emlakçı | emlak-ilanlari, portfoy |
| `galerici` | Galerici | vasita-ilanlari |

Tüm türlerde ortak: profil, reklam, ilanlar (iş), mesajlar, yorumlar, istatistik, ayarlar

---

## ⚙️ Admin Ayarları (DB `settings` tablosu)

| Key | Açıklama |
|---|---|
| `twilio_account_sid/auth_token/verify_sid/from/active` | Twilio Verify OTP |
| `netgsm_usercode/password/header/active` | Netgsm SMS (yedek) |
| `google_client_id/secret/active` | Google OAuth (backend henüz yok) |
| `resend_api_key/active` | Email servisi |
| `primary_color/secondary_color` | Site renkleri |
| `font_family` | Yazı tipi |
| `hero_title/subtitle` | Ana sayfa hero |

---

## 🔔 Bildirim Sistemi

- **DB:** `notifications` (user_id, business_id, admin, type, title, body, is_read)
- **API:** `/user|business|admin/notifications` GET + `/read-all` PUT
- **Frontend:** `NotificationBell` — 15sn polling, okunmamış badge, dropdown
- **Tipler:** `reservation`, `message`, `listing`

---

## 📅 Rezervasyon / Randevu

- **Oluşturma:** `BusinessActions` → tarih/saat seçici → API
- **Tip:** `bookingLabel.toLowerCase().includes("randevu")` ? "randevu" : "rezervasyon"
- **Görünüm:** `/profil/rezervasyonlarim` — Liste + Takvim toggle
- **Takvim:** Ayın günleri, rezervasyonlu günlerde renkli dot (emerald=onaylı, amber=bekliyor)
- **İşletme:** `/isletme/rezervasyonlar` ve `/isletme/randevular` — onayla/reddet

---

## 💬 Mesajlaşma (WebSocket)

- **Bağlantı:** `wss://gebzem.app/ws/conversations/:id?token=JWT`
- **nginx:** upgrade header gerekli (ayarlı)
- **Akış:** WS açıksa anlık, kapalıysa HTTP fallback
- **Temp ID:** Gönderilince UI'ye anında eklenir, WS broadcast'i ID'yi günceller

---

## 🐛 Kritik Bilinen Notlar

1. **`GetBusinessMe`** — SELECT'te `cover_url` var, Scan'de 11. parametre olmalı. Eksikse 404 döner.
2. **`GetMessages`** — role="business" ise `business_id` ile, user ise `user_id` ile ownership check.
3. **İşletme login** — `is_approved=true` olmazsa 403 döner.
4. **Tarih UTC kayması** — `new Date(r.date)` yerine `r.date.slice(0,10).split("-").reverse().join(".")` kullan.
5. **`hizmetler/page.tsx`** — `force-dynamic` zorunlu, yoksa cache'den gelir, yeni işletme görünmez.
6. **CTA bar desktop** — `lg:left-[88px]` (sidebar genişliği) ile ortalanır.
7. **İşletme kayıt/giriş** — layout `/isletme/giris` ve `/isletme/kayit`'ı public sayar.
8. **Auth flash** — Layout'larda `useState(() => getSession())` ile sync init — `pathname` değişince reset yok.

---

## ⚡ Geliştirme Komutları

```bash
npm run dev          # localhost:3000
npm run build        # Production build
npx tsc --noEmit     # Type check
```

### Commit Konvansiyonu
```
feat: yeni özellik
fix: hata düzeltme
docs: belgeleme
chore: araç/config
```

---

## 🚀 Sonraki Adımlar

1. **Google OAuth** — admin toggle var, Go backend kodu yazılmadı
2. **Netgsm** — ıslak imza tamamlanınca admin'den key gir → aktif
3. **FCM Push Notification** — bildirim DB var, push gönderimi yok
4. **R2 Medya Upload** — şu an `/var/www/uploads` sunucuya kaydediliyor
5. **Flutter Native App** — aynı API, onboarding burada olacak
6. **Ödeme** — iyzico/Stripe entegrasyonu

---

## 📚 Hızlı Başvuru

| "Şunu yapmak istiyorum" | Nereye bak |
|---|---|
| Yeni kullanıcı sayfası | `app/yeni/page.tsx` — PageHeader + px-5 |
| Yeni işletme türü | `lib/business-types.ts` + modül sayfası |
| Auth mantığı | `lib/auth.ts` + `components/AuthProvider.tsx` |
| Admin yeni sayfa | `app/admin/layout.tsx` (navItems) + sayfa |
| İşletme yeni modül | `app/isletme/layout.tsx` (buildNav) + sayfa |
| Harita | `components/MapView.tsx`, `MapWrapper.tsx` |
| Global arama | `components/SearchSheet.tsx` → `search()` fonksiyonu |
| API endpoint ekle | `routes/routes.go` + `handlers/*.go` → build + restart |
| Bildirim gönder | `handlers/notifications.go` → `CreateNotification()` |
| DB temizle | Yukarıdaki SQL komutu |

---

**Son Güncelleme:** 2026-04-18 · Sistem tam canlı — WebSocket mesajlaşma, bildirimler, takvim görünümü, sayfa geçiş animasyonu, işletme kayıt formu

**Bu dosyayı her önemli değişiklikte güncelle.**
