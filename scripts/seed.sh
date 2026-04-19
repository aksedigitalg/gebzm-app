#!/bin/bash
# =============================================================================
# Gebzem Platform - Test Verisi Seed Script
# Tüm 10 işletme kategorisinde test hesabı oluşturur
# Kullanım: bash scripts/seed.sh
# Sunucuda:  ssh root@... "bash /opt/gebzem-web/scripts/seed.sh"
# =============================================================================

API="https://gebzem.app/api/v1"
PASS="80148014"
ADMIN_EMAIL="info@gebzemapp.com"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[SEED]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

post() {
  local token="${3:-}"
  if [ -n "$token" ]; then
    curl -s -X POST "$1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$2"
  else
    curl -s -X POST "$1" -H "Content-Type: application/json" -d "$2"
  fi
}
put() { curl -s -X PUT "$1" -H "Content-Type: application/json" -H "Authorization: Bearer $3" -d "$2"; }
jq_val() { echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed 's/.*":"\(.*\)"/\1/'; }
jq_id()  { echo "$1" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/'; }

# =============================================================================
# ADIM 1: Tüm işletmeleri kayıt et
# =============================================================================
log "İşletmeler kayıt ediliyor..."

register() {
  local name="$1" type="$2" email="$3" phone="$4"
  RESP=$(post "$API/auth/business/register" \
    "{\"name\":\"$name\",\"type\":\"$type\",\"email\":\"$email\",\"password\":\"$PASS\",\"phone\":\"$phone\"}")
  log "Kayıt: $name ($type)"
  sleep 0.3
}

register "Ahmet Kuaför"             "kuafor"   "kuafor@test.com"   "05551234001"
register "Gebze Lezzet Restoran"    "restoran" "restoran@test.com" "05551234002"
register "Hızlı Bites"              "yemek"    "yemek@test.com"    "05551234003"
register "Mavi Kafe & Pastane"      "kafe"     "kafe@test.com"     "05551234004"
register "Gebze Fresh Market"       "market"   "market@test.com"   "05551234005"
register "TechStore Gebze"          "magaza"   "magaza@test.com"   "05551234006"
register "Dr. Mehmet Kılıç Kliniği" "doktor"   "doktor@test.com"   "05551234007"
register "Yıldız Elektrik & Tesisat" "usta"    "usta@test.com"     "05551234008"
register "Gebze Emlak Danışmanlık"  "emlakci"  "emlakci@test.com"  "05551234009"
register "Özkan Oto Galeri"         "galerici" "galerici@test.com" "05551234010"

# =============================================================================
# ADIM 2: Hepsini SQL ile onayla (en güvenilir yöntem)
# =============================================================================
log "Tüm test işletmeleri SQL ile onaylanıyor..."
sudo -u postgres psql -d gebzem_db -c "
  UPDATE businesses
  SET is_approved = true, is_active = true
  WHERE email LIKE '%@test.com' OR email = 'info@ahmet.com';
" 2>/dev/null || psql -U gebzem -d gebzem_db -c "
  UPDATE businesses
  SET is_approved = true, is_active = true
  WHERE email LIKE '%@test.com' OR email = 'info@ahmet.com';
" 2>/dev/null
ok "SQL onay tamamlandı"

sleep 1

# =============================================================================
# ADIM 3: Her işletmeye giriş yap ve içerik ekle
# =============================================================================

login_biz() {
  local email="$1"
  local RESP=$(post "$API/auth/business/login" "{\"email\":\"$email\",\"password\":\"$PASS\"}")
  jq_val "$RESP" "token"
}

update_profile() {
  local token="$1" addr="$2" desc="$3"
  put "$API/business/me" "{\"address\":\"$addr\",\"description\":\"$desc\"}" "$token" > /dev/null
}

add_service() { post "$API/business/services" "$2" "$1" > /dev/null; }

add_menu_cat() {
  local RESP=$(post "$API/business/menu/categories" "$2" "$1")
  jq_id "$RESP"
}

add_menu_item() { post "$API/business/menu/items" "$2" "$1" > /dev/null; }

# --- 1. KUAFÖR ---
log "=== Ahmet Kuaför ==="
T=$(login_biz "kuafor@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze Merkez, Mimar Sinan Mah. No:15" "Gebze'nin en köklü kuaförü. 15 yıllık deneyimle saç, sakal ve bakım hizmetleri. Uygun fiyat, profesyonel ellerde."
  add_service "$T" '{"name":"Saç Kesimi","description":"Yıkama ve şekillendirme dahil","price":200,"duration":"30 dk","category":"Saç","is_active":true}'
  add_service "$T" '{"name":"Sakal Düzeltme","description":"Düzgün hat, özen","price":100,"duration":"20 dk","category":"Sakal","is_active":true}'
  add_service "$T" '{"name":"Fön / Şekillendirme","description":"Saç yıkama + fön","price":150,"duration":"45 dk","category":"Saç","is_active":true}'
  add_service "$T" '{"name":"Saç Boyama","description":"Tek renk, yıkama dahil","price":400,"duration":"120 dk","category":"Boya","is_active":true}'
  add_service "$T" '{"name":"Komple Bakım","description":"Kesim + sakal + fön paketi","price":400,"duration":"75 dk","category":"Paket","is_active":true}'
  ok "Ahmet Kuaför — 5 hizmet eklendi"
fi

# --- 2. RESTORAN ---
log "=== Gebze Lezzet Restoran ==="
T=$(login_biz "restoran@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze, İstasyon Cad. No:12, Merkez" "Geleneksel Türk mutfağının en lezzetli temsilcisi. Taze malzemeler, ev yemekleri. Aile ortamında misafirperver hizmet."

  C1=$(add_menu_cat "$T" '{"name":"Çorbalar","description":"Sıcak ve doyurucu","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Ana Yemekler","description":"Günlük pişirilen lezzetler","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Izgara","description":"Köfte, şiş ve etler","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"Tatlılar","description":"Ev yapımı","is_active":true}')
  C5=$(add_menu_cat "$T" '{"name":"İçecekler","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Mercimek Çorbası\",\"description\":\"Taze sebzeli, limonlu\",\"price\":80,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Ezogelin\",\"description\":\"Bulgurlu, naneli\",\"price\":80,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Kuru Fasulye\",\"description\":\"Yanında pirinç pilavı\",\"price\":160,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Etli Güveç\",\"description\":\"Sebzeli dana eti\",\"price\":280,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Tavuk Sote\",\"description\":\"Biberli, pilav ile\",\"price\":220,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Köfte\",\"description\":\"El yapımı ızgara, 200g\",\"price\":250,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Tavuk Şiş\",\"description\":\"Marine edilmiş, 250g\",\"price\":230,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Karışık Izgara\",\"description\":\"Köfte + şiş + kanat\",\"price\":380,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Künefe\",\"description\":\"Antep fıstıklı, sıcak\",\"price\":180,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Sütlaç\",\"description\":\"Fırın, ev yapımı\",\"price\":100,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Çay\",\"description\":\"Demlikten\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Ayran\",\"description\":\"Ev yapımı\",\"price\":40,\"is_available\":true}"
  ok "Gebze Lezzet — 5 kategori, 12 ürün"
fi

# --- 3. YEMEK ---
log "=== Hızlı Bites ==="
T=$(login_biz "yemek@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze, Güzeller Mah. (Tüm Gebze'ye teslimat)" "30 dakikada kapınızda! Burger, pide, lahmacun. Online sipariş için mesaj gönderin."

  C1=$(add_menu_cat "$T" '{"name":"Burgerler","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Pideler","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Lahmacun","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"İçecekler","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Klasik Burger\",\"description\":\"Dana köfte, özel sos\",\"price\":180,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Double Burger\",\"description\":\"Çift köfte, kaşar\",\"price\":250,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Tavuk Burger\",\"description\":\"Crispy tavuk\",\"price\":160,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Karışık Pide\",\"description\":\"Kıyma, biber, domates\",\"price\":140,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Sucuklu Pide\",\"description\":\"Sucuk ve kaşar\",\"price\":130,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Lahmacun (4 adet)\",\"description\":\"İnce hamur, kıymalı\",\"price\":120,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Ayran\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Kola\",\"description\":\"330ml kutu\",\"price\":40,\"is_available\":true}"
  ok "Hızlı Bites — 4 kategori, 8 ürün"
fi

# --- 4. KAFE ---
log "=== Mavi Kafe ==="
T=$(login_biz "kafe@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze, Kent Meydanı No:5" "Sıcak ambiyans, özenle hazırlanmış kahveler ve taze pastalar. Sabah simidinden akşam cheesecake'ine kadar."

  C1=$(add_menu_cat "$T" '{"name":"Kahveler","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Çaylar & Sıcak","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Soğuk İçecekler","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"Atıştırmalıklar","is_active":true}')
  C5=$(add_menu_cat "$T" '{"name":"Tatlılar","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Türk Kahvesi\",\"description\":\"Köpüklü, geleneksel\",\"price\":60,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Espresso\",\"description\":\"Çift shot\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Latte\",\"description\":\"Espresso + süt\",\"price\":100,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Cappuccino\",\"description\":\"Espresso + köpük\",\"price\":95,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Çay (Dem)\",\"description\":\"Taze demleme\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Salep\",\"description\":\"Tarçınlı, sıcak\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Ice Latte\",\"description\":\"Soğuk espresso + süt\",\"price\":110,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Limonata\",\"description\":\"Taze sıkılmış\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Simit\",\"description\":\"Taze fırın\",\"price\":15,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Tost\",\"description\":\"Kaşarlı\",\"price\":60,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Cheesecake\",\"description\":\"New York dilimi\",\"price\":120,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Dilim Kek\",\"description\":\"Günlük taze\",\"price\":70,\"is_available\":true}"
  ok "Mavi Kafe — 5 kategori, 12 ürün"
fi

# --- 5. MARKET ---
log "=== Gebze Fresh Market ==="
T=$(login_biz "market@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze, Bağlarbaşı Mah. No:44" "Taze meyve-sebze, et, şarküteri ve gıda ürünleri. Online sipariş: mesaj gönderin, 2 saat içinde kapınızda."
  ok "Gebze Fresh Market — profil güncellendi"
fi

# --- 6. MAĞAZA ---
log "=== TechStore Gebze ==="
T=$(login_biz "magaza@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze Teknoloji Park, A Blok No:12" "Telefon, tablet, bilgisayar ve aksesuar. Yetkili servis. Her marka, uygun fiyat garantisi."
  ok "TechStore — profil güncellendi"
fi

# --- 7. DOKTOR ---
log "=== Dr. Mehmet Kılıç ==="
T=$(login_biz "doktor@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze, Cumhuriyet Mah. Tıp Merkezi Kat:2" "Dahiliye ve genel sağlık. Randevusuz muayene ve check-up. Kan tahlili laboratuvar hizmeti."
  add_service "$T" '{"name":"Genel Muayene","description":"Dahiliye, tanı ve tedavi","price":500,"duration":"30 dk","category":"Muayene","is_active":true}'
  add_service "$T" '{"name":"Kan Tahlili","description":"Tam kan + biyokimya","price":350,"duration":"15 dk","category":"Tahlil","is_active":true}'
  add_service "$T" '{"name":"Check-Up Paketi","description":"Tam vücut + EKG","price":1200,"duration":"90 dk","category":"Check-Up","is_active":true}'
  add_service "$T" '{"name":"Şeker & Tansiyon","description":"Ölçüm + danışmanlık","price":100,"duration":"10 dk","category":"Muayene","is_active":true}'
  ok "Dr. Mehmet — 4 hizmet eklendi"
fi

# --- 8. USTA ---
log "=== Yıldız Elektrik ==="
T=$(login_biz "usta@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze ve çevresi — 7/24 acil servis" "Elektrik ve tesisat konusunda 20 yıl. Priz, kombi, boya, tadilat. 7/24 acil çağrı."
  add_service "$T" '{"name":"Priz / Anahtar Montajı","price":300,"duration":"30 dk","category":"Elektrik","is_active":true}'
  add_service "$T" '{"name":"Kombi Bakımı","description":"Yıllık bakım ve temizlik","price":600,"duration":"60 dk","category":"Tesisat","is_active":true}'
  add_service "$T" '{"name":"Musluk Tamiri","description":"Damlayan musluk/boru","price":350,"duration":"45 dk","category":"Tesisat","is_active":true}'
  add_service "$T" '{"name":"Boya & Badana","description":"İç cephe oda boyası","price":800,"duration":"1 gün","category":"Tadilat","is_active":true}'
  add_service "$T" '{"name":"Parke Döşeme","description":"m² fiyatı","price":200,"duration":"Proje","category":"Tadilat","is_active":true}'
  ok "Yıldız Elektrik — 5 hizmet eklendi"
fi

# --- 9. EMLAKÇI — İlanlar ekle ---
log "=== Gebze Emlak — ilanlar oluşturuluyor ==="
T=$(login_biz "emlakci@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze Çarşı, Cumhuriyet Cad. No:88" "Gebze ve çevresinde satılık/kiralık konut ve işyeri. 25 yıllık deneyimle güvenilir emlak danışmanlığı."

  # Kullanıcı token ile ilan açmak gerekiyor — /user/listings endpoint
  post "$API/user/listings" \
    '{"title":"Gebze Merkez 3+1 Satılık Daire","category":"emlak","subcategory":"konut-satilik","price":4500000,"price_type":"pazarlik","location":"Gebze Merkez","description":"Cumhuriyet Mah. içinde, 140m², 3+1, 2. kat, asansörlü, otoparklı bina. Metro ve AVM yakını.","attributes":{"alan":"140m²","oda_sayisi":"3+1","kat":"2/6","isitma":"doğalgaz kombi"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  post "$API/user/listings" \
    '{"title":"Gebze Çayırova 2+1 Kiralık Daire","category":"emlak","subcategory":"konut-kiralik","price":18000,"price_type":"sabit","location":"Çayırova, Gebze","description":"Çayırova bölgesinde, 90m², 2+1, temiz, bakımlı. Fabrika ve OSB yakını, ulaşım avantajlı.","attributes":{"alan":"90m²","oda_sayisi":"2+1","kat":"3/5","isitma":"kombi"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  post "$API/user/listings" \
    '{"title":"Gebze Sanayi Kiralık Depo / Fabrika","category":"emlak","subcategory":"isyeri","price":45000,"price_type":"pazarlik","location":"Gebze OSB","description":"1200m² kapalı alan, yüksek tavan, rampa ve TIR girişi. Gebze OSB içi konum.","attributes":{"alan":"1200m²","tip":"depo/fabrika","cephe":"güney"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  ok "Gebze Emlak — 3 ilan eklendi"
fi

# --- 10. GALERİCİ — İlanlar ekle ---
log "=== Özkan Oto Galeri — ilanlar oluşturuluyor ==="
T=$(login_biz "galerici@test.com")
if [ -n "$T" ]; then
  update_profile "$T" "Gebze Sanayi Sitesi, Oto Pazarı No:55" "Sıfır ve ikinci el araç alım-satım. Takas, kredi ve vade imkanları. Her marka ve model stoğumuzda."

  post "$API/user/listings" \
    '{"title":"2022 Toyota Corolla 1.8 Hybrid — 45.000 km","category":"vasita","subcategory":"otomobil","price":1450000,"price_type":"pazarlik","location":"Gebze Oto Pazarı","description":"2022 model, Advance paketi, hasarsız, boyasız, muayeneli. İlk elden, tek mal sahibi.","attributes":{"marka":"Toyota","model":"Corolla","yil":"2022","km":"45.000","yakit":"Hybrid","vites":"Otomatik","renk":"Beyaz"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  post "$API/user/listings" \
    '{"title":"2020 Volkswagen Passat 1.6 TDI — 98.000 km","category":"vasita","subcategory":"otomobil","price":980000,"price_type":"pazarlik","location":"Gebze Oto Pazarı","description":"2020 model, Impression paketi, full bakımlı, tramer yok. Uzun yol dostu dizel.","attributes":{"marka":"VW","model":"Passat","yil":"2020","km":"98.000","yakit":"Dizel","vites":"DSG","renk":"Gri"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  post "$API/user/listings" \
    '{"title":"2019 Ford Transit Custom Minibüs — 130.000 km","category":"vasita","subcategory":"ticari","price":750000,"price_type":"pazarlik","location":"Gebze Oto Pazarı","description":"Servis/servis tipi, 9+1 koltuk, klimalı, bakımlı. Personel taşıma veya turizm için ideal.","attributes":{"marka":"Ford","model":"Transit Custom","yil":"2019","km":"130.000","yakit":"Dizel","tip":"Minibüs"},"listing_type":"kurumsal"}' \
    "$T" > /dev/null

  ok "Özkan Oto Galeri — 3 ilan eklendi"
fi

# =============================================================================
# ÖZET
# =============================================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  SEED TAMAMLANDI — 10 işletme + ilanlar   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Giriş bilgileri (şifre: $PASS):"
echo "  kuafor@test.com    — Ahmet Kuaför (5 hizmet)"
echo "  restoran@test.com  — Gebze Lezzet (12 menü)"
echo "  yemek@test.com     — Hızlı Bites (8 menü)"
echo "  kafe@test.com      — Mavi Kafe (12 menü)"
echo "  market@test.com    — Gebze Fresh Market"
echo "  magaza@test.com    — TechStore Gebze"
echo "  doktor@test.com    — Dr. Mehmet Kılıç (4 hizmet)"
echo "  usta@test.com      — Yıldız Elektrik (5 hizmet)"
echo "  emlakci@test.com   — Gebze Emlak (3 ilan)"
echo "  galerici@test.com  — Özkan Oto Galeri (3 ilan)"
echo ""
echo "Admin: $ADMIN_EMAIL / $PASS"
