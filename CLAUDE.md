@AGENTS.md

# Gebzem — Proje Rehberi

> Bu dosya tüm proje bağlamını özetler. Her Claude Code oturumu başlangıcında otomatik yüklenir.

---

## 📖 Proje Özeti

**Gebzem**, Gebze (Kocaeli) şehrine özel bir **tam özellikli şehir rehberi platformu**. 3 farklı arayüz:

1. **Kullanıcı Uygulaması** — hizmetler, ilanlar, harita, rezervasyon, randevu, anlık mesajlaşma
2. **Admin Paneli** — işletme onayları, kullanıcı yönetimi, platform ayarları
3. **İşletme Paneli** — profil, rezervasyon/randevu yönetimi, müşteri mesajlaşması

**Sahibi:** `aksedigitalg <info@aksedigital.com>`
**Repo:** https://github.com/aksedigitalg/gebzm-app
**Deploy:** DigitalOcean (138.68.69.122) — nginx + PM2 + Let's Encrypt
**Domain:** https://gebzem.app
**Admin Giriş:** `info@gebzemapp.com` / `80148014`

---

## 🔧 Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (App Router, force-dynamic kritik sayfalarda) |
| Dil | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Font | Google Sans (next/font/google) |
| İkonlar | lucide-react |
| Backend | Go 1.24 + Fiber v2 |
| DB | PostgreSQL 16 |
| Cache | Redis |
| Realtime | WebSocket (gofiber/contrib/websocket) |
| SMS | Twilio Verify (OTP) + Netgsm (yedek, admin'den aktif et) |
| Deploy | DigitalOcean — PM2 (Next.js) + systemd (Go API) + nginx |
| Auto-deploy | GitHub Webhook → `/opt/gebzem-web/deploy.sh` |

---

## 🏗️ Sunucu Bilgileri

| | |
|---|---|
| IP | 138.68.69.122 |
| SSH | `ssh -i ~/.ssh/gebzem root@138.68.69.122` |
| Next.js | `/opt/gebzem-web` — PM2 ile port 3000 |
| Go API | `/opt/gebzem-api` — systemd ile port 8080 |
| Uploads | `/var/www/uploads/` → `gebzem.app/uploads/` |
| nginx | `/etc/nginx/sites-enabled/gebzem` |

**Go API güncelle:** `cd /opt/gebzem-api && go build -o gebzem-api-bin . && systemctl restart gebzem-api`
**Next.js güncelle:** `git push origin main` → webhook otomatik deploy

---

## 🔐 Auth Sistemi

### 3 Ayrı Auth

| | Key | Token |
|---|---|---|
| Kullanıcı | `gebzem_user` (localStorage) | JWT 30 gün |
| İşletme | `gebzem_business` (localStorage) | JWT 30 gün |
| Admin | `gebzem_admin` (localStorage) | JWT 24 saat |

**Admin:** `info@gebzemapp.com` / `80148014` (sunucu `.env`'de)
**OTP:** Twilio Verify — gerçek SMS. Demo: `111111` her zaman geçerli.
**İşletme:** Onaysız giriş yapamaz — admin onayı zorunlu.

---

## 📡 API Endpoint'leri

**Base URL:** `https://gebzem.app/api/v1`

### Auth
```
POST /auth/send-otp          → OTP gönder
POST /auth/verify-otp        → OTP doğrula + token
POST /auth/business/register → İşletme kayıt (onay bekler)
POST /auth/business/login    → İşletme giriş (onaylı olmalı)
POST /auth/admin/login       → Admin giriş
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
POST     /upload              → Fotoğraf yükle
```

### İşletme (Bearer token gerekli)
```
GET/PUT  /business/me        → Profil (logo_url, cover_url dahil)
GET      /business/conversations
GET/POST /business/conversations/:id/messages
GET      /business/reservations
PUT      /business/reservations/:id/status
```

### Public
```
GET /businesses              → Tüm onaylı işletmeler (?type=kuafor)
GET /listings                → Kullanıcı ilanları (?category=...)
GET /listings/:id
```

### Admin (Bearer token gerekli)
```
GET /admin/stats
GET /admin/users + PUT /admin/users/:id/toggle
GET /admin/businesses + PUT /admin/businesses/:id/approve
GET/POST /admin/settings
GET/PUT  /admin/profile
```

### WebSocket
```
WS /ws/conversations/:id?token=JWT → Anlık mesajlaşma
```

---

## 🗄️ Veritabanı

**Bağlantı:** `postgres://gebzem:gebzem2026@localhost:5432/gebzem_db`

### Tablolar
| Tablo | Açıklama |
|---|---|
| `users` | phone, name, email, password_hash, token, auth_type |
| `businesses` | name, type, email, password_hash, phone, address, description, logo_url, cover_url, is_approved, is_active |
| `conversations` | user_id, business_id, last_message, updated_at |
| `messages` | conversation_id, sender_id, sender_role (user/business), text |
| `reservations` | user_id, business_id, date, time, type (rezervasyon/randevu), status (bekliyor/onaylandi/reddedildi/tamamlandi), party_size, note |
| `user_listings` | user_id, title, category, price, photos (text[]), features (jsonb), status |
| `settings` | key, value (Twilio/Netgsm/Google OAuth vs.) |
| `otp_codes` | phone, code, expires_at, used |

---

## 📁 Frontend Yapısı

```
app/
├── page.tsx                  # Ana sayfa — API'den işletmeler + ilanlar
├── giris/, kayit/            # Kullanıcı OTP auth
├── profil/                   # Profil, mesajlar, rezervasyonlar, ilanlar
├── hizmetler/                # API'den kuafor/usta/doktor listesi + detay
├── ilanlar/                  # Kullanıcı ilanları (API + oluştur/düzenle/sil)
├── harita/                   # Leaflet harita
├── kategoriler/              # Kategori grid
├── ai/                       # Gebzem AI chat (statik cevaplar)
├── kampanyalar/              # Market kampanyaları
├── admin/                    # Admin paneli (giris, dashboard, isletmeler, kullanicilar, ayarlar, gorunum, profil)
└── isletme/                  # İşletme paneli (giris, kayit, dashboard, profil, mesajlar, rezervasyonlar, randevular, ...)

components/
├── AppShell.tsx              # Layout + sayfa geçiş animasyonu (pageFadeIn)
├── AuthProvider.tsx          # User auth — sadece /profil/* korumalı
├── BusinessActions.tsx       # Randevu Al + Soru Sor — sabit CTA bar, WS mesaj
├── DesktopSidebar.tsx        # 5 item ortalı: Ana Sayfa, Arama, Kategoriler, AI, Kampanyalar
├── PanelShell.tsx            # Admin + İşletme sidebar layout
├── PhotoUpload.tsx           # Fotoğraf upload component
└── ...

lib/
├── api.ts                    # Tüm API çağrıları (auth, user, business, admin)
├── auth.ts                   # User localStorage session
├── panel-auth.ts             # Admin + Business localStorage session
└── business-types.ts         # 10 işletme türü config
```

---

## 🎨 Tasarım Kuralları

- **Font:** Google Sans
- **Renk:** `--primary: #0e7490` (turkuaz), `--secondary: #10b981` (emerald)
- **Admin'den değiştirilebilir:** `gebzem.app/admin/gorunum`
- **Padding:** `px-5` (20px) her yerde
- **Dark mode:** `prefers-color-scheme` + profil toggle
- **Animasyon:** `pageFadeIn 0.15s` sayfa geçişlerinde
- **Emoji kullanma** — sadece Lucide ikonları

---

## ⚙️ Settings (DB)

Admin panelinden değiştirilebilir (`/admin/ayarlar` ve `/admin/gorunum`):

| Key | Açıklama |
|---|---|
| `twilio_account_sid/auth_token/verify_sid/from/active` | Twilio SMS/OTP |
| `netgsm_usercode/password/header/active` | Netgsm SMS |
| `google_client_id/secret/active` | Google OAuth (backend henüz yok) |
| `resend_api_key/active` | Email servisi |
| `primary_color/secondary_color` | Site renkleri |
| `font_family` | Yazı tipi |
| `hero_title/subtitle` | Ana sayfa başlıkları |

---

## 🚀 Sonraki Adımlar

1. **Google OAuth** — admin'den toggle var, backend kodu yazılmadı
2. **Netgsm** — ıslak imza sonrası admin'den key gir → aktif
3. **FCM Push Notification** — henüz yok
4. **Medya upload R2** — şu an sunucuya kaydediliyor (`/var/www/uploads`)
5. **Flutter native app** — aynı API kullanacak

---

## 🐛 Bilinen Önemli Notlar

- `GetBusinessMe` handler'da `cover_url` scan sırası önemli — eksikse 404 döner
- `GetMessages` — role check: user için `user_id`, business için `business_id` ile ownership kontrol
- WebSocket `/ws/conversations/:id?token=JWT` — nginx'te upgrade header gerekli
- İşletme giriş: `is_approved=true` olmadan token verilmez
- Tarih formatı: `r.date.slice(0,10).split("-").reverse().join(".")` → `01.06.2026`
- `hizmetler/page.tsx` ve `page.tsx` → `export const dynamic = "force-dynamic"` (cache yok)
- Sayfa geçişi animasyonu: `AppShell.tsx` → `PageWrapper` key=pathname

---

**Son Güncelleme:** 2026-04-18 · Sistem canlı ve tam çalışır durumda
