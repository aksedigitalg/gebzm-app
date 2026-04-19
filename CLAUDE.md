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
- `force-dynamic` → sadece hizmetler/[slug] (yeni işletme anında görünsün)
- `revalidate=30` → ana sayfa, ilanlar (30sn cache, hızlı)
- Static → diğer tüm sayfalar

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

---

## 🚀 Sonraki Adımlar

1. Google OAuth (admin toggle var, backend yok)
2. Netgsm (ıslak imza bekliyor)
3. FCM Push Notification
4. ~~Medya R2 upload~~ ✅ Cloudflare R2 entegre (`cdn.gebzem.app`)
5. Flutter Native App

---

**Son Güncelleme:** 2026-04-19 · Tüm 10 kategori sayfaları + evrensel işletme detay sayfası + galeri kaldırıldı + kapsamlı seed scripti + MediaUpload (foto+video)

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
