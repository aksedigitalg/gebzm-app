#!/bin/bash
# =============================================================================
# Gebzem Platform - Test Verisi Seed Script
# Tüm 10 işletme kategorisinde test hesabı oluşturur
# Kullanım: bash scripts/seed.sh
# =============================================================================

API="https://gebzem.app/api/v1"
PASS="80148014"
ADMIN_EMAIL="info@gebzemapp.com"
ADMIN_PASS="80148014"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[SEED]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# JSON değerini çıkar
jq_val() { echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed 's/.*":"\(.*\)"/\1/'; }
jq_id()  { echo "$1" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/'; }

# POST helper
post() {
  local url="$1" data="$2" token="${3:-}"
  if [ -n "$token" ]; then
    curl -s -X POST "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
}

# PUT helper
put() {
  local url="$1" data="$2" token="${3:-}"
  curl -s -X PUT "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "$data"
}

# =============================================================================
# ADIM 1: Admin girişi
# =============================================================================
log "Admin girişi yapılıyor..."
ADMIN_RESP=$(post "$API/auth/admin/login" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
ADMIN_TOKEN=$(jq_val "$ADMIN_RESP" "token")
if [ -z "$ADMIN_TOKEN" ]; then
  err "Admin girişi başarısız! Yanıt: $ADMIN_RESP"
  exit 1
fi
ok "Admin girişi başarılı"

# =============================================================================
# ADIM 2: İşletmeleri kayıt et + onayla + içerik ekle
# =============================================================================

register_and_approve() {
  local name="$1" type="$2" email="$3" phone="$4" address="$5" desc="$6"

  log "Kayıt: $name ($type)"

  # Kayıt
  RESP=$(post "$API/auth/business/register" \
    "{\"name\":\"$name\",\"type\":\"$type\",\"email\":\"$email\",\"password\":\"$PASS\",\"phone\":\"$phone\"}")

  # Tüm işletmeleri listele ve bu işletmenin ID'sini bul
  sleep 0.5
  ALL=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API/admin/businesses")
  BIZ_ID=$(echo "$ALL" | grep -o "\"id\":\"[^\"]*\",\"name\":\"$name\"" | grep -o '"id":"[^"]*"' | sed 's/"id":"\(.*\)"/\1/')

  if [ -z "$BIZ_ID" ]; then
    warn "$name için ID bulunamadı, listeleme..."
    echo "$ALL" | grep -o '"name":"[^"]*"' | head -5
    return 1
  fi

  # Onayla
  APPROVE=$(put "$API/admin/businesses/$BIZ_ID/approve" '{}' "$ADMIN_TOKEN")
  ok "$name onaylandı (ID: $BIZ_ID)"

  # Profil güncelle
  BIZ_LOGIN=$(post "$API/auth/business/login" "{\"email\":\"$email\",\"password\":\"$PASS\"}")
  BIZ_TOKEN=$(jq_val "$BIZ_LOGIN" "token")

  if [ -n "$BIZ_TOKEN" ]; then
    put "$API/business/me" \
      "{\"address\":\"$address\",\"description\":\"$desc\"}" \
      "$BIZ_TOKEN" > /dev/null
    echo "$BIZ_TOKEN"  # token'ı döndür
  else
    warn "$name için token alınamadı"
    echo ""
  fi
}

# =============================================================================
# 1. KUAFÖR — Ahmet Kuaför
# =============================================================================
log "=== 1. KUAFÖR ==="
TOKEN=$(register_and_approve \
  "Ahmet Kuaför" "kuafor" "kuafor@test.com" "05551234001" \
  "Gebze Merkez, Mimar Sinan Mah." \
  "Gebze'nin en köklü kuaförlerinden. 15 yıllık deneyimle saç, sakal ve bakım hizmetleri sunuyoruz.")

if [ -n "$TOKEN" ]; then
  post "$API/business/services" \
    '{"name":"Saç Kesimi","description":"Erkek saç kesimi, yıkama dahil","price":200,"duration":"30 dk","category":"Saç","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Sakal Düzeltme","description":"Sakal şekillendirme ve düzeltme","price":100,"duration":"20 dk","category":"Sakal","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Fön / Şekillendirme","description":"Profesyonel fön ve şekillendirme","price":150,"duration":"45 dk","category":"Saç","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Saç Boyama","description":"Tek renk saç boyama, yıkama dahil","price":400,"duration":"120 dk","category":"Boya","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Komple Bakım","description":"Kesim + sakal + fön paketi","price":400,"duration":"75 dk","category":"Paket","is_active":true}' "$TOKEN" > /dev/null
  ok "Ahmet Kuaför hizmetleri eklendi"
fi

# =============================================================================
# 2. RESTORAN — Gebze Lezzet
# =============================================================================
log "=== 2. RESTORAN ==="
TOKEN=$(register_and_approve \
  "Gebze Lezzet Restoran" "restoran" "restoran@test.com" "05551234002" \
  "Gebze, İstasyon Cad. No:12" \
  "Geleneksel Türk mutfağının en lezzetli temsilcisi. Taze malzemeler, ev yemekleri ve özel tarifler.")

if [ -n "$TOKEN" ]; then
  # Kategoriler
  CAT1=$(post "$API/business/menu/categories" \
    '{"name":"Başlangıçlar","description":"Çorbalar ve mezeler","is_active":true}' "$TOKEN")
  CAT1_ID=$(jq_id "$CAT1")

  CAT2=$(post "$API/business/menu/categories" \
    '{"name":"Ana Yemekler","description":"Etli ve sebzeli yemekler","is_active":true}' "$TOKEN")
  CAT2_ID=$(jq_id "$CAT2")

  CAT3=$(post "$API/business/menu/categories" \
    '{"name":"Izgara","description":"Köfte, şiş ve et yemekleri","is_active":true}' "$TOKEN")
  CAT3_ID=$(jq_id "$CAT3")

  CAT4=$(post "$API/business/menu/categories" \
    '{"name":"Tatlılar","description":"Ev yapımı tatlılar","is_active":true}' "$TOKEN")
  CAT4_ID=$(jq_id "$CAT4")

  CAT5=$(post "$API/business/menu/categories" \
    '{"name":"İçecekler","description":"Sıcak ve soğuk içecekler","is_active":true}' "$TOKEN")
  CAT5_ID=$(jq_id "$CAT5")

  # Başlangıçlar
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Mercimek Çorbası\",\"description\":\"Taze sebzelerle hazırlanmış kırmızı mercimek çorbası\",\"price\":80,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Ezogelin Çorbası\",\"description\":\"Geleneksel Türk çorbası\",\"price\":80,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Cacık\",\"description\":\"Yoğurt, salatalık ve nane\",\"price\":60,\"is_available\":true}" "$TOKEN" > /dev/null

  # Ana Yemekler
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Kuru Fasulye\",\"description\":\"Yanında pirinç pilavı ile servis edilir\",\"price\":160,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Etli Güveç\",\"description\":\"Sebzeli dana eti güveç\",\"price\":280,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Tavuk Sote\",\"description\":\"Biberli tavuk sote, pilav ile\",\"price\":220,\"is_available\":true}" "$TOKEN" > /dev/null

  # Izgara
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Köfte\",\"description\":\"El yapımı ızgara köfte, 200g\",\"price\":250,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Tavuk Şiş\",\"description\":\"Marine edilmiş tavuk şiş, 250g\",\"price\":230,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Karışık Izgara\",\"description\":\"Köfte, şiş ve tavuk kanadı tabağı\",\"price\":380,\"is_available\":true}" "$TOKEN" > /dev/null

  # Tatlılar
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT4_ID\",\"name\":\"Künefe\",\"description\":\"Antep fıstıklı sıcak künefe\",\"price\":180,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT4_ID\",\"name\":\"Sütlaç\",\"description\":\"Fırın sütlaç, ev yapımı\",\"price\":100,\"is_available\":true}" "$TOKEN" > /dev/null

  # İçecekler
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT5_ID\",\"name\":\"Çay\",\"description\":\"Türk çayı, demlikten\",\"price\":30,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT5_ID\",\"name\":\"Ayran\",\"description\":\"Ev yapımı ayran\",\"price\":40,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT5_ID\",\"name\":\"Kola / Sprite\",\"description\":\"330ml kutu\",\"price\":50,\"is_available\":true}" "$TOKEN" > /dev/null

  ok "Gebze Lezzet menüsü eklendi (5 kategori, 14 ürün)"
fi

# =============================================================================
# 3. YEMEK TESLİMAT — Hızlı Bites
# =============================================================================
log "=== 3. YEMEK TESLİMAT ==="
TOKEN=$(register_and_approve \
  "Hızlı Bites" "yemek" "yemek@test.com" "05551234003" \
  "Gebze, Güzeller Mah. Teslimat: tüm Gebze" \
  "Gebze'ye hızlı yemek teslimatı. 30 dakikada kapınızda! Burger, pide, lahmacun ve daha fazlası.")

if [ -n "$TOKEN" ]; then
  CAT1=$(post "$API/business/menu/categories" '{"name":"Burgerler","is_active":true}' "$TOKEN")
  CAT1_ID=$(jq_id "$CAT1")
  CAT2=$(post "$API/business/menu/categories" '{"name":"Pideler","is_active":true}' "$TOKEN")
  CAT2_ID=$(jq_id "$CAT2")
  CAT3=$(post "$API/business/menu/categories" '{"name":"Lahmacun & Pide","is_active":true}' "$TOKEN")
  CAT3_ID=$(jq_id "$CAT3")

  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Klasik Burger\",\"description\":\"Dana köfte, domates, marul, özel sos\",\"price\":180,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Double Burger\",\"description\":\"Çift köfte, peynir, özel sos\",\"price\":250,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Tavuk Burger\",\"description\":\"Crispy tavuk, coleslaw\",\"price\":160,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Karışık Pide\",\"description\":\"Kıyma, biber, domates\",\"price\":140,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Sucuklu Pide\",\"description\":\"Sucuk ve kaşar peyniri\",\"price\":130,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Lahmacun (4'lü)\",\"description\":\"İnce hamur, kıymalı\",\"price\":120,\"is_available\":true}" "$TOKEN" > /dev/null

  ok "Hızlı Bites menüsü eklendi"
fi

# =============================================================================
# 4. KAFE — Mavi Kafe
# =============================================================================
log "=== 4. KAFE ==="
TOKEN=$(register_and_approve \
  "Mavi Kafe & Pastane" "kafe" "kafe@test.com" "05551234004" \
  "Gebze, Kent Meydanı No:5" \
  "Sıcak bir ambiyans, özenle hazırlanmış kahveler ve taze pastalar. Her sabah fırından çıkan simit ve pogaçalar.")

if [ -n "$TOKEN" ]; then
  CAT1=$(post "$API/business/menu/categories" '{"name":"Kahveler","is_active":true}' "$TOKEN")
  CAT1_ID=$(jq_id "$CAT1")
  CAT2=$(post "$API/business/menu/categories" '{"name":"Çaylar & Sıcak İçecekler","is_active":true}' "$TOKEN")
  CAT2_ID=$(jq_id "$CAT2")
  CAT3=$(post "$API/business/menu/categories" '{"name":"Soğuk İçecekler","is_active":true}' "$TOKEN")
  CAT3_ID=$(jq_id "$CAT3")
  CAT4=$(post "$API/business/menu/categories" '{"name":"Atıştırmalıklar","is_active":true}' "$TOKEN")
  CAT4_ID=$(jq_id "$CAT4")
  CAT5=$(post "$API/business/menu/categories" '{"name":"Tatlılar & Pastalar","is_active":true}' "$TOKEN")
  CAT5_ID=$(jq_id "$CAT5")

  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Türk Kahvesi\",\"description\":\"Geleneksel köpüklü Türk kahvesi\",\"price\":60,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Espresso\",\"description\":\"Çift shot espresso\",\"price\":70,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Latte\",\"description\":\"Espresso + buharlanmış süt\",\"price\":100,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT1_ID\",\"name\":\"Cappuccino\",\"description\":\"Espresso, süt köpüğü\",\"price\":95,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Çay (Dem)\",\"description\":\"Taze demleme çay\",\"price\":30,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Bitki Çayı\",\"description\":\"Nane-limon, ıhlamur veya adaçayı\",\"price\":50,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT2_ID\",\"name\":\"Salep\",\"description\":\"Tarçınlı sıcak salep\",\"price\":70,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Ice Latte\",\"description\":\"Soğuk espresso ve süt\",\"price\":110,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT3_ID\",\"name\":\"Limonata\",\"description\":\"Taze sıkılmış limonata\",\"price\":70,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT4_ID\",\"name\":\"Simit\",\"description\":\"Taze fırın simit\",\"price\":15,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT4_ID\",\"name\":\"Tost\",\"description\":\"Kaşarlı tost\",\"price\":60,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT5_ID\",\"name\":\"Dilim Kek\",\"description\":\"Günlük taze kek çeşitleri\",\"price\":70,\"is_available\":true}" "$TOKEN" > /dev/null
  post "$API/business/menu/items" \
    "{\"category_id\":\"$CAT5_ID\",\"name\":\"Cheesecake\",\"description\":\"New York cheesecake dilimi\",\"price\":120,\"is_available\":true}" "$TOKEN" > /dev/null

  ok "Mavi Kafe menüsü eklendi (5 kategori, 13 ürün)"
fi

# =============================================================================
# 5. MARKET — Gebze Fresh Market
# =============================================================================
log "=== 5. MARKET ==="
TOKEN=$(register_and_approve \
  "Gebze Fresh Market" "market" "market@test.com" "05551234005" \
  "Gebze, Bağlarbaşı Mah. No:44" \
  "Taze meyve-sebze, et, şarküteri ve gıda ürünleri. Online sipariş ile 2 saat içinde kapınıza.")

if [ -n "$TOKEN" ]; then
  ok "Gebze Fresh Market profil tamamlandı"
fi

# =============================================================================
# 6. MAĞAZA — TechStore Gebze
# =============================================================================
log "=== 6. MAĞAZA ==="
TOKEN=$(register_and_approve \
  "TechStore Gebze" "magaza" "magaza@test.com" "05551234006" \
  "Gebze Teknoloji Park, A Blok No:12" \
  "Telefon, tablet, bilgisayar ve aksesuar. Yetkili servis ve teknik destek. Her marka, uygun fiyat.")

if [ -n "$TOKEN" ]; then
  ok "TechStore Gebze profil tamamlandı"
fi

# =============================================================================
# 7. DOKTOR — Dr. Mehmet Kılıç Kliniği
# =============================================================================
log "=== 7. DOKTOR ==="
TOKEN=$(register_and_approve \
  "Dr. Mehmet Kılıç Kliniği" "doktor" "doktor@test.com" "05551234007" \
  "Gebze, Cumhuriyet Mah. Tıp Merkezi Kat:2" \
  "Dahiliye ve genel sağlık hizmetleri. Randevusuz muayene ve check-up. Kan tahlili laboratuvar hizmeti.")

if [ -n "$TOKEN" ]; then
  post "$API/business/services" \
    '{"name":"Genel Muayene","description":"Dahiliye muayene, tanı ve tedavi","price":500,"duration":"30 dk","category":"Muayene","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Kan Tahlili Paketi","description":"Tam kan sayımı, biyokimya","price":350,"duration":"15 dk","category":"Tahlil","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Check-Up Paketi","description":"Tam vücut kontrolü, EKG dahil","price":1200,"duration":"90 dk","category":"Check-Up","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Şeker Ölçümü","description":"Açlık kan şekeri testi","price":100,"duration":"10 dk","category":"Tahlil","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Tansiyon Ölçümü","description":"Kan basıncı ölçümü ve danışmanlık","price":80,"duration":"10 dk","category":"Muayene","is_active":true}' "$TOKEN" > /dev/null
  ok "Dr. Mehmet hizmetleri eklendi"
fi

# =============================================================================
# 8. USTA — Yıldız Elektrik & Tesisat
# =============================================================================
log "=== 8. USTA ==="
TOKEN=$(register_and_approve \
  "Yıldız Elektrik & Tesisat" "usta" "usta@test.com" "05551234008" \
  "Gebze ve çevresi, 7/24 acil servis" \
  "Elektrik ve tesisat konusunda 20 yıllık tecrübe. Priz, kombi, boya, taşıma ve tadilat hizmetleri. 7/24 acil çağrı.")

if [ -n "$TOKEN" ]; then
  post "$API/business/services" \
    '{"name":"Priz / Anahtar Montajı","description":"Elektrik prizi veya anahtar değişimi","price":300,"duration":"30 dk","category":"Elektrik","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Sigorta Panosu","description":"Sigorta atması ve panel bakımı","price":400,"duration":"45 dk","category":"Elektrik","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Kombi Bakımı","description":"Yıllık kombi bakım ve temizliği","price":600,"duration":"60 dk","category":"Tesisat","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Musluk / Tesisat Tamiri","description":"Damlayan musluk veya boru tamiri","price":350,"duration":"45 dk","category":"Tesisat","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Boya & Badana","description":"Oda veya daire iç cephe boyası","price":800,"duration":"1 gün","category":"Tadilat","is_active":true}' "$TOKEN" > /dev/null
  post "$API/business/services" \
    '{"name":"Asma Tavan","description":"Alçıpan veya metal asma tavan","price":1200,"duration":"2 gün","category":"Tadilat","is_active":true}' "$TOKEN" > /dev/null
  ok "Yıldız Elektrik hizmetleri eklendi"
fi

# =============================================================================
# 9. EMLAKÇI — Gebze Emlak Danışmanlık
# =============================================================================
log "=== 9. EMLAKÇI ==="
TOKEN=$(register_and_approve \
  "Gebze Emlak Danışmanlık" "emlakci" "emlakci@test.com" "05551234009" \
  "Gebze Çarşı, Cumhuriyet Cad. No:88" \
  "Gebze ve çevresinde satılık, kiralık konut ve işyeri. 25 yıllık tecrübe ile güvenilir emlak danışmanlığı.")

if [ -n "$TOKEN" ]; then
  ok "Gebze Emlak profil tamamlandı"
fi

# =============================================================================
# 10. GALERİCİ — Özkan Oto Galeri
# =============================================================================
log "=== 10. GALERİCİ ==="
TOKEN=$(register_and_approve \
  "Özkan Oto Galeri" "galerici" "galerici@test.com" "05551234010" \
  "Gebze Sanayi Sitesi, Oto Pazarı No:55" \
  "Sıfır ve ikinci el araç alım-satım. Takas, kredi ve vade imkanları. Her marka ve model stoğumuzda.")

if [ -n "$TOKEN" ]; then
  ok "Özkan Oto Galeri profil tamamlandı"
fi

# =============================================================================
# TAMAMLANDI
# =============================================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  SEED TAMAMLANDI — 10 işletme oluşturuldu  ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "İşletme Hesapları:"
echo "  kuafor@test.com    — Ahmet Kuaför         (şifre: $PASS)"
echo "  restoran@test.com  — Gebze Lezzet Restoran (şifre: $PASS)"
echo "  yemek@test.com     — Hızlı Bites           (şifre: $PASS)"
echo "  kafe@test.com      — Mavi Kafe & Pastane   (şifre: $PASS)"
echo "  market@test.com    — Gebze Fresh Market     (şifre: $PASS)"
echo "  magaza@test.com    — TechStore Gebze        (şifre: $PASS)"
echo "  doktor@test.com    — Dr. Mehmet Kılıç       (şifre: $PASS)"
echo "  usta@test.com      — Yıldız Elektrik        (şifre: $PASS)"
echo "  emlakci@test.com   — Gebze Emlak            (şifre: $PASS)"
echo "  galerici@test.com  — Özkan Oto Galeri       (şifre: $PASS)"
echo ""
echo "Admin: $ADMIN_EMAIL / $ADMIN_PASS"
