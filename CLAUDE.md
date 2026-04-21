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
GET /listings                → İlanlar (?category=..., ?page=N)
GET /listings/:id            → Sadece status='active' ilanlar (pasif → 404)
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
| `user_listings` | user_id, title, category, price, photos (text[]), features (jsonb), status (active/pasif/satildi/deleted) |
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
├── restoran/page.tsx         # revalidate=30
├── restoran/[id]/page.tsx    # force-dynamic, galeri YOK, sadece menü
├── yemek/page.tsx            # revalidate=30
├── kafe/page.tsx             # revalidate=30
├── market/page.tsx           # revalidate=30
├── magaza/page.tsx           # revalidate=30
├── emlakci/page.tsx          # revalidate=30
├── galerici/page.tsx         # revalidate=30
├── ilanlar/page.tsx          # force-dynamic + cache:"no-store"
├── ilanlar/[id]/page.tsx     # force-dynamic — TabFocusRefresher dahil, geri butonu YOK
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
├── PhotoGallery.tsx          # Galeri + lightbox (VideoOverlay, ThumbStrip dosya scope'unda)
├── TabFocusRefresher.tsx     # visibilitychange → router.refresh() (detay sayfaları için)
├── IlanlarClient.tsx         # İlan listesi — filtre, pagination, tab focus sync
├── IlanlarMap.tsx            # Leaflet harita — XSS korumalı esc() helper
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
- `force-dynamic` + `cache:"no-store"` → `/ilanlar`, `/ilanlar/[id]`, `hizmetler/[slug]`, `restoran/[id]`
- `revalidate=30` + `revalidatePath` tetikleyici → ana sayfa, /restoran, /yemek, /kafe, /market, /magaza, /emlakci, /galerici
- Static → diğer tüm sayfalar (giris, kayit, hakkında vb.)

**Router Cache:** `next.config.ts` → `staleTimes: { static: 0, dynamic: 0 }` — tarayıcı/telefon sayfaları hafızada tutmaz.

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
9. **React bileşen kimliği:** Alt bileşeni (ör. SidebarFilters, ThumbStrip, VideoOverlay) üst bileşenin **içinde** tanımlamak yasak — her render'da yeni tip oluşur, React unmount/remount yapar. Her zaman dosya scope'unda tanımla.
10. **Video URL tespiti:** `/\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/")` — CDN imzalı URL'lerde sorgu parametresi olabilir.
11. **UpdateListingStatus Go API:** `RowsAffected()` mutlaka kontrol et — aksi halde silent 200 döner.
12. **Opera dosya seçici:** `window.showOpenFilePicker()` → fallback `showPicker()` → fallback `click()` zinciri. Bkz. `MediaUpload.tsx`.
13. **Push öncesi build kontrolü:** Her push öncesi `npm run build` çalıştır. TypeScript/prerender hataları siteyi çökertir.
14. **İlan cache — üç katman:** (a) Router Cache → `staleTimes:{static:0}` (b) Full Route Cache → `revalidatePath` (c) HTTP Cache → `force-dynamic` ile `no-store`. Üçü birlikte çalışmazsa ilan "yok olur".
15. **IlanlarMap XSS:** Leaflet `.setContent()` raw HTML alır — user verisi `esc()` ile escape edilmeli. React auto-escape burada çalışmaz.
16. **Go API go build PATH:** `export PATH=/usr/local/go/bin:/usr/bin:/bin` — SSH'ta olmadan "go: command not found".
17. **Nested ternary Turbopack:** Derin iç içe ternary parse hatası verir. `{condition && <JSX/>}` kalıbına çevir.
18. **Tab focus refresh — iki katman:** `IlanlarClient` (liste) + `TabFocusRefresher` (detay sayfaları) — ikisi de `visibilitychange` → `router.refresh()`. Yeni server component sayfalara eklenecekse `<TabFocusRefresher />` import et.
19. **GetListingByID vs UpdateListing status:** `GetListingByID` (public) `status='active'` — pasif ilanlar 404. `UpdateListing` (authenticated) `status!='deleted'` — ilan sahibi pasif ilanını düzenleyebilir. Karıştırma.
20. **IlanlarClient initialListings sync:** `useState(initialListings)` sadece ilk render'da çalışır. `router.refresh()` yeni prop getirince `useEffect` ile `allListings` state'i senkronize edilir. Bu olmadan tab focus refresh liste güncellemez.
21. **Video thumbnail — preload:** `preload="metadata"` iOS Safari'de çalışmaz (siyah kare). `preload="auto" muted` kullan — ilk kare tüm tarayıcılarda yüklenir. VideoOverlay'de ses açık olabilir (muted=false).
22. **ThumbStrip swipe çakışması:** ThumbStrip scroll hareketi parent `onTouchStart/End`'e bubble eder → ana galeri swipe tetiklenir. `onTouchStart/End={e => e.stopPropagation()}` zorunlu.
23. **PhotoGallery autoPlay:** `goTo(idx, startPlay=true)` ile video thumbnail'a tıklanınca `VideoOverlay` `autoPlay` prop ile mount edilir → `loadedmetadata` sonrası `play()` çağrılır. Tek tıkla oynatma böyle sağlanır.

---

## 🚀 Sonraki Adımlar

1. Google OAuth (admin toggle var, backend yok)
2. Netgsm (ıslak imza bekliyor)
3. FCM Push Notification
4. ~~Medya R2 upload~~ ✅ Cloudflare R2 entegre (`cdn.gebzem.app`)
5. Flutter Native App
6. UptimeRobot kurulumu — ücretsiz, `gebzem.app` ekle
7. Watermark — ilan fotoğraflarına "gebzem.app" — govips Label API hazır
8. Sunucu 4GB RAM upgrade — 50K+ kullanıcıya hazırlık (DigitalOcean resize, 5 dk)
9. Cloudflare Images — signed/expiring URL'ler
10. Server-side video thumbnail üretimi — upload sırasında ilk kare PNG olarak kaydedilir

---

**Son Güncelleme:** 2026-04-22 · Galeri yeniden yazıldı + tab focus sync + video thumbnail + pasif ilan 404

---

## 📅 Günlük Raporlar

---

### 2026-04-21 — Cache, Güvenlik, Performans Sprint

**Sorun:** Kullanıcı ilan ekleyince sayfada görünmüyor, sayfalar arası gezerken kayboluyor — 3 ayrı cache katmanı çakışıyordu.

| # | Yapılan | Dosya |
|---|---|---|
| 1 | `staleTimes:{static:0,dynamic:0}` → Router Cache sıfırlandı | `next.config.ts` |
| 2 | `/ilanlar` → `force-dynamic` + `cache:"no-store"` | `app/ilanlar/page.tsx` |
| 3 | `/api/revalidate` — 10 sayfa eklendi | `app/api/revalidate/route.ts` |
| 4 | Tüm ilan mutasyonları revalidate tetikliyor | Go API `handlers/listings.go` |
| 5 | Rate limiting: genel 200 req/dk, auth 10 req/dk | Go API `main.go` + `routes/routes.go` |
| 6 | View counter dedup: IP+ilan başına 6 saatte 1 artış | Go API `handlers/listings.go` |
| 7 | Input validation: başlık ≤150, açıklama ≤3000, fiyat 0–999M | Go API `handlers/listings.go` |
| 8 | Harita popup XSS kapatıldı — `esc()` helper | `components/IlanlarMap.tsx` |
| 9 | Pagination: 24'er ilan, "Daha Fazla Yükle" | `components/IlanlarClient.tsx` |
| 10 | TopProgressBar: aynı sayfaya 2. tıkta 1.5sn sonra kapanır | `components/TopProgressBar.tsx` |
| 11 | DB index: 9 kritik index (listings, businesses, messages...) | PostgreSQL |

---

### 2026-04-22 — Pasif İlan 404 + Tab Focus Refresh + Galeri Yeniden Yazımı

**Sabah:** Pasif ilan sorunu ve tab focus refresh implementasyonu.

| # | Yapılan | Dosya |
|---|---|---|
| 1 | `GetListingByID` → `status='active'` — pasif ilanlar public'te 404 | Go API `handlers/listings.go:236` |
| 2 | `IlanlarClient` → `visibilitychange` → `router.refresh()` | `components/IlanlarClient.tsx` |
| 3 | `TabFocusRefresher` component — ilan detay sayfasına eklendi | `components/TabFocusRefresher.tsx` |
| 4 | `IlanlarClient` `useEffect` initialListings sync — tab refresh liste güncelliyor | `components/IlanlarClient.tsx` |

**Öğleden sonra:** Galeri UX sorunları giderildi.

| # | Sorun | Çözüm | Dosya |
|---|---|---|---|
| 5 | Video thumbnail mobilde siyah kare | `preload="auto" muted` — ilk kare yüklenir | `PhotoGallery.tsx` |
| 6 | Videoya 2 kez tıklamak gerekiyor | `goTo(i, startPlay=true)` + `autoPlay` prop → tek tıkla | `PhotoGallery.tsx` |
| 7 | ThumbStrip scroll ana galeriyi tetikliyor | `onTouchStart/End stopPropagation` | `PhotoGallery.tsx` |
| 8 | Geri butonu galeri üstünde (mobile UX kötü) | `<Link ChevronLeft>` kaldırıldı | `app/ilanlar/[id]/page.tsx` |
| 9 | Ana galeri sol/sağ oklar swipe ile çakışıyor | Oklar kaldırıldı (lightbox'takiler kaldı) | `PhotoGallery.tsx` |
| 10 | Geçiş animasyonu UX'i yavaşlatıyor | 160ms opacity/transform kaldırıldı, direkt geçiş | `PhotoGallery.tsx` |
| 11 | Thumbnail küçük (56px) + ortalı değil | `h-20 w-20` (80px) + `justify-center` + auto-scroll | `PhotoGallery.tsx` |
| 12 | Lightbox açılınca sayfa kayıyor | scrollbar compensation (`paddingRight`) | `PhotoGallery.tsx` |
| 13 | Lightbox kapat butonu sadece X ikonu | X + "Kapat" yazısı eklendi | `PhotoGallery.tsx` |

**Teknik tuzak:** Python `replace` ile Go API'de `status!='deleted'` → `status='active'` yaparken `UpdateListing` handler'ı da yanlışlıkla değişti. `UpdateListing` `status!='deleted'` olmalı (pasif ilan sahibi düzenleyebilmeli), sadece `GetListingByID` `status='active'` olmalı. Fark edilip düzeltildi.

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

**DB:** `user_listings` + `listing_offers` + `listing_favorites`
**Config:** `lib/listing-categories.ts` — 8 kategori, alt kategoriler, dinamik attributes
**İşletme:** `/isletme/satis-ilanlari` — 4 adımlı wizard (Kategori→Detay→Foto→Önizleme)
**Emlakci:** `/isletme/emlak-ilanlari` — gerçek ilan listesi + yeni ilan butonu
**Galerici:** `/isletme/vasita-ilanlari` — gerçek ilan listesi + yeni ilan butonu
**Sidebar:** emlakci/galerici için "Satış İlanları" gizlenir
**Public:** `/ilanlar` + `/ilanlar/[id]` — Sadece API verisi, statik veri yok
**İlan Detay:** Geri butonu YOK — browser native back kullanılır

### İlan Durum Yönetimi
- **API:** `PUT /business/listings/:id/status` → `{ status: "active"|"pasif"|"satildi" }`
- **Optimistic UI:** Hata olursa önceki duruma döner
- **Filtre otomatik geçiş:** Durum değişince uyuşmayan filtre "Tümü"ye geçer
- **Toast:** `opMsg` state — yeşil başarı / kırmızı hata, 2.5-3sn

### İlan Cache Mimarisi (KRİTİK)
`/ilanlar` sayfası `force-dynamic` + `cache: "no-store"` — tarayıcı hiç cache'lemiyor.
Go API'de tüm ilan mutasyonları revalidate tetikler:
```go
go func() { http.Get("http://localhost:3000/api/revalidate") }()
```
`/api/revalidate` 10 sayfayı temizler: `/`, `/ilanlar`, `/hizmetler`, `/restoran`, `/yemek`, `/kafe`, `/market`, `/magaza`, `/emlakci`, `/galerici`

### İlan Güvenliği (Go API)
- **Sahiplik:** `WHERE id=$n AND user_id=$n` (veya business_id)
- **Validation:** başlık ≤150, açıklama ≤3000, fiyat 0–999.999.999
- **Rate limit:** genel 200/dk, auth 10/dk (IP bazlı)
- **View dedup:** IP+ilan başına 6 saatte 1 artış

### İlan Pagination
- Backend: `GET /listings?page=N` — limit 24
- Frontend: `allListings` state + `loadMore()` → append
- "Daha Fazla Yükle": filtre aktifken gizlenir

---

## 🖼️ Medya Sistemi

### PhotoGallery (`components/PhotoGallery.tsx`)
Tam özellikli galeri + lightbox. **Tüm alt bileşenler (VideoOverlay, ThumbStrip) dosya scope'unda tanımlı.**

**Ana galeri davranışı:**
- **Resim:** Tıkla → lightbox açılır
- **Video:** Tıkla → `autoPlay=true` ile `VideoOverlay` mount edilir → tek tıkla oynatılır
- **Thumbnail:** `preload="auto" muted` — ilk kare tüm tarayıcılarda görünür
- **Swipe:** 40px eşik — ThumbStrip swipe'ı parent'a bubble ETMEZ (`stopPropagation`)
- **Geçiş:** Animasyon YOK — direkt swap
- **Oklar:** Ana galeride YOK — sadece swipe. Lightbox'ta var.

**VideoOverlay davranışı:**
- `autoPlay` prop: mount'ta `loadedmetadata` sonrası `play()` çağrılır
- Tek tıkla toggle (play/pause)
- 2sn sonra kontrol ikonu kaybolur, duraklatınca geri gelir
- Unmount'ta `videoTimesRef` güncellenir (pozisyon hafızası)

**ThumbStrip davranışı:**
- `h-20 w-20` (80px), `justify-center`, `overflow-x-auto`
- Aktif item: `scrollIntoView({ behavior: "instant", inline: "center" })`
- `onTouchStart/End stopPropagation` — ana galeri swipe'ını tetiklemez

**Lightbox:**
- Sadece resimler için (video inline oynar)
- Sol üst: `MoreHorizontal` → İndir / Paylaş dropdown
- Orta: sayaç
- Sağ üst: X + "Kapat" butonu
- Sol/Sağ: prev/next oklar
- Açılırken scrollbar compensation (`paddingRight = scrollbarWidth`)

### MediaUpload / PhotoUpload
- `openNativePicker()` zinciri: `showOpenFilePicker()` → `showPicker()` → `click()` fallback
- Opera'da native OS picker açılır, download panel tetiklenmez

### Tab Focus Refresh
- `TabFocusRefresher` (`components/TabFocusRefresher.tsx`): `visibilitychange` → `router.refresh()`
- `/ilanlar/[id]` sayfasına eklenmiş — sekme değiştirince pasif ilan otomatik 404 verir
- `IlanlarClient`: `visibilitychange` + `useEffect(initialListings sync)` — liste de güncellenir

---

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
