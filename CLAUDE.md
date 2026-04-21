@AGENTS.md

# Gebzem — Proje Rehberi

> Bu dosya tüm proje bağlamını özetler. Her Claude Code oturumu başlangıcında otomatik yüklenir.

---

## 📖 Proje Özeti

**Gebzem**, Gebze (Kocaeli) şehrine özel şehir rehberi platformu.

**Sahibi:** `aksedigitalg <info@aksedigital.com>`
**Repo:** https://github.com/aksedigitalg/gebzm-app
**Domain:** https://gebzem.app
**Admin:** `info@gebzemapp.com` / `80148014`

---

## 🔧 Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Font | Google Sans |
| İkonlar | lucide-react (emoji yok) |
| Backend | Go 1.24 + Fiber v2 |
| DB | PostgreSQL 16 |
| Realtime | WebSocket (gofiber/contrib/websocket) |
| SMS | Twilio Verify (OTP) + Netgsm yedek |
| Deploy | DigitalOcean Frankfurt |
| Auto-deploy | GitHub Webhook → deploy.sh |

---

## 🏗️ Sunucu

| | |
|---|---|
| IP | 138.68.69.122 |
| SSH | `ssh -i ~/.ssh/gebzem root@138.68.69.122` |
| Next.js | `/opt/gebzem-web` — PM2 port 3000 |
| Go API | `/opt/gebzem-api` — systemd port 8080 |
| Uploads | `/var/www/uploads/` → `gebzem.app/uploads/` |
| nginx | `/etc/nginx/sites-enabled/gebzem` |

**Go API güncelle:** `cd /opt/gebzem-api && go build -o gebzem-api-bin . && systemctl restart gebzem-api`
**Next.js deploy:** `git push origin main` → webhook otomatik çalışır:
1. `git pull` → DB sıfırlama → `npm run build` → `pm2 restart` → **seed (10 işletme)**

**⚠️ Her push sonrası otomatik:** DB sıfırlanır + 10 test işletmesi yüklenir. Tarayıcıda localStorage temizle (F12 → Application → Local Storage → Clear).

**⚠️ Manuel deploy gerekirse:**
```bash
ssh -i ~/.ssh/gebzem root@138.68.69.122
ps aux | grep 'next build' | awk '{print $2}' | xargs kill -9 2>/dev/null
cd /opt/gebzem-web && bash deploy.sh
```

---

## 🔐 Auth Sistemi

| | Key | Süre |
|---|---|---|
| Kullanıcı | `gebzem_user` (localStorage) | JWT 30 gün |
| İşletme | `gebzem_business` (localStorage) | JWT 30 gün |
| Admin | `gebzem_admin` (localStorage) | JWT 24 saat |

**Kullanıcı giriş akışı:**
1. Telefon + Şifre gir → `POST /auth/login-step1` → şifre doğruysa OTP gönderir
2. Yeni kullanıcı (şifresi yok) → `POST /auth/send-otp` → OTP gönderir
3. OTP doğrula → `POST /auth/verify-otp` → JWT token
4. Yeni kullanıcı: şifre belirle → `POST /user/set-password`

**İşletme:** Admin onayı zorunlu (`is_approved=true`). Onaysız token verilmez.
**OTP demo:** `111111` her zaman geçerli. Gerçek: Twilio Verify.
**Admin:** `info@gebzemapp.com` / `80148014` (sunucu `.env`'de)

---

## 📡 API Endpoint'leri

**Base:** `https://gebzem.app/api/v1` (client) / `http://localhost:8080/api/v1` (server-side)
**WebSocket:** `wss://gebzem.app/ws/conversations/:id?token=JWT`

### Auth
```
POST /auth/check-phone       → Telefon kontrolü (has_password: bool)
POST /auth/login-step1       → Telefon+Şifre → OTP gönder
POST /auth/send-otp          → OTP gönder
POST /auth/verify-otp        → OTP doğrula → token
POST /auth/business/register → İşletme kayıt
POST /auth/business/login    → İşletme giriş
POST /auth/business/search   → İşletme ara (şifre sıfırlama)
POST /auth/business/reset-otp → Sıfırlama OTP'si
POST /auth/business/reset-password → Yeni şifre
POST /auth/admin/login       → Admin giriş
```

### Kullanıcı (`/user/*` — Bearer token)
```
GET/PUT  /user/me
PUT      /user/password      → Şifre değiştir
POST     /user/set-password  → İlk şifre belirleme
GET/POST /user/conversations
GET/POST /user/conversations/:id/messages
GET/POST /user/reservations
GET/POST /user/listings
PUT/DELETE /user/listings/:id
GET      /user/notifications
PUT      /user/notifications/read-all
POST     /upload             → Fotoğraf yükle
```

### İşletme (`/business/*` — Bearer token)
```
GET/PUT  /business/me        → logo_url, cover_url dahil
GET      /business/conversations
GET/POST /business/conversations/:id/messages
GET      /business/reservations
PUT      /business/reservations/:id/status → bekliyor/onaylandi/reddedildi/tamamlandi
GET      /business/notifications
PUT      /business/notifications/read-all
```

### Public
```
GET /businesses              → Onaylı işletmeler (?type=kuafor)
GET /businesses/:id          → Tekil işletme (cache: no-store)
GET /listings                → İlanlar (?category=...)
GET /listings/:id
```

### Admin (`/admin/*` — Bearer token)
```
GET /admin/stats
GET /admin/users + PUT /admin/users/:id/toggle
GET /admin/businesses + PUT /admin/businesses/:id/approve
GET/POST /admin/settings
GET/PUT  /admin/profile
GET      /admin/notifications
PUT      /admin/notifications/read-all
GET      /admin/listings
```

---

## 🗄️ Veritabanı

**Bağlantı:** `postgres://gebzem:gebzem2026@localhost:5432/gebzem_db`

| Tablo | Kritik Sütunlar |
|---|---|
| `users` | phone (nullable), name, email, password_hash, auth_type |
| `businesses` | name, type, email, password_hash, phone, address, description, logo_url, cover_url, is_approved, is_active, last_seen |
| `conversations` | user_id, business_id, last_message, updated_at |
| `messages` | conversation_id, sender_id, sender_role (user/business), text, photo_url |
| `reservations` | user_id, business_id, date (DATE), time (TIME), type (rezervasyon/randevu), status (bekliyor/onaylandi/reddedildi/tamamlandi), party_size, note |
| `user_listings` | user_id, title, category, price, photos (text[]), features (jsonb), status |
| `settings` | key, value |
| `otp_codes` | phone, code, expires_at, used |
| `notifications` | user_id, business_id, admin (bool), type, title, body, is_read |
| `media` | user_id, url, filename |

**DB Temizleme:**
```sql
sudo -u postgres psql -d gebzem_db -c "
TRUNCATE user_listings,messages,conversations,reservations,otp_codes,notifications RESTART IDENTITY CASCADE;
DELETE FROM businesses; DELETE FROM users;
"
```

---

## 📁 Kritik Dosyalar

```
app/
├── page.tsx                  # Ana sayfa — revalidate=30, INTERNAL_API_URL
├── giris/page.tsx            # Telefon+Şifre → OTP → Giriş
├── kayit/page.tsx            # Yeni kullanıcı kayıt
├── hizmetler/page.tsx        # CLIENT — tüm 10 tip, ?tip= filtre
├── hizmetler/[slug]/page.tsx # force-dynamic — TÜM tipler için evrensel detay
│                             #   food (restoran/yemek/kafe) → menü göster
│                             #   service (kuafor/usta/doktor) → hizmetler göster
├── restoran/page.tsx         # revalidate=30, sadece restoran tipi
├── restoran/[id]/page.tsx    # force-dynamic, galeri YOK, sadece menü
├── yemek/page.tsx            # revalidate=30, yemek teslimat listesi
├── kafe/page.tsx             # revalidate=30, kafe listesi
├── market/page.tsx           # revalidate=30, market listesi
├── magaza/page.tsx           # revalidate=30, mağaza listesi
├── emlakci/page.tsx          # revalidate=30, emlakçı listesi
├── galerici/page.tsx         # revalidate=30, oto galeri listesi
├── ilanlar/page.tsx          # revalidate=30
├── profil/                   # mesajlar(2-panel), rezervasyonlarim(takvim), ilanlarim
├── isletme/
│   ├── giris/page.tsx        # Email+Şifre (tip seçimi yok)
│   ├── kayit/page.tsx        # 2 adımlı kayıt
│   ├── sifre-sifirla/        # İşletme şifre sıfırlama (ada göre ara)
│   ├── layout.tsx            # Token kontrolü, sidebar: Galeri YOK, QR sadece menu tiplerinde
│   ├── mesajlar/page.tsx     # WebSocket 2-panel
│   ├── rezervasyonlar/       # Takvim + Liste toggle
│   └── randevular/           # Takvim + Liste toggle
└── admin/
    ├── gorunum/              # Renk/font/toggle ayarları
    └── ayarlar/              # Twilio/Netgsm/SMS ayarları

components/
├── AppShell.tsx              # Layout — animasyon YOK (hız için)
├── AuthProvider.tsx          # Korumalı olmayan sayfalarda spinner YOK
├── BusinessActions.tsx       # CTA: login yoksa /giris'e yönlendir
├── NotificationBell.tsx      # Bell: açılınca otomatik read-all
├── MessageSheet.tsx          # Mesaj popup (navigate etmez)
├── panel/PanelShell.tsx      # notifToken + notifEndpoint prop'ları
└── ...

lib/api.ts                    # client: NEXT_PUBLIC_API_URL
                              # server: INTERNAL_API_URL (localhost)
```

---

## ⚡ Performans Notları

**INTERNAL_API_URL:** Sunucu taraflı fetch'ler `localhost:8080` kullanır. SSL overhead yok.
```
/opt/gebzem-web/.env.local:
  NEXT_PUBLIC_API_URL=https://gebzem.app/api/v1
  INTERNAL_API_URL=http://localhost:8080/api/v1
```

**Sayfa stratejileri:**
- `force-dynamic` + `cache:"no-store"` → `/ilanlar`, hizmetler/[slug], restoran/[id], ilanlar/[id] (taze veri zorunlu)
- `revalidate=30` + `revalidatePath` tetikleyici → ana sayfa, /restoran, /yemek, /kafe, /market, /magaza, /emlakci, /galerici (ISR + on-demand)
- Static → diğer tüm sayfalar (giris, kayit, hakkında vb.)

**Router Cache:** `next.config.ts` → `staleTimes: { static: 0, dynamic: 0 }` — tarayıcı/telefon sayfaları hafızada tutmaz, her navigasyonda sunucudan alır.

**AuthProvider:** Korumalı olmayan sayfalarda (/, /hizmetler, vb.) spinner YOK — anında açılır.

---

## 🎨 Tasarım

- **Font:** Google Sans
- **Primary:** `#0e7490` / **Secondary:** `#10b981`
- **Admin'den değiştirilebilir:** `/admin/gorunum`
- **Padding:** `px-5` her yerde
- **Emoji yok** — Lucide ikonları
- **Tarih formatı:** `r.date.slice(0,10).split("-").reverse().join(".")` → `01.06.2026`
- **Dark mode:** `prefers-color-scheme` + profil toggle

---

## 🔔 Bildirim Sistemi

- DB: `notifications` tablosu
- API: `/user|business|admin/notifications`
- Frontend: `NotificationBell` — 15sn polling, açılınca otomatik read-all
- **Tetikleyiciler:** Rezervasyon onaylanınca/reddedilince kullanıcıya bildirim

---

## 💬 Mesajlaşma (WebSocket)

- **Backend:** Gönderene broadcast ETMEZ — sadece karşı tarafa
- **Frontend:** tempId ile anlık UI, WS gelince id güncellenir
- **Fallback:** WS bağlı değilse 5sn polling

---

## 🏪 İşletme Türleri (10 adet)

`restoran`, `yemek`, `kafe`, `market`, `magaza`, `doktor`, `kuafor`, `usta`, `emlakci`, `galerici`

---

## ⚙️ Admin Settings (DB)

`twilio_*`, `netgsm_*`, `google_*`, `resend_*`, `primary_color`, `secondary_color`, `font_family`, `hero_title/subtitle`

---

## 🐛 Kritik Notlar

1. **WS broadcast:** `broadcastToConv(convID, out, userID)` — sender exclude edilir
2. **GetBusinessMe:** SELECT'te 11 kolon var (cover_url dahil), Scan parametresi uymalı
3. **İşletme 404:** `/businesses/:id` → `cache: "no-store"`, `force-dynamic`
4. **Tarih UTC:** `r.date.slice(0,10).split("-").reverse().join(".")`
5. **AuthProvider:** `hydrated` başlangıçta `typeof window !== "undefined"` — sync init
6. **İşletme şifresi:** `is_approved=true` olmadan token verilmez
7. **Manuel rebuild:** Stale build varsa `kill -9 $(ps aux | grep 'next build' | awk '{print $2}')`
8. **Next.js prerender + forwardRef:** LucideIcon bileşenini (forwardRef) server/prerender boundary'den geçirmek yasak. Çözüm: ilgili `page.tsx`'e `export const dynamic = "force-dynamic"` ekle. Etkilenen sayfalar: `isletme/satis-ilanlari`, `isletme/emlak-ilanlari`, `isletme/vasita-ilanlari`
9. **React bileşen kimliği:** Alt bileşeni (ör. SidebarFilters, ThumbStrip, VideoOverlay) üst bileşenin **içinde** tanımlamak yasak — her render'da yeni tip oluşur, React unmount/remount yapar, input'lar odak kaybeder. Her zaman dosya scope'unda tanımla.
10. **Video URL tespiti:** `/\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/")` — CDN imzalı URL'lerde sorgu parametresi olabilir, `$` yerine `(\?|$)` kullan.
11. **UpdateListingStatus Go API:** `RowsAffected()` mutlaka kontrol et. Kontrol edilmezse DB'de hiçbir şey güncellenmese bile 200 döner (silent failure). Handler: `/opt/gebzem-api/handlers/listings.go`
12. **Opera dosya seçici:** `input.click()` ve şeffaf overlay Opera'da kendi download panelini açtırır. Çözüm: `window.showOpenFilePicker()` (File System Access API) → fallback `showPicker()` → fallback `click()` zinciri. Bkz. `MediaUpload.tsx` `openNativePicker()` fonksiyonu.
13. **Push öncesi build kontrolü:** Her push öncesi yerel `npm run build` çalıştır. TypeScript hataları ve prerender hataları build'i kırar, siteyi çökertir.
14. **İlan cache — üç katman:** (a) Next.js Router Cache → `staleTimes:{static:0}` ile sıfır. (b) Next.js Full Route Cache → `revalidatePath` ile anında temizlenir. (c) Tarayıcı HTTP Cache → `/ilanlar` `force-dynamic` olduğu için `Cache-Control: no-store` döner. Üçü birlikte çalışmadığında ilan "yok olur". Yeni bir sayfa eklenince mutlaka `/api/revalidate` route'una da ekle.
15. **IlanlarMap XSS:** Leaflet `.setContent()` HTML string alır — `${l.title}` gibi user verisi doğrudan template'e GİRMEZ. `esc()` helper'ı kullan (`components/IlanlarMap.tsx`). React auto-escape burada çalışmaz.
16. **Go API go build PATH:** SSH ile build yaparken `export PATH=/usr/local/go/bin:/usr/bin:/bin` gerekli. Aksi halde "go: command not found" hatası alınır.
17. **Nested ternary Turbopack:** Next.js 16 Turbopack ile derin iç içe ternary (`a ? b ? c : d : e`) parse hatası verebilir. `{condition && <JSX/>}` kalıbına çevir.

---

## 🚀 Sonraki Adımlar

1. Google OAuth (admin toggle var, backend yok)
2. Netgsm (ıslak imza bekliyor)
3. FCM Push Notification
4. ~~Medya R2 upload~~ ✅ Cloudflare R2 entegre (`cdn.gebzem.app`)
5. Flutter Native App
6. Opera video thumbnail sorunu (CDN URL pattern değişirse `isVideo()` regex güncelle)
7. UptimeRobot kurulumu — ücretsiz, `gebzem.app` ekle (site çökünce bildirim)
8. Watermark — ilan fotoğraflarına "gebzem.app" — govips Label API hazır, istediğinde açılır
9. Sunucu 4GB RAM upgrade — 50K+ kullanıcıya hazırlık (DigitalOcean resize, 5 dk)
10. Cloudflare Images — signed/expiring URL'ler

---

**Son Güncelleme:** 2026-04-21 · Cache sistemi yeniden yazıldı + ilan güvenlik açıkları kapatıldı + rate limiting + DB index + pagination

---

## 📅 Sohbet Geçmişi / Yapılan İşler

### 2026-04-21 — Cache, Güvenlik, Performans Sprint

**Sorun tespiti:** Kullanıcı ilan ekleyince sayfada görünmüyor, sayfalar arası gezerken kayboluyor, refresh yapınca geliyor — 3 ayrı cache katmanı çakışıyordu.

**Çözümler:**

| # | Yapılan | Dosya/Yer |
|---|---|---|
| 1 | `staleTimes:{static:0,dynamic:0}` → Router Cache sıfırlandı | `next.config.ts` |
| 2 | `/ilanlar` → `force-dynamic` + `cache:"no-store"` → tarayıcı cache'i yok | `app/ilanlar/page.tsx` |
| 3 | `/api/revalidate` — 10 sayfa eklendi (sadece `/` ve `/hizmetler` vardı) | `app/api/revalidate/route.ts` |
| 4 | `CreateListing` + `UpdateListing` + `DeleteListing` + `UpdateListingStatus` → hepsi revalidate tetikliyor | Go API `handlers/listings.go` |
| 5 | Rate limiting: genel 200 req/dk, auth 10 req/dk (IP bazlı) | Go API `main.go` + `routes/routes.go` |
| 6 | View counter dedup: `shouldIncrementView()` — IP+ilan başına 6 saatte 1 artış | Go API `handlers/listings.go` |
| 7 | Input validation: başlık ≤150, açıklama ≤3000, fiyat 0–999M | Go API `handlers/listings.go` |
| 8 | Harita popup XSS kapatıldı — `esc()` HTML escape helper | `components/IlanlarMap.tsx` |
| 9 | Pagination: 24'er ilan, "Daha Fazla Yükle" butonu | `components/IlanlarClient.tsx` |
| 10 | TopProgressBar: aynı sayfaya 2. tıkta 1.5sn sonra kapanır | `components/TopProgressBar.tsx` |
| 11 | DB index: 9 kritik index eklendi (listings, businesses, messages, notifications, reservations) | PostgreSQL doğrudan |

**False positive olarak doğrulananlar (sorun yok):**
- Backend auth: Go middleware tüm endpoint'leri koruyor
- ID manipulation: `WHERE id=$n AND user_id=$n` zaten var
- CSRF: Bearer token yapısı engelliyor
- Dosya tipi: `allowedExt` map'i Go API'de mevcut

**Kalan / sonraya bırakılan:**
- UptimeRobot (kullanıcı kendisi kuracak)
- Watermark (govips hazır, istediğinde açılır)
- Sunucu 4GB upgrade
- Cloudflare Images

---

## 🍽️ Restoran Modülü

**DB:** `menu_categories`, `menu_items`, `business_gallery`

**API:**
```
GET/POST/PUT/DELETE /business/menu/categories
GET/POST/PUT/DELETE /business/menu/items
GET/POST/DELETE     /business/gallery
GET /businesses/:id/menu  (public)
GET /businesses/:id/gallery (public)
```

**Sayfalar:**
- `/isletme/menu` — Kategori+ürün yönetimi (fotoğraflı, collapse)
- `/isletme/galeri` — Fotoğraf galerisi
- `/isletme/qr-menu` — QR kod (api.qrserver.com)
- `/restoran` + `/restoran/[id]` — Public liste + detay (menü, galeri, rezervasyon)

---

## 📋 İlan Sistemi

**DB:** `user_listings` genişledi + `listing_offers` + `listing_favorites`
**Config:** `lib/listing-categories.ts` — 8 kategori, alt kategoriler, dinamik attributes
**İşletme:** `/isletme/satis-ilanlari` — 4 adımlı wizard (Kategori→Detay→Foto→Önizleme)
**Emlakci:** `/isletme/emlak-ilanlari` — gerçek ilan listesi + yeni ilan butonu (→ satis-ilanlari/yeni)
**Galerici:** `/isletme/vasita-ilanlari` — gerçek ilan listesi + yeni ilan butonu (→ satis-ilanlari/yeni)
**Sidebar:** emlakci/galerici için "Satış İlanları" gizlenir (kendi özel sayfaları var)
**API:** `POST /business/listings` — işletme ilanları (emlakci/galerici seed'de de bu kullanılır)
**Public:** `/ilanlar` + `/ilanlar/[id]` — Sadece API verisi, statik veri yok
**İlan Detay (`/ilanlar/[id]`):** PageHeader yok — geri butonu galeri üzerine `absolute` konumlandırılmış blur daire

### İlan Durum Yönetimi (BusinessListings.tsx)
- **API:** `PUT /business/listings/:id/status` → `{ status: "active"|"pasif"|"satildi" }`
- **Optimistic UI:** Durum değişimini anında gösterir, hata olursa önceki duruma döner
- **Filtre otomatik geçiş:** Durum değişince aktif filtre yeni durumla uyuşmuyorsa otomatik "Tümü" seçilir (kullanıcı ilanı kaybetmez)
- **Toast bildirimi:** `opMsg` state — yeşil başarı / kırmızı hata, 2.5-3sn

### İlan Cache Mimarisi (KRİTİK)
`/ilanlar` sayfası `force-dynamic` + `cache: "no-store"` — tarayıcı hiç cache'lemiyor.
Go API'de tüm ilan mutasyonları (oluştur/güncelle/sil/durum) `revalidatePath` tetikler:
```go
go func() { http.Get("http://localhost:3000/api/revalidate") }()
```
`/api/revalidate` route'u 10 sayfayı temizler: `/`, `/ilanlar`, `/hizmetler`, `/restoran`, `/yemek`, `/kafe`, `/market`, `/magaza`, `/emlakci`, `/galerici`

**next.config.ts:** `staleTimes: { static: 0, dynamic: 0 }` — Router Cache devre dışı, her navigasyonda sunucudan taze veri.

### İlan Güvenliği (Go API)
- **Sahiplik kontrolü:** Her UPDATE/DELETE `WHERE id=$n AND user_id=$n` (veya business_id) — başkasının ilanı düzenlenemez
- **Input validation:** başlık max 150 karakter, açıklama max 3.000 karakter, fiyat 0–999.999.999 TL
- **Rate limiting:** genel 200 istek/dk, auth endpointleri 10 istek/dk (IP bazlı, fiber limiter)
- **View counter dedup:** `shouldIncrementView(ip, listingID)` — IP+ilan başına 6 saatte 1 artış, bellek 10K üzerinde temizlenir

### İlan Pagination
- Backend: `GET /listings?page=N` — limit 24 sabit, Go API'de hardcoded
- Frontend (`IlanlarClient`): `allListings` state + `loadMore()` → `?page=N` fetch, append
- "Daha Fazla Yükle" butonu: filtre aktifken gizlenir (client-side filter tüm yüklü datayı tarar)
- `hasMore = son sayfa 24 ilan döndürdüyse true`

### Video Desteği İlanlarda
- `photos` alanına video URL'leri de kaydedilir (`photos: [...photos, ...videos]`)
- Video URL tespiti: `/\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/")`
- İlan kartlarında video thumbnail: `<video preload="metadata">` + Play ikonu overlay

---

## 🖼️ Medya Sistemi

### PhotoGallery (`components/PhotoGallery.tsx`)
Tam özellikli galeri + lightbox bileşeni. **Bileşenler dosya scope'unda tanımlı** (VideoOverlay, ThumbStrip — asla içeride tanımlama).

**Ana galeri davranışı:**
- **Resim:** Tıklayınca lightbox açılır (zoom-in)
- **Video:** Tıklayınca **inline** (lightbox açmadan) oynatılır. İlk frame `preload="metadata"` ile thumbnail olarak gösterilir
- **Swipe:** 40px eşik, left/right — `onTouchStart` / `onTouchEnd`
- **Geçiş animasyonu:** 160ms opacity + 28px translateX slide (sağa/sola yönlü)
- **Video pozisyon hafızası:** `videoTimesRef.current[url]` — başka slide'a gidince pozisyon kaydedilir, geri dönünce `preload="metadata"` + `v.currentTime = savedTime` ile restore edilir

**VideoOverlay davranışı:**
- Tek tıkla toggle (play/pause) — tüm alan tıklanabilir
- Oynamaya başlayınca kontrol ikonu 2sn sonra kaybolur
- Duraklayınca ikon tekrar belirir
- Unmount'ta `videoTimesRef` güncellenir (cleanup effect)

**Lightbox:**
- Sadece resimler için açılır (videolar inline oynar)
- Header yok — her cihazda aynı floating butonlar: `MoreHorizontal` (sol) + sayaç (orta) + `X` (sağ)
- `MoreHorizontal` dropdown: **İndir** (`<a download>`) + **Paylaş** (`navigator.share()` → clipboard fallback)
- Prev/Next: `h-12 w-12` buton + `h-7 w-7` ikon
- Lightbox'ta video gelince VideoOverlay gösterilir, ayrı `key={currentUrl}` ile mount edilir

**ThumbStrip:**
- `paddingBottom: calc(env(safe-area-inset-bottom, 0px) + 8px)` — iPhone notch uyumlu
- Aktif slide: `ring-2 ring-white ring-offset-black`

### PhotoUpload (`components/PhotoUpload.tsx`)
Sadece fotoğraf yükleme — button + hidden input. `openNativePicker()` ile dosya seçimi.

### MediaUpload (`components/MediaUpload.tsx`)
Fotoğraf + video yükleme. Video max 500MB. Aynı `openNativePicker()` mekanizması.

### Dosya Seçici — Opera / Tüm Tarayıcılar
```ts
// openNativePicker() zinciri:
// 1. window.showOpenFilePicker() — File System Access API, OS native picker
//    Opera/Chrome/Edge destekler. Opera kendi download panelini GÖSTERMEZ.
// 2. AbortError ise: kullanıcı iptal etti, boş döner
// 3. Diğer hata veya API yoksa: showPicker() dene
// 4. showPicker() hata verirse: input.click() fallback
```
Input `position: fixed; top: -9999px` ile DOM'da ama görünmez.

## 🤖 AI Yan Panel

- `AiPanel` component — sağdan açılır 400px panel
- Sidebar AI butonuna tıklayınca navigate etmez, panel açılır

---

## 🔄 DB Reset & Seed

**Otomatik (her `git push` sonrası):** deploy.sh içinde otomatik çalışır.

**Manuel:**
```bash
ssh -i ~/.ssh/gebzem root@138.68.69.122 "cd /opt/gebzem-web && bash deploy.sh"
```

**Sadece seed:**
```bash
ssh -i ~/.ssh/gebzem root@138.68.69.122 "/opt/db-reset.sh && bash /opt/gebzem-web/scripts/seed.sh"
```

**Test İşletmeleri (şifre: 80148014):**
| Email | İşletme | Tip |
|---|---|---|
| kuafor@test.com | Ahmet Kuaför | kuafor |
| restoran@test.com | Gebze Lezzet Restoran | restoran |
| yemek@test.com | Hızlı Bites | yemek |
| kafe@test.com | Mavi Kafe & Pastane | kafe |
| market@test.com | Gebze Fresh Market | market |
| magaza@test.com | TechStore Gebze | magaza |
| doktor@test.com | Dr. Mehmet Kılıç | doktor |
| usta@test.com | Yıldız Elektrik | usta |
| emlakci@test.com | Gebze Emlak | emlakci |
| galerici@test.com | Özkan Oto Galeri | galerici |
