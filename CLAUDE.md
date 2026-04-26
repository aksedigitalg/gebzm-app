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
GET/POST /user/orders                     → Sipariş ver / Listele (?filter=aktif|gecmis)
GET      /user/orders/:id                 → Detay
PUT      /user/orders/:id/cancel          → İptal (sadece 'bekliyor')
PUT      /user/orders/:id/rate            → 1-5 yıldız + yorum
GET/POST /user/addresses                  → Kayıtlı adresler CRUD
PUT/DELETE /user/addresses/:id
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
GET      /business/orders                 → Gelen siparişler (?filter=yeni|aktif|tamamlandi|iptal)
GET      /business/orders/:id             → Detay
PUT      /business/orders/:id/status      → State machine: bekliyor→onaylandi→hazirlaniyor→hazir→yolda→teslim_edildi (veya iptal)
GET/PUT  /business/delivery-settings      → Teslimat ücreti, min, IBAN, çalışma saatleri
```

### Public
```
GET /businesses              → Onaylı işletmeler (?type=kuafor)
GET /businesses/:id          → Tekil işletme (cache: no-store)
GET /listings                → İlanlar (?category=..., ?page=N)
GET /listings/:id            → Sadece status='active' ilanlar (pasif → 404)
GET /events                  → Etkinlikler (?category=..., ?when=today/week/month, ?q=...)
GET /events/:slug            → Tekil etkinlik (login varsa user_status dahil)
GET /event-categories        → 9 kategori (konser, tiyatro, sergi, spor, festival, cocuk, egitim, konferans, diger)
```

### Etkinlik (`/user/events/*` — Bearer token)
```
POST   /user/events/:id/interest  → { status: "katiliyor"|"ilgileniyor" }
DELETE /user/events/:id/interest
```

### Yorumlar
```
GET    /businesses/:id/reviews                → Public liste (?page=N)
GET    /businesses/:id/reviews/stats          → Public ortalama + dağılım

POST   /user/businesses/:id/reviews           → Yorum yaz (login)
DELETE /user/reviews/:id                      → Kendi yorumunu sil
GET    /user/reviews/eligibility/:business_id → Yazabilir mi? Hangi siparişlerle?

GET    /business/reviews                      → Kendi yorumları
PUT    /business/reviews/:id/reply            → Cevap (max 1 cevap, güncellenebilir)

PUT    /admin/reviews/:id/hide                → Toggle is_hidden (kötü içerik)
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
GET/POST /admin/events
GET/PUT/DELETE /admin/events/:id
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
| `orders` | user_id, business_id, status (bekliyor→onaylandi→hazirlaniyor→hazir→yolda→teslim_edildi/iptal), payment_method (nakit/kart_kapida/eft), delivery_address+lat+lng, contact_phone, subtotal+delivery_fee+total, rating, courier_lat+lng (gelecek için) |
| `order_items` | order_id, menu_item_id, name (snapshot), price, quantity, subtotal, note |
| `order_status_history` | order_id, from_status, to_status, changed_by_role, reason — audit log |
| `user_addresses` | user_id, label, address, district, lat+lng, contact_phone+name, is_default |
| `business_delivery_settings` | business_id (PK), accepts_orders, delivery_fee, free_delivery_threshold, min_order_amount, delivery_radius_km, estimated_delivery_min, accepts_cash/card_at_door/eft, eft_iban+bank_name+account_holder, open_hour+close_hour |
| `events` | slug (UNIQUE), title, description, category (FK→event_categories.key), start_at, end_at, location_name, address, lat+lng, cover_url, photo_url, organizer, contact_phone+url, ticket_url, price, status (taslak/yayinda/iptal), created_by_admin_id |
| `event_categories` | key (PK: konser/tiyatro/sergi/spor/festival/cocuk/egitim/konferans/diger), label, color, sort_order |
| `event_attendees` | event_id, user_id, status (katiliyor/ilgileniyor) — UNIQUE(event_id,user_id) |
| `business_reviews` | business_id, user_id, order_id (nullable), rating (1-5 CHECK), comment (1-1000 CHECK), business_reply, business_replied_at, is_hidden — UNIQUE(order_id) WHERE order_id IS NOT NULL + UNIQUE(business_id, user_id) WHERE order_id IS NULL |

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
├── AuthModal.tsx             # Giriş modal — credentials→OTP→set-password, onSuccess callback
├── BusinessActions.tsx       # CTA: login yoksa AuthModal açar (artık /giris'e yönlendirmez)
├── NotificationBell.tsx      # Bell: açılınca otomatik read-all
├── MessageSheet.tsx          # Mesaj popup (navigate etmez)
├── PhotoGallery.tsx          # Galeri + lightbox (VideoOverlay, ThumbStrip dosya scope'unda)
├── TabFocusRefresher.tsx     # visibilitychange → router.refresh() (detay sayfaları için)
├── IlanlarClient.tsx         # İlan listesi — hero slider + kategori kartları + subcategory panel + URL params
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

**Son Güncelleme:** 2026-04-27 · Güvenlik Sertleştirme + Market/Mağaza Sipariş + Zenginleştirilmiş Seed

---

## 📅 Günlük Raporlar

---

### 2026-04-25 — İlanlar Sayfası Yeniden Tasarımı + AuthModal

| # | Yapılan | Dosya |
|---|---|---|
| 1 | Hero slider: 4 slayt, gradient arka plan, otomatik geçiş | `components/IlanlarClient.tsx` |
| 2 | Kategori kartları: 90×90 grid, ikonsuz, eşit boyut | `components/IlanlarClient.tsx` |
| 3 | Sol subcategory paneli (desktop) + mobil yatay bar | `components/IlanlarClient.tsx` |
| 4 | URL params: `?k=emlak&s=konut-satilik` — refresh'te state korunuyor | `components/IlanlarClient.tsx` |
| 5 | Sol filtre sidebar'ı kaldırıldı (fiyat/tip filtreleri) | `components/IlanlarClient.tsx` |
| 6 | `AuthModal` — giriş akışı modal içinde, sayfadan çıkmadan | `components/AuthModal.tsx` |
| 7 | `BusinessActions` → `router.push("/giris")` yerine `AuthModal` açıyor | `components/BusinessActions.tsx` |
| 8 | `onSuccess` callback: giriş sonrası otomatik rezervasyon/soru dialogu açılır | `components/BusinessActions.tsx` |
| 9 | `/ilanlar/page.tsx` → `<Suspense>` wrap (useSearchParams zorunluluğu) | `app/ilanlar/page.tsx` |

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


---

### 2026-04-27 — Güvenlik Sertleştirme + Market/Mağaza Sipariş + Seed (Push d4cf8bd)

**Sorun & Talep:** Market/mağaza için yemek-tarzı sipariş sistemi + 5 işletmeye dolu içerik + derin güvenlik denetimi.

**Backend güvenlik (sunucuda — Go API ayrı repo değil):**
| Katman | Yapılan | Dosya |
|---|---|---|
| Middleware | Helmet (HSTS 2yr, X-Frame DENY, CSP, Permissions-Policy, Cross-Origin-* policies) | `main.go` |
| Middleware | Recover (panic → 500, sunucu çökmüyor), RequestID (X-Request-Id header) | `main.go` |
| CORS | `*` → allowlist (gebzem.app + www + localhost:3000), env'den özelleştirilebilir | `main.go` |
| Limits | BodyLimit 100MB, ReadTimeout 30s, WriteTimeout 30s, IdleTimeout 60s | `main.go` |
| ErrorHandler | Production'da iç hatayı sızdırma (4xx orijinal, 5xx generic) | `main.go` |
| Health | `/health` endpoint (DB ping kontrolü, uptime monitoring için) | `main.go` |
| JWT | `WithValidMethods(["HS256"])` + `WithExpirationRequired()` — alg:none saldırısı blokeli, exp zorunlu | `middleware/auth.go` |
| Rate limit | authLimiter 10/15dk/IP, orderLimiter 15/5dk/user, reviewLimiter 5/10dk/user, uploadLimiter 30/5dk/user | `routes/routes.go` |
| Upload | Magic byte (http.DetectContentType) + extension allowlist çapraz kontrol | `handlers/upload.go` |

**Frontend (push d4cf8bd):**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | market/magaza `bookingLabel` "İletişim" → "Sipariş Ver" — BusinessActions sipariş akışını tetikler | `app/hizmetler/[slug]/page.tsx` |
| 2 | `/restoran/[id]/siparis` generic — herhangi bir tipte menü + accepts_orders=true ise çalışır | (mevcut) |

**Seed zenginleştirme (deploy.sh otomatik):**
| İşletme | Eklenen |
|---|---|
| Market (Gebze Fresh) | 5 kategori × 23 ürün (meyve-sebze, süt-kahvaltı, et-tavuk, bakliyat, içecek) |
| Mağaza (TechStore) | 4 kategori × 18 ürün (telefon, aksesuar, bilgisayar, kulaklık) |
| Tüm yemek tipi (5 işletme) | delivery_settings: 00-24 açık, accepts_orders=true, fee=15, free=250, min=50 |
| Test kullanıcısı | test@gebzem.app / 80148014 (email register endpoint) |
| Yorumlar | 5 işletmeye standalone yorum (rating 4-5, gerçekçi içerik) |

**Doğrulama testleri (deploy sonrası):**
```bash
curl -sI https://gebzem.app/api/v1/businesses | grep -E 'x-frame|hsts|cross-origin' # Tüm header'lar var
curl -H 'Origin: https://evil.com' https://gebzem.app/api/v1/businesses             # CORS reddediyor
curl https://gebzem.app/api/v1/event-categories                                      # 200 + 9 kategori
```

**Güvenlik kapsamı dışı (gelecek):**
- WAF (Cloudflare ücretsiz tier düşünülebilir)
- Audit log (admin işlemleri, suspicious activity)
- 2FA admin için (TOTP)
- IP geolocation block (sadece TR)
- DDoS koruması (Cloudflare yeterli)

---

### 2026-04-27 — Yorum Sistemi + Acil Sipariş Bug Fixleri (Push 96d34bb)

**Sorun:** Kullanıcı şikayet etti: profilde siparişler görünmüyor, sipariş detay açılmıyor, "Kabul Et" 500 hatası, sipariş zili çalmıyor, yorum sistemi yok.

**Backend bug:**
| Dosya | Sorun | Çözüm |
|---|---|---|
| `handlers/orders.go:629-636` | UpdateOrderStatus SQL query'sinde `$1, $3, $4, $5` — `$2` ATLANMIŞTI. Postgres "no parameter $2" hatası → tüm "Kabul Et" istekleri 500 dönüyordu | Param numaralandırma düzeltildi: cancel için $1-5, diğerleri için $1-4. `args []interface{}` slice ile dinamik. `log.Printf` server-side hata logu eklendi |

**Frontend bug fixleri:**
| Sorun | Çözüm | Dosya |
|---|---|---|
| Profilde "Siparişlerim" linki yok (route var ama navigation'da yok) | ShoppingBag ikonuyla link + Adreslerim de eklendi, duplicate Rezervasyonlarım kaldırıldı | `app/profil/page.tsx` |
| İlk sipariş geldiğinde ses çalmıyor (`lastOrderIdRef === null` kontrolü yanlış konumda) | `seenIdsRef Set<string>` + `initializedRef` pattern → ilk yüklemede sadece doldur, sonraki yeni ID'lerde zil | `app/isletme/siparisler/page.tsx` |
| Tek beep yerine zil sesi gerekiyor | 3x ding-dong (880Hz + 660Hz, 0.6sn ara) + browser Notification API | `app/isletme/siparisler/page.tsx` |
| Generic "Güncellenemedi" alert (gerçek hata yutuluyor) | Inline error banner + 4-5sn auto-clear, backend log + frontend gerçek mesaj | siparisler + siparislerim/[id] |
| `as never` cast tip güvenliğini bypass ediyordu | `Exclude<OrderStatus, "bekliyor">` ile narrow type | `app/isletme/siparisler/page.tsx` |
| Detay sayfası 15sn polling sürekli (tab gizliyken bile) | `document.visibilityState !== "visible"` → skip + aktif statü değilse skip | `app/profil/siparislerim/[id]/page.tsx` |

**Yorum Sistemi (yeni):**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | DB: business_reviews + 4 partial unique index (order başına 1 + standalone başına 1) | PostgreSQL |
| 2 | 8 endpoint: public liste/stats, user create/delete/eligibility, business list/reply, admin hide | `handlers/reviews.go` (yeni) |
| 3 | makeSlug: yorum tablosu kullanıcısı silinince CASCADE, sipariş silinince SET NULL | DB |
| 4 | BusinessReviews component: stats grafiği, yorum listesi, yorum yazma dialog'u (eligibility ile) | `components/BusinessReviews.tsx` |
| 5 | /restoran/[id] + /hizmetler/[slug] → BusinessReviews entegre | iki sayfa |
| 6 | İşletme paneli /isletme/yorumlar → kendi yorumları + cevap yazma | `app/isletme/yorumlar/page.tsx` |
| 7 | business-types.ts: `yorumlar` modülü + 10 işletme tipinin hepsine eklendi | `lib/business-types.ts` |

**Yorum kuralları:**
- rating 1-5 (CHECK constraint), comment 1-1000 karakter (CHECK)
- order_id verilirse: kullanıcının kendi siparişi + status='teslim_edildi' OLMALI
- Bir siparişe sadece 1 yorum (UNIQUE WHERE order_id IS NOT NULL)
- Bir kullanıcı bir işletmeye standalone 1 yorum (UNIQUE WHERE order_id IS NULL)
- İşletme yoruma cevap verir (max 1000 char), güncellenebilir
- Kullanıcı kendi yorumunu silebilir, admin gizleyebilir (is_hidden toggle)

**Güvenlik:**
- Server-side fiyat hesabı: client-sent `price` IGNORE, `menu_items.price` DB'den çek + business_id ownership
- Filter parametresi allowlist (yeni/aktif/tamamlandi/iptal/aktif/gecmis) — SQL injection yok
- Yorum sahipliği: DELETE WHERE id=$ AND user_id=$, REPLY WHERE id=$ AND business_id=$
- Standalone yorum çoğaltılmaz (partial unique index)
- order_status_history audit log her transition'da yazılır

---

### 2026-04-27 — Etkinlik Sistemi (Public + Admin CRUD)

**Push 5b744a3** — Konser, tiyatro, sergi, festival vb. etkinlikleri admin'den ekleyip ana sayfa kartından erişen sistem.

**Backend (SSH /opt/gebzem-api):**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | DB: events, event_categories, event_attendees + 9 kategori seed | PostgreSQL |
| 2 | GRANT ALL → gebzem user (postgres'in oluşturduğu tablolarda) | PostgreSQL |
| 3 | 9 endpoint handler (public liste/detay/kategoriler + user interest + admin CRUD) | `handlers/events.go` |
| 4 | makeSlug() — Türkçe karakter dönüşümü (ş→s, ç→c, ğ→g, ü→u, ı→i, ö→o), uniqueSlug() | `handlers/events.go` |
| 5 | GetEvents — `start_at >= NOW() - INTERVAL '1 day'` ile geçmiş etkinlikler otomatik gizlenir | `handlers/events.go` |
| 6 | Slug-based detay endpoint (`/events/:slug` — UUID değil) | `handlers/events.go` |
| 7 | Routes: public (3) + user (2) + admin (5) | `routes/routes.go` |

**Frontend:**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | Event tipleri + EVENT_STATUS_LABEL/COLOR | `lib/types/event.ts` |
| 2 | publicApi.getEvents/getEvent/getEventCategories + eventApi.markInterest/removeInterest + adminEventApi (CRUD) | `lib/api.ts` |
| 3 | /etkinlikler liste — Hero + EventFilters + grid kartlar (statik veri kaldırıldı, DB'den çekiyor) | `app/etkinlikler/page.tsx` |
| 4 | /etkinlikler/[slug] detay — Cover, tarih, lokasyon (Google Maps linki), açıklama, organizatör, bilet/iletişim, sayaçlar | `app/etkinlikler/[slug]/page.tsx` |
| 5 | EventFilters — Bugün/Bu Hafta/Bu Ay + kategori chip'leri (URL state) | `components/EventFilters.tsx` |
| 6 | Floating Katılıyorum/İlgileniyorum buton — toggle + AuthModal | `components/EventInterestButton.tsx` |
| 7 | Admin CRUD tablosu — arama, edit, delete, EventFormDialog | `app/admin/etkinlikler/page.tsx` |
| 8 | Ana sayfa kartı: PartyPopper "Etkinlikler" (fuchsia) | `app/page.tsx` |

**Slug pattern:**
```go
makeSlug("Mor & Ötesi Konseri") → "mor-otesi-konseri"
uniqueSlug("test") → "test", "test-2", "test-3" ... (çakışma kontrolü)
```

**Otomatik geçmiş filtre:**
`WHERE start_at >= NOW() - INTERVAL '1 day'` — dünkü etkinlikler hâlâ görünür (gece bitenler için), öncesi gizlenir.

**Public vs Admin ayırımı:**
- Public: sadece `status='yayinda'` ve `start_at >= NOW()-1d` etkinlikler
- Admin: tümü (taslak/yayinda/iptal hepsi listelenir)

**Bilinen kısıt:**
- `idx_events_start_future` index `NOW()` IMMUTABLE değil → oluşturulamadı, ama diğer index'ler OK
- WebSocket realtime YOK (interest/attendees count günceltmek için sayfa yenilemek gerekebilir)

---

### 2026-04-27 — Yemek Siparişi Sistemi (Frontend + Backend)

**Frontend (push 965d973):**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | Sepet state — Context + localStorage + 24sa TTL + cross-tab sync | `lib/cart.tsx` |
| 2 | Order/CartItem tipleri + status/payment helper'ları | `lib/types/order.ts` |
| 3 | API client'a 13 yeni endpoint (orders + addresses + delivery) | `lib/api.ts` |
| 4 | Floating sepet butonu + slide-up sheet | `components/CartButton.tsx`, `CartSheet.tsx` |
| 5 | 5 adım sipariş timeline (sipariş alındı → teslim) | `components/OrderStatusTimeline.tsx` |
| 6 | İnteraktif menü +/− butonlu | `components/InteractiveOrderMenu.tsx` |
| 7 | Sipariş sayfası (mevcut menü sayfası bozulmadı) | `app/restoran/[id]/siparis/page.tsx` |
| 8 | Checkout (adres + ödeme + not + EFT IBAN) | `app/odeme/page.tsx` |
| 9 | Profil siparişlerim aktif/geçmiş + canlı takip (15sn poll) | `app/profil/siparislerim/page.tsx`, `[id]/page.tsx` |
| 10 | Adreslerim CRUD + harita pin | `app/profil/adreslerim/page.tsx` |
| 11 | İşletme siparişler dashboard (sesli bildirim 🔔, 10sn poll) | `app/isletme/siparisler/page.tsx` |
| 12 | Teslimat ayarları (ücret/min/IBAN/saat) | `app/isletme/teslimat-ayarlari/page.tsx` |
| 13 | restoran/yemek/kafe/market/magaza tipi → "siparisler" + "teslimat-ayarlari" modülleri | `lib/business-types.ts` |
| 14 | BusinessActions: bookingLabel="Sipariş Ver" → /siparis route | `components/BusinessActions.tsx` |
| 15 | AppShell: CartProvider tüm uygulamayı sarar | `components/AppShell.tsx` |

**Backend (SSH /opt/gebzem-api):**
| # | Yapılan | Dosya |
|---|---|---|
| 1 | DB migration — 5 yeni tablo + 4 index | `/tmp/orders_migration.sql` |
| 2 | Sipariş handlers (user + business) — state machine + audit log | `handlers/orders.go` |
| 3 | Adres CRUD handlers | `handlers/addresses.go` |
| 4 | Teslimat ayarları (UPSERT pattern + IBAN doğrulama) | `handlers/delivery.go` |
| 5 | Routes: 14 yeni endpoint kayıtlı | `routes/routes.go` |
| 6 | Build + systemctl restart | — |

**Güvenlik:**
- Sipariş anında **menu_item_id DB'den doğrulanır**, fiyat snapshot olarak alınır (client manipülasyonu önlenir)
- Auth required (user kendi siparişleri, business kendi alanı)
- State machine: geçersiz status geçişleri reddedilir
- Min order, accepts_orders, payment_method server-side kontrol
- Race condition koruması: `WHERE status = $current` ile concurrent update'i bloke et
- IBAN doğrulama (TR + 24 hane numerik)
- Sipariş items: max 50 ürün, qty 1-99, fiyat ≥0 CHECK constraint
- Tutarlar SERVER-side hesaplanır (subtotal = sum(price × qty))
- order_status_history audit log her geçişte yazılır

**Ödeme yöntemleri (kredi kartı YOK):**
- nakit (kapıda), kart_kapida (POS), eft (havale + IBAN gösterimi)
- Online kart (iyzico) ileride eklenecek

**Snapshot pattern:**
order_items.name + price = sipariş anındaki menü değerleri.
Sonradan menü güncellense bile geçmiş siparişler aynı kalır (yasal/vergi gereği).

**Akış:**
1. /restoran/[id] → "Sipariş Ver" → /restoran/[id]/siparis
2. Menüden +/− ile sepete ekle → CartSheet
3. "Onayla" → /odeme → adres + ödeme + not
4. "Siparişi Onayla" → POST /user/orders → /profil/siparislerim/[id]
5. Backend'de bekliyor → bildirim işletmeye
6. İşletme dashboard → Kabul Et → onaylandi
7. ChefHat → hazirlaniyor → Truck → yolda → Check → teslim_edildi
8. Kullanıcı 5 yıldız değerlendirme

**Sınırlar (sonra):**
- WebSocket canlı takip (şimdi 10-15sn polling)
- Kurye GPS canlı takip (`watchPosition` altyapısı hazır)
- Push notification (FCM)
- Online kart ödeme (iyzico/Paratika)
- Aktarmalı rota (1+ aktarma yok)
