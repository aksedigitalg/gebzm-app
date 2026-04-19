#!/bin/bash
# =============================================================================
# Gebzem Platform - Test Verisi Seed Script
# Kullanım: ssh root@... "bash /opt/gebzem-web/scripts/seed.sh"
# =============================================================================

API="https://gebzem.app/api/v1"
PASS="80148014"

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
# ADIM 1: SQL ile işletmeleri doğrudan ekle (Türkçe karakter sorunu yok)
# =============================================================================
log "SQL ile 10 işletme ekleniyor ve onaylanıyor..."

sudo -u postgres psql -d gebzem_db << 'SQLEOF'
-- pgcrypto gerekli
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tüm işletmeleri sil (temiz başlangıç)
DELETE FROM businesses;

-- 10 işletme ekle
INSERT INTO businesses (name, type, email, password_hash, phone, is_approved, is_active) VALUES
  ('Ahmet Kuaför',              'kuafor',   'kuafor@test.com',   crypt('80148014', gen_salt('bf', 10)), '05551234001', true, true),
  ('Gebze Lezzet Restoran',     'restoran', 'restoran@test.com', crypt('80148014', gen_salt('bf', 10)), '05551234002', true, true),
  ('Hızlı Bites',               'yemek',    'yemek@test.com',    crypt('80148014', gen_salt('bf', 10)), '05551234003', true, true),
  ('Mavi Kafe & Pastane',       'kafe',     'kafe@test.com',     crypt('80148014', gen_salt('bf', 10)), '05551234004', true, true),
  ('Gebze Fresh Market',        'market',   'market@test.com',   crypt('80148014', gen_salt('bf', 10)), '05551234005', true, true),
  ('TechStore Gebze',           'magaza',   'magaza@test.com',   crypt('80148014', gen_salt('bf', 10)), '05551234006', true, true),
  ('Dr. Mehmet Kılıç Kliniği',  'doktor',   'doktor@test.com',   crypt('80148014', gen_salt('bf', 10)), '05551234007', true, true),
  ('Yıldız Elektrik & Tesisat', 'usta',     'usta@test.com',     crypt('80148014', gen_salt('bf', 10)), '05551234008', true, true),
  ('Gebze Emlak Danışmanlık',   'emlakci',  'emlakci@test.com',  crypt('80148014', gen_salt('bf', 10)), '05551234009', true, true),
  ('Özkan Oto Galeri',          'galerici', 'galerici@test.com', crypt('80148014', gen_salt('bf', 10)), '05551234010', true, true);

-- Adres ve açıklamaları güncelle
UPDATE businesses SET address='Gebze Merkez, Mimar Sinan Mah. No:15',         description='Gebzede en köklü kuaför. 15 yıllık deneyimle saç, sakal ve bakım hizmetleri.'                WHERE email='kuafor@test.com';
UPDATE businesses SET address='Gebze, İstasyon Cad. No:12, Merkez',            description='Geleneksel Türk mutfağı. Taze malzemeler, ev yemekleri, aile ortamı.'                       WHERE email='restoran@test.com';
UPDATE businesses SET address='Gebze, Güzeller Mah. (Tüm Gebzede teslimat)',  description='30 dakikada kapınızda! Burger, pide, lahmacun. Online sipariş için mesaj gönderin.'       WHERE email='yemek@test.com';
UPDATE businesses SET address='Gebze, Kent Meydanı No:5',                       description='Sıcak ambiyans, özenle hazırlanmış kahveler ve taze pastalar. Sabahtan akşama.'             WHERE email='kafe@test.com';
UPDATE businesses SET address='Gebze, Bağlarbaşı Mah. No:44',                  description='Taze meyve-sebze, et, şarküteri. Online sipariş: 2 saat içinde kapınızda.'                WHERE email='market@test.com';
UPDATE businesses SET address='Gebze Teknoloji Park, A Blok No:12',             description='Telefon, tablet, bilgisayar, aksesuar. Yetkili servis. Her marka uygun fiyat.'            WHERE email='magaza@test.com';
UPDATE businesses SET address='Gebze, Cumhuriyet Mah. Tıp Merkezi Kat:2',      description='Dahiliye ve genel sağlık. Randevusuz muayene. Kan tahlili laboratuvar hizmeti.'           WHERE email='doktor@test.com';
UPDATE businesses SET address='Gebze ve çevresi, 7/24 acil servis',            description='Elektrik ve tesisat, 20 yıl deneyim. Priz, kombi, boya, tadilat. 7/24 acil çağrı.'       WHERE email='usta@test.com';
UPDATE businesses SET address='Gebze Çarşı, Cumhuriyet Cad. No:88',            description='Satılık, kiralık konut ve işyeri. 25 yıllık deneyimle güvenilir emlak danışmanlığı.'     WHERE email='emlakci@test.com';
UPDATE businesses SET address='Gebze Sanayi Sitesi, Oto Pazarı No:55',         description='Sıfır ve ikinci el araç alım-satım. Takas, kredi imkanları. Her marka stoğumuzda.'       WHERE email='galerici@test.com';

SELECT name, type, is_approved FROM businesses ORDER BY created_at;
SQLEOF

ok "SQL insert tamamlandı"
sleep 1

# =============================================================================
# ADIM 2: Her işletmeye giriş yap ve içerik ekle
# =============================================================================

login_biz() {
  local RESP=$(post "$API/auth/business/login" "{\"email\":\"$1\",\"password\":\"$PASS\"}")
  jq_val "$RESP" "token"
}

add_service() { post "$API/business/services" "$2" "$1" > /dev/null; }

add_menu_cat() {
  local RESP=$(post "$API/business/menu/categories" "$2" "$1")
  jq_id "$RESP"
}

add_menu_item() { post "$API/business/menu/items" "$2" "$1" > /dev/null; }

# --- KUAFÖR ---
log "Hizmetler ekleniyor: Ahmet Kuaför"
T=$(login_biz "kuafor@test.com")
if [ -n "$T" ]; then
  add_service "$T" '{"name":"Sac Kesimi","description":"Yikama ve sekillendirme dahil","price":200,"duration":"30 dk","category":"Sac","is_active":true}'
  add_service "$T" '{"name":"Sakal Duzeltme","description":"Duzgun hat, ozen","price":100,"duration":"20 dk","category":"Sakal","is_active":true}'
  add_service "$T" '{"name":"Fon Sekillendirme","description":"Sac yikama + fon","price":150,"duration":"45 dk","category":"Sac","is_active":true}'
  add_service "$T" '{"name":"Sac Boyama","description":"Tek renk, yikama dahil","price":400,"duration":"120 dk","category":"Boya","is_active":true}'
  add_service "$T" '{"name":"Komple Bakim","description":"Kesim + sakal + fon paketi","price":400,"duration":"75 dk","category":"Paket","is_active":true}'
  ok "Ahmet Kuaför — 5 hizmet"
fi

# --- RESTORAN ---
log "Menü ekleniyor: Gebze Lezzet"
T=$(login_biz "restoran@test.com")
if [ -n "$T" ]; then
  C1=$(add_menu_cat "$T" '{"name":"Corbalar","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Ana Yemekler","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Izgara","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"Tatlilar","is_active":true}')
  C5=$(add_menu_cat "$T" '{"name":"Icecekler","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Mercimek Corbasi\",\"description\":\"Taze sebzeli, limonlu\",\"price\":80,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Ezogelin\",\"description\":\"Bulgurlu, naneli\",\"price\":80,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Kuru Fasulye\",\"description\":\"Yaninda pirinc pilavi\",\"price\":160,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Etli Guvec\",\"description\":\"Sebzeli dana eti\",\"price\":280,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Tavuk Sote\",\"description\":\"Biberli, pilav ile\",\"price\":220,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Kofte\",\"description\":\"El yapimi izgara, 200g\",\"price\":250,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Tavuk Sis\",\"description\":\"Marine edilmis, 250g\",\"price\":230,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Karisik Izgara\",\"description\":\"Kofte + sis + kanat\",\"price\":380,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Kunefe\",\"description\":\"Antep fistikli, sicak\",\"price\":180,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Sutlac\",\"description\":\"Firin, ev yapimi\",\"price\":100,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Cay\",\"description\":\"Demlikten\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Ayran\",\"description\":\"Ev yapimi\",\"price\":40,\"is_available\":true}"
  ok "Gebze Lezzet — 5 kategori, 12 urun"
fi

# --- YEMEK ---
log "Menü ekleniyor: Hizli Bites"
T=$(login_biz "yemek@test.com")
if [ -n "$T" ]; then
  C1=$(add_menu_cat "$T" '{"name":"Burgerler","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Pideler","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Lahmacun","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"Icecekler","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Klasik Burger\",\"description\":\"Dana kofte, ozel sos\",\"price\":180,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Double Burger\",\"description\":\"Cift kofte, kasar\",\"price\":250,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Tavuk Burger\",\"description\":\"Crispy tavuk\",\"price\":160,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Karisik Pide\",\"description\":\"Kiyma, biber, domates\",\"price\":140,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Sucuklu Pide\",\"description\":\"Sucuk ve kasar\",\"price\":130,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Lahmacun 4 adet\",\"description\":\"Ince hamur, kiymali\",\"price\":120,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Ayran\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Kola\",\"description\":\"330ml kutu\",\"price\":40,\"is_available\":true}"
  ok "Hizli Bites — 4 kategori, 8 urun"
fi

# --- KAFE ---
log "Menü ekleniyor: Mavi Kafe"
T=$(login_biz "kafe@test.com")
if [ -n "$T" ]; then
  C1=$(add_menu_cat "$T" '{"name":"Kahveler","is_active":true}')
  C2=$(add_menu_cat "$T" '{"name":"Caylar ve Sicak","is_active":true}')
  C3=$(add_menu_cat "$T" '{"name":"Soguk Icecekler","is_active":true}')
  C4=$(add_menu_cat "$T" '{"name":"Atistirmaliklar","is_active":true}')
  C5=$(add_menu_cat "$T" '{"name":"Tatlilar","is_active":true}')

  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Turk Kahvesi\",\"description\":\"Kopuklu, geleneksel\",\"price\":60,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Espresso\",\"description\":\"Cift shot\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Latte\",\"description\":\"Espresso ve sut\",\"price\":100,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C1\",\"name\":\"Cappuccino\",\"description\":\"Espresso ve kopuk\",\"price\":95,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Cay\",\"description\":\"Taze demleme\",\"price\":30,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C2\",\"name\":\"Salep\",\"description\":\"Tarcinli, sicak\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Ice Latte\",\"description\":\"Soguk espresso sut\",\"price\":110,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C3\",\"name\":\"Limonata\",\"description\":\"Taze sikilmis\",\"price\":70,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Simit\",\"description\":\"Taze firin\",\"price\":15,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C4\",\"name\":\"Tost\",\"description\":\"Kasarli\",\"price\":60,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Cheesecake\",\"description\":\"New York dilimi\",\"price\":120,\"is_available\":true}"
  add_menu_item "$T" "{\"category_id\":\"$C5\",\"name\":\"Dilim Kek\",\"description\":\"Gunluk taze\",\"price\":70,\"is_available\":true}"
  ok "Mavi Kafe — 5 kategori, 12 urun"
fi

# --- DOKTOR ---
log "Hizmetler ekleniyor: Dr. Mehmet"
T=$(login_biz "doktor@test.com")
if [ -n "$T" ]; then
  add_service "$T" '{"name":"Genel Muayene","description":"Dahiliye, tani ve tedavi","price":500,"duration":"30 dk","category":"Muayene","is_active":true}'
  add_service "$T" '{"name":"Kan Tahlili","description":"Tam kan ve biyokimya","price":350,"duration":"15 dk","category":"Tahlil","is_active":true}'
  add_service "$T" '{"name":"Check-Up Paketi","description":"Tam vucut ve EKG","price":1200,"duration":"90 dk","category":"Check-Up","is_active":true}'
  add_service "$T" '{"name":"Seker ve Tansiyon","description":"Olcum ve danismanlik","price":100,"duration":"10 dk","category":"Muayene","is_active":true}'
  ok "Dr. Mehmet — 4 hizmet"
fi

# --- USTA ---
log "Hizmetler ekleniyor: Yildiz Elektrik"
T=$(login_biz "usta@test.com")
if [ -n "$T" ]; then
  add_service "$T" '{"name":"Priz Montaji","description":"Elektrik prizi degisimi","price":300,"duration":"30 dk","category":"Elektrik","is_active":true}'
  add_service "$T" '{"name":"Kombi Bakimi","description":"Yillik bakim ve temizlik","price":600,"duration":"60 dk","category":"Tesisat","is_active":true}'
  add_service "$T" '{"name":"Musluk Tamiri","description":"Damlayan musluk boru","price":350,"duration":"45 dk","category":"Tesisat","is_active":true}'
  add_service "$T" '{"name":"Boya Badana","description":"Ic cephe oda boyasi","price":800,"duration":"1 gun","category":"Tadilat","is_active":true}'
  add_service "$T" '{"name":"Parke Doseme","description":"m2 fiyati","price":200,"duration":"Proje","category":"Tadilat","is_active":true}'
  ok "Yildiz Elektrik — 5 hizmet"
fi

# --- EMLAKÇI — İlanlar ---
log "İlanlar ekleniyor: Gebze Emlak"
T=$(login_biz "emlakci@test.com")
if [ -n "$T" ]; then
  post "$API/business/listings" '{"title":"Gebze Merkez 3+1 Satilik Daire","category":"emlak","subcategory":"konut-satilik","price":4500000,"price_type":"pazarlik","location":"Gebze Merkez","description":"Cumhuriyet Mah. 140m2, 3+1, 2. kat, asansorlu, otoparkli. Metro ve AVM yakini.","attributes":{"alan":"140m2","oda":"3+1","kat":"2/6","isitma":"dogalgaz"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"Cayirova 2+1 Kiralik Daire","category":"emlak","subcategory":"konut-kiralik","price":18000,"price_type":"sabit","location":"Cayirova Gebze","description":"90m2, 2+1, temiz bakimli. Fabrika OSB yakini, ulasim avantajli.","attributes":{"alan":"90m2","oda":"2+1","kat":"3/5"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"Gebze OSB Kiralik Depo 1200m2","category":"emlak","subcategory":"isyeri","price":45000,"price_type":"pazarlik","location":"Gebze OSB","description":"1200m2 kapali alan, yuksek tavan, rampa. TIR girisi mevcut."}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"Gebze Merkez 4+1 Satilik Lux Daire","category":"emlak","subcategory":"konut-satilik","price":7200000,"price_type":"pazarlik","location":"Gebze Merkez","description":"Yeni bina, 180m2, 4+1, site ici, guvenlikli, acik kapali otopark.","attributes":{"alan":"180m2","oda":"4+1","kat":"5/10","isitma":"dogalgaz"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"Cayirova Kiralik Dukkan 80m2","category":"emlak","subcategory":"isyeri","price":12000,"price_type":"sabit","location":"Cayirova Gebze","description":"Ana cadde uzeri, 80m2, vitrinli, teslime hazir dukkan.","attributes":{"alan":"80m2"}}' "$T" > /dev/null
  ok "Gebze Emlak — 5 ilan"
fi

# --- GALERİCİ — İlanlar ---
log "İlanlar ekleniyor: Ozkan Oto Galeri"
T=$(login_biz "galerici@test.com")
if [ -n "$T" ]; then
  post "$API/business/listings" '{"title":"2022 Toyota Corolla Hybrid 45.000 km","category":"vasita","subcategory":"otomobil","price":1450000,"price_type":"pazarlik","location":"Gebze Oto Pazari","description":"2022 model, Advance paket, hasarsiz, boyasiz, muayeneli. Ilk elden.","attributes":{"marka":"Toyota","model":"Corolla","yil":"2022","km":"45.000","yakit":"Hybrid","renk":"Beyaz"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"2020 VW Passat 1.6 TDI 98.000 km","category":"vasita","subcategory":"otomobil","price":980000,"price_type":"pazarlik","location":"Gebze Oto Pazari","description":"2020 model, Impression paket, full bakimli, tramer yok. Uzun yol dostu.","attributes":{"marka":"VW","model":"Passat","yil":"2020","km":"98.000","yakit":"Dizel"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"2019 Ford Transit 9+1 Minibus 130.000 km","category":"vasita","subcategory":"ticari","price":750000,"price_type":"pazarlik","location":"Gebze Oto Pazari","description":"Servis tipi, 9+1 koltuk, klimali, bakimli. Personel tasima icin ideal.","attributes":{"marka":"Ford","model":"Transit","yil":"2019","km":"130.000","tip":"Minibus"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"2021 Honda Civic 1.5 VTEC 62.000 km","category":"vasita","subcategory":"otomobil","price":1180000,"price_type":"pazarlik","location":"Gebze Oto Pazari","description":"2021 model, Executive paket, hasarsiz, ilk elden, 62.000 km.","attributes":{"marka":"Honda","model":"Civic","yil":"2021","km":"62.000","yakit":"Benzin","renk":"Gri"}}' "$T" > /dev/null
  post "$API/business/listings" '{"title":"2018 Renault Symbol 1.5 dCi 110.000 km","category":"vasita","subcategory":"otomobil","price":520000,"price_type":"pazarlik","location":"Gebze Oto Pazari","description":"Ekonomik aile arabasi, dizel, bakimli, tramer yok.","attributes":{"marka":"Renault","model":"Symbol","yil":"2018","km":"110.000","yakit":"Dizel"}}' "$T" > /dev/null
  ok "Ozkan Oto Galeri — 5 ilan"
fi

# =============================================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  SEED TAMAMLANDI — 10 isletme + ilanlar   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Giris bilgileri (sifre: $PASS):"
echo "  kuafor@test.com    | restoran@test.com | yemek@test.com"
echo "  kafe@test.com      | market@test.com   | magaza@test.com"
echo "  doktor@test.com    | usta@test.com     | emlakci@test.com | galerici@test.com"
