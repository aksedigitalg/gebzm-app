#!/bin/bash
# =============================================================================
# GebzemSosyal — Mockup Seed Script (FAZ 2)
# 15 sosyal hesap + 80 post + 30+ yorum + 8 DM thread + 6 story + bildirim
#
# Kullanım: ssh root@... "bash /opt/gebzem-web/scripts/seed-social.sh"
# Otomatik: deploy.sh içinden tetiklenir
# =============================================================================

set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'
log()  { echo -e "${CYAN}[SOCIAL-SEED]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# =============================================================================
# 15 USER + SOCIAL_PROFILES + POSTS + COMMENTS + REACTIONS + FOLLOWS + DM + STORIES
# Tüm veriyi SQL ile direkt insert (rate limit bypass)
# =============================================================================

log "GebzemSosyal mockup seed başlıyor..."

sudo -u postgres psql -d gebzem_db << 'SQLEOF'
-- pgcrypto + uuid_generate_v4 garanti
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ───────────────────── ESKİ MOCK VERİYİ TEMİZLE ─────────────────────
-- Test domainli (test1@..test15@) hesapları ve onlara bağlı tüm veriyi sil
DELETE FROM social_story_views WHERE story_id IN (
  SELECT id FROM social_stories WHERE author_id IN (
    SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
  )
);
DELETE FROM social_stories WHERE author_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM social_dm_messages WHERE sender_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM social_dm_conversations WHERE user1_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
) OR user2_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM notifications WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM social_follows WHERE follower_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
) OR followed_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM social_post_hashtags WHERE post_id IN (
  SELECT id FROM social_posts WHERE author_id IN (
    SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
  )
);
DELETE FROM social_reactions WHERE post_id IN (
  SELECT id FROM social_posts WHERE author_id IN (
    SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
  )
);
DELETE FROM social_bookmarks WHERE post_id IN (
  SELECT id FROM social_posts WHERE author_id IN (
    SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
  )
);
DELETE FROM social_posts WHERE author_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM social_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'
);
DELETE FROM users WHERE email LIKE 'social%@gebzem.app';

-- ───────────────────── 15 USER + PROFILES ─────────────────────

WITH inserted_users AS (
  INSERT INTO users (id, name, email, password_hash, auth_type, created_at, phone)
  VALUES
    (gen_random_uuid(), 'Ahmet Yılmaz',    'social01@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '60 days', '+905551110001'),
    (gen_random_uuid(), 'Zeynep Kaya',     'social02@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '55 days', '+905551110002'),
    (gen_random_uuid(), 'Mehmet Demir',    'social03@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '50 days', '+905551110003'),
    (gen_random_uuid(), 'Ayşe Şahin',      'social04@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '45 days', '+905551110004'),
    (gen_random_uuid(), 'Can Öztürk',      'social05@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '40 days', '+905551110005'),
    (gen_random_uuid(), 'Selin Aydın',     'social06@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '38 days', '+905551110006'),
    (gen_random_uuid(), 'Mert Çelik',      'social07@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '35 days', '+905551110007'),
    (gen_random_uuid(), 'Elif Doğan',      'social08@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '30 days', '+905551110008'),
    (gen_random_uuid(), 'Burak Polat',     'social09@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '28 days', '+905551110009'),
    (gen_random_uuid(), 'Pınar Arslan',    'social10@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '25 days', '+905551110010'),
    (gen_random_uuid(), 'Ozan Yıldız',     'social11@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '22 days', '+905551110011'),
    (gen_random_uuid(), 'Sema Erdoğan',    'social12@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '20 days', '+905551110012'),
    (gen_random_uuid(), 'Kerem Aksoy',     'social13@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '18 days', '+905551110013'),
    (gen_random_uuid(), 'Derya Korkmaz',   'social14@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '15 days', '+905551110014'),
    (gen_random_uuid(), 'Furkan Bilgin',   'social15@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '12 days', '+905551110015')
  RETURNING id, email
)
INSERT INTO social_profiles (user_id, username, display_name, bio, avatar_url, is_private, is_verified, created_at)
SELECT
  iu.id,
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'ahmet_yilmaz'
    WHEN 'social02@gebzem.app' THEN 'zeynep_kaya'
    WHEN 'social03@gebzem.app' THEN 'mehmet_dev'
    WHEN 'social04@gebzem.app' THEN 'ayse_moda'
    WHEN 'social05@gebzem.app' THEN 'can_seyahat'
    WHEN 'social06@gebzem.app' THEN 'selin_kitap'
    WHEN 'social07@gebzem.app' THEN 'mert_oyun'
    WHEN 'social08@gebzem.app' THEN 'elif_anne'
    WHEN 'social09@gebzem.app' THEN 'burak_emlak'
    WHEN 'social10@gebzem.app' THEN 'pinar_sanat'
    WHEN 'social11@gebzem.app' THEN 'ozan_muzik'
    WHEN 'social12@gebzem.app' THEN 'sema_fitness'
    WHEN 'social13@gebzem.app' THEN 'kerem_haber'
    WHEN 'social14@gebzem.app' THEN 'derya_kahve'
    WHEN 'social15@gebzem.app' THEN 'furkan_film'
  END,
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'Ahmet Yılmaz'
    WHEN 'social02@gebzem.app' THEN 'Zeynep Kaya'
    WHEN 'social03@gebzem.app' THEN 'Mehmet Demir'
    WHEN 'social04@gebzem.app' THEN 'Ayşe Şahin'
    WHEN 'social05@gebzem.app' THEN 'Can Öztürk'
    WHEN 'social06@gebzem.app' THEN 'Selin Aydın'
    WHEN 'social07@gebzem.app' THEN 'Mert Çelik'
    WHEN 'social08@gebzem.app' THEN 'Elif Doğan'
    WHEN 'social09@gebzem.app' THEN 'Burak Polat'
    WHEN 'social10@gebzem.app' THEN 'Pınar Arslan'
    WHEN 'social11@gebzem.app' THEN 'Ozan Yıldız'
    WHEN 'social12@gebzem.app' THEN 'Sema Erdoğan'
    WHEN 'social13@gebzem.app' THEN 'Kerem Aksoy'
    WHEN 'social14@gebzem.app' THEN 'Derya Korkmaz'
    WHEN 'social15@gebzem.app' THEN 'Furkan Bilgin'
  END,
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN '🏃‍♂️ Spor tutkunu | Gebze koşu klubü | Sabah antrenmanı'
    WHEN 'social02@gebzem.app' THEN '👩‍🍳 Yemek bloggeri | Tarif paylaşımı | Gebze lezzetleri'
    WHEN 'social03@gebzem.app' THEN '💻 Backend developer | Go enthusiast | Open source'
    WHEN 'social04@gebzem.app' THEN '👗 Moda & Stil | Kombinler | İlham veren bakış'
    WHEN 'social05@gebzem.app' THEN '✈️ Gezgin | Gebze tarihi | Fotoğraf tutkunu'
    WHEN 'social06@gebzem.app' THEN '📚 Kitap kurdu | Roman | Öneri ve eleştiri'
    WHEN 'social07@gebzem.app' THEN '🎮 Oyuncu | FPS / RPG | Stream paylaşımları'
    WHEN 'social08@gebzem.app' THEN '👶 Anne hayatı | Tavsiyeler | Gebze çocuk etkinlikleri'
    WHEN 'social09@gebzem.app' THEN '🏠 Emlak danışmanı | Gebze pazarı uzmanı'
    WHEN 'social10@gebzem.app' THEN '🎨 Ressam | Akrilik & yağlı boya | Sergi takibi'
    WHEN 'social11@gebzem.app' THEN '🎸 Müzisyen | Akustik gitar | Cover videolar'
    WHEN 'social12@gebzem.app' THEN '💪 Fitness antrenörü | Beslenme | Form tutma'
    WHEN 'social13@gebzem.app' THEN '📰 Gebze haberleri | Yerel olaylar | Etkinlik duyurusu'
    WHEN 'social14@gebzem.app' THEN '☕ Barista | Latte art | Specialty kahve'
    WHEN 'social15@gebzem.app' THEN '🎬 Film eleştirmeni | Listeler | Yıl sonu özet'
  END,
  -- DiceBear avatar (avataaars stili — deterministik seed bazlı)
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet'
    WHEN 'social02@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep'
    WHEN 'social03@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet'
    WHEN 'social04@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse'
    WHEN 'social05@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=can'
    WHEN 'social06@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=selin'
    WHEN 'social07@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=mert'
    WHEN 'social08@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif'
    WHEN 'social09@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=burak'
    WHEN 'social10@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=pinar'
    WHEN 'social11@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=ozan'
    WHEN 'social12@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=sema'
    WHEN 'social13@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=kerem'
    WHEN 'social14@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=derya'
    WHEN 'social15@gebzem.app' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=furkan'
  END,
  -- iki kişi private (selin, elif)
  CASE iu.email
    WHEN 'social06@gebzem.app' THEN true
    WHEN 'social08@gebzem.app' THEN true
    ELSE false
  END,
  -- doğrulanmış: kerem (haberci)
  CASE iu.email WHEN 'social13@gebzem.app' THEN true ELSE false END,
  NOW()
FROM inserted_users iu;

-- ───────────────────── POSTS ─────────────────────
-- Helper view: username → user_id

CREATE TEMP VIEW v_users AS
SELECT u.id::uuid AS uid, sp.username
FROM users u JOIN social_profiles sp ON sp.user_id = u.id
WHERE u.email LIKE 'social%@gebzem.app';

-- Postlar: her kullanıcı için 4-8 arası post, çeşitli içerikler
-- text, hashtag, mention, media örnekleri içerir

INSERT INTO social_posts (author_id, text, media, parent_id, repost_of_id, created_at)
SELECT v.uid, t.text, COALESCE(t.media, '[]'::jsonb), NULL, NULL,
       NOW() - (random() * INTERVAL '7 days')
FROM v_users v
CROSS JOIN LATERAL (
  VALUES
    -- ahmet_yilmaz: spor
    ('ahmet_yilmaz', 'Sabah 6da Eskihisar parkurunda 8km koştum 💪 Hava muhteşemdi! #gebze #kosu #sabah', '[]'::jsonb),
    ('ahmet_yilmaz', 'Bu hafta ki antrenman planı: Pzt göğüs, Sal sırt, Çar bacak. Birlikte yapmak isteyen var mı? #fitness', '[]'::jsonb),
    ('ahmet_yilmaz', 'Kocaeli yarı maratonu için kayıt açıldı. Beraber hazırlanalım! @sema_fitness ne dersin? #maraton #kocaeli', '[]'::jsonb),
    ('ahmet_yilmaz', 'Bugünkü hedef: 10K altında 5K 🎯', '[]'::jsonb),
    ('ahmet_yilmaz', 'Yeni Asics aldım, ilk koşu denemesi yarın 🔥 Tavsiye eden olur mu?', '[]'::jsonb),

    -- zeynep_kaya: yemek
    ('zeynep_kaya', 'Bugünkü tarifim: Kremalı tavuk sote 🍗 Tarifi yorumlarda paylaşayım? #yemek #tarif #gebzelezzet', '[{"type":"image","url":"https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800"}]'::jsonb),
    ('zeynep_kaya', 'Gebzede yeni keşfettiğim manav var, fiyatlar süper. DM atan yere yollarım 📍 #gebzelezzet', '[]'::jsonb),
    ('zeynep_kaya', 'Hafta sonu menüsü: Cumartesi mantı 🥟 Pazar etli ekmek 🥖. Hanginiz katılır?', '[]'::jsonb),
    ('zeynep_kaya', 'Ev yapımı dondurma — sadece 4 malzeme. Reels yarın yayında! #yemek #tatli', '[{"type":"image","url":"https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800"}]'::jsonb),
    ('zeynep_kaya', 'Kahvaltı sofrası açıldı 🍳🧀🍅 #gebzelezzet #kahvalti', '[{"type":"image","url":"https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800"}]'::jsonb),
    ('zeynep_kaya', 'Soruyu görüyorum: Pide hamuru kaç saat dinlenmeli? Cevap: en az 1 saat oda sıcaklığında. #yemek #ipucu', '[]'::jsonb),
    ('zeynep_kaya', 'Restoran önerileri istemiştiniz, listeyi DM atan herkese yolladım 💌', '[]'::jsonb),
    ('zeynep_kaya', 'Yarın canlı yayın: Tavuk şinitzel tarifi! Saat 20:00 #canliyayin #tarif', '[]'::jsonb),

    -- mehmet_dev: yazılım
    ('mehmet_dev', 'Go 1.24 ile generics constrains daha okunaklı geldi. Type set syntax süper. #yazilim #golang', '[]'::jsonb),
    ('mehmet_dev', 'Yeni proje: Gebze BS arayüz refactor. Komponent kütüphanesini yenilemekteyiz. #yazilim', '[]'::jsonb),
    ('mehmet_dev', 'WebSocket multiplex pattern üzerine bir blog yazısı hazırlıyorum. İlgilenen var mı?', '[]'::jsonb),
    ('mehmet_dev', 'Postgres full-text search Türkçe mi Türk dili extension mu kullanmalı? Tartışalım.', '[]'::jsonb),
    ('mehmet_dev', 'Junior arkadaşlarımıza ücretsiz Go workshop düşünüyorum. Gebzedeki üniversite ile konuşacağım. #egitim', '[]'::jsonb),

    -- ayse_moda: moda
    ('ayse_moda', 'Bugünkü kombin ☀️ Vintage tarz | mom jean + crop. Yorumlar bekliyorum 💕 #moda #stil', '[{"type":"image","url":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"}]'::jsonb),
    ('ayse_moda', 'Sonbahar trendi: Toprak tonları! Kahverengi-haki-bej üçlüsü her şeye yakışıyor.', '[]'::jsonb),
    ('ayse_moda', 'Gebzede outlet alışverişi: TopCu, FLO, LCW karşılaştırma. Hangi mağaza en iyi? Yorumda.', '[]'::jsonb),
    ('ayse_moda', 'Vintage çantamı yeniledim. Önce-sonra fotoğraflarını yarın paylaşıyorum 🎀', '[]'::jsonb),
    ('ayse_moda', 'Kapsül gardırop kavramı son zamanlarda çok dikkatimi çekti. Sade ve şık. Deneyenleri duymak isterim.', '[]'::jsonb),
    ('ayse_moda', 'Kış ayakkabısı bot mu spor mu? Ben her gün spor giyiyorum ama tören için bot şart 👢', '[]'::jsonb),

    -- can_seyahat: gezi
    ('can_seyahat', 'Gebze Çoban Mustafa Paşa Külliyesi gezdim. Tarihimizi bilmek farklı bir his ✨ #gebze #tarih', '[{"type":"image","url":"https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800"}]'::jsonb),
    ('can_seyahat', 'Bayramoğlu sahili sabah 7de. Olağanüstü 🌊 #gebze #sahil', '[{"type":"image","url":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"}]'::jsonb),
    ('can_seyahat', 'Eskihisar feribot turu klasik ama hep güzel. Tavsiyem: Cumartesi sabah, yoğun değil.', '[]'::jsonb),
    ('can_seyahat', 'Bursa-Mudanya ile Eskihisar-Topçular karşılaştırması. Hangisi daha pratik?', '[]'::jsonb),
    ('can_seyahat', 'Yarın Ballıkayalar kanyonu trekking. Birlikte yapmak isteyen DM atsın 🥾', '[]'::jsonb),
    ('can_seyahat', 'Gebze tarihi yapı rotası: 7 yer 1 günde. Yarın detaylı listeyi paylaşacağım.', '[]'::jsonb),
    ('can_seyahat', 'Bağlarbaşı parkı yenilendi mi? Gidenler haber versin, hafta sonu çekim için düşünüyorum 📸', '[]'::jsonb),
    ('can_seyahat', 'Plansız bir Sapanca turu en iyi turdur 🚗💨 #gezi', '[]'::jsonb),

    -- selin_kitap: kitap (private hesap)
    ('selin_kitap', 'Bu ay 3 kitap bitirdim 📚: 1Q84, Suç ve Ceza, Sapiens. Önerilerinizi yorumda bekliyorum.', '[]'::jsonb),
    ('selin_kitap', 'Suç ve Cezada Raskolnikov karakteri için tartışma açıyorum. Vicdan vs ego nerede başlıyor?', '[]'::jsonb),
    ('selin_kitap', 'Gebze kitap kulübü kuruyoruz. İlgilenen DM atsın ✉️ #kitap #gebze', '[]'::jsonb),
    ('selin_kitap', 'En sevdiğiniz Türk yazar kim? Benim seçimim: Sait Faik Abasıyanık.', '[]'::jsonb),

    -- mert_oyun: oyun
    ('mert_oyun', 'Counter-Strike 2 yeni patch geldi, AWP nerf dökümanı çıktı. Ne düşünüyorsunuz? #oyun', '[]'::jsonb),
    ('mert_oyun', 'Akşam stream: Valorant ranked. 21:00de canlı 🎮 #stream', '[]'::jsonb),
    ('mert_oyun', 'Yeni RTX kart aldım, FPS testleri yarın paylaşacağım 🔥', '[]'::jsonb),
    ('mert_oyun', 'Bana göre yılın en iyi oyunu Baldurs Gate 3. Tartışmaya açığım.', '[]'::jsonb),
    ('mert_oyun', 'Gebzede LAN cafe açıyoruz! Detaylar yakında 🎯', '[]'::jsonb),
    ('mert_oyun', 'Eski oyunlardan en sevdiğiniz hangisi? Benim cevabım: GTA San Andreas.', '[]'::jsonb),

    -- elif_anne: anne (private)
    ('elif_anne', 'Gebzede çocuk dostu kafe önerileri için DM bekliyorum. Aileyle gidilecek yer arıyoruz 👶', '[]'::jsonb),
    ('elif_anne', 'Yenidoğan uyku düzeni nasıl olmalı? Tecrübelerinizi yorumlarda paylaşın 🤱', '[]'::jsonb),
    ('elif_anne', 'Anaokulu seçimi yaptık! Detaylı blog yazısı yarın 📝 #anne #gebze', '[]'::jsonb),
    ('elif_anne', 'Bu hafta ev yapımı bebek maması tarifim — 10 dk hazır 🍎', '[]'::jsonb),
    ('elif_anne', 'Pediatrist önerisi olan var mı? @burak_emlak senin çevren geniş, biliyor musun?', '[]'::jsonb),

    -- burak_emlak: emlak
    ('burak_emlak', 'Bu hafta öne çıkan: Gebze merkez 3+1, deniz manzaralı, 145m2. Detay DM. #emlak #gebze', '[]'::jsonb),
    ('burak_emlak', 'Kira piyasası analizi: 2024-2026 arası %120 artış. Yatırımcılar için fırsat var mı?', '[]'::jsonb),
    ('burak_emlak', 'Konut kredisi faiz indirimi geldi. Ev sahibi olmak için doğru zaman olabilir mi?', '[]'::jsonb),
    ('burak_emlak', 'Gebze yeni metro projesi gayrimenkul fiyatlarını nasıl etkileyecek? Tartışalım. #emlak', '[]'::jsonb),

    -- pinar_sanat: sanat
    ('pinar_sanat', 'Bu haftaki çalışmam: Gebze sahili, akrilik 50x70 🎨 #sanat #resim', '[{"type":"image","url":"https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800"}]'::jsonb),
    ('pinar_sanat', 'Atölyemde kontörlü yağlı boya dersleri başlıyor. Hafta içi akşamları. DM ✏️', '[]'::jsonb),
    ('pinar_sanat', 'Resim yapmaya başlarken en zoru ne? Beyaz tuval. Bunun çözümü: HEMEN BAŞLA.', '[]'::jsonb),
    ('pinar_sanat', 'Sergi açılışı: 15 Mayıs, Gebze Kültür Merkezi. Tüm Gebzem ailesi davetli 🖼️ #sergi', '[]'::jsonb),
    ('pinar_sanat', 'Sulu boya tekniği için 3 ipucu yarın yayında. Beni takip etmeyi unutmayın 💧', '[]'::jsonb),
    ('pinar_sanat', 'Gebze sanatçıları olarak bir kolektif kuralım. Katılmak isteyen yorumlasın.', '[]'::jsonb),
    ('pinar_sanat', 'Atölye günlük: 6 saatte bitirdim! Kahve molası bile vermedim ☕❌', '[]'::jsonb),

    -- ozan_muzik: müzik
    ('ozan_muzik', 'Yeni cover yarın yayında: Tarkan - Beni Çok Sev. Akustik gitar ile 🎸 #muzik', '[]'::jsonb),
    ('ozan_muzik', 'Gitar çalmaya başlamak isteyenler için ipuçları thread hazırlıyorum 🎼', '[]'::jsonb),
    ('ozan_muzik', 'Gebzede sokak müziği yapmak yasal mı? Belediyeden bilen var mı?', '[]'::jsonb),
    ('ozan_muzik', 'Hafta sonu Bayramoğlu sahilde mini konser. Detaylar pinned post 📌', '[]'::jsonb),
    ('ozan_muzik', 'Favori Türkçe şarkı sözü? Benimki: "Gül dudaklı, kara kaşlı" - Ahmet Kaya 💔', '[]'::jsonb),

    -- sema_fitness: fitness
    ('sema_fitness', 'HIIT 20 dk antrenman = 1 saat kardio. Kanıtlanmış bilim. Yarın tutorial yayında 💪 #fitness', '[]'::jsonb),
    ('sema_fitness', 'Beslenme tablosu: Kahvaltı yumurta + yulaf, öğle tavuk + sebze, akşam balık + salata.', '[]'::jsonb),
    ('sema_fitness', 'Kıştan formda çıkmanın yolu — bu üç egzersiz: squat, push-up, plank. Her gün 10 dk.', '[]'::jsonb),
    ('sema_fitness', 'Kadın antrenmanı erkekten farklı mı? Bilim ne diyor — yarın detaylı paylaşacağım.', '[]'::jsonb),
    ('sema_fitness', 'Gebze fitness centerlarından hangisini öneriyorsunuz? @ahmet_yilmaz görüşün?', '[]'::jsonb),
    ('sema_fitness', 'Kreatin alıyor musunuz? 5 yıllık deneyimim ile detaylı yorum yarın yayında.', '[]'::jsonb),
    ('sema_fitness', 'Pilates mi yoga mı? Bence ikisi farklı disiplin, birini seçmek yerine birleştirmek doğru.', '[]'::jsonb),

    -- kerem_haber: haber (verified)
    ('kerem_haber', 'GEBZEDEKİ TRAFIK ÇİLESİ: D-100 sabah 8-9 arası kilitlendi. Alternatif rota? @kerem_haber takip edin 📰', '[]'::jsonb),
    ('kerem_haber', 'Gebze Belediye Başkanı bugün açıklama yapacak. Detaylar 14:00de.', '[]'::jsonb),
    ('kerem_haber', 'YEREL HABER: Yeni park açılıyor — Bağlarbaşı bölgesi. Aile dostu, ücretsiz giriş.', '[]'::jsonb),
    ('kerem_haber', 'Gebze hava durumu uyarısı: Yarın sağanak yağmur bekleniyor 🌧️ Şemsiyenizi unutmayın.', '[]'::jsonb),
    ('kerem_haber', 'Gebze Etkinlik Takvimi (Mayıs): 12-15 Çocuk Şenliği, 20 Hıdırellez, 28 Bahar Konseri 🎉', '[]'::jsonb),
    ('kerem_haber', 'BREAKING: Gebze Kentpark açılış tarihi belli oldu. Tüm aile için ücretsiz aktiviteler. #gebze', '[]'::jsonb),

    -- derya_kahve: kahve
    ('derya_kahve', 'Bugünkü latte art ☕ İlk kez kalp + tulip kombo başardım! #kahve #latteart', '[{"type":"image","url":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"}]'::jsonb),
    ('derya_kahve', 'Specialty kahve nedir? 80+ puan. Kavurma tarihi 1 ayı geçmemeli. Tek menşeli olmalı.', '[]'::jsonb),
    ('derya_kahve', 'V60 vs Kalita Wave demleme — hangi yöntem daha temiz cup veriyor? Test sonuçları yarın.', '[]'::jsonb),
    ('derya_kahve', 'Mavi Kafede yarın specialty kahve workshop var. Kayıt için DM 💌 #gebze', '[]'::jsonb),

    -- furkan_film: film
    ('furkan_film', 'Bu hafta izlediklerim: Oppenheimer (10/10), Past Lives (8/10), Killers of the Flower Moon (9/10) 🎬', '[]'::jsonb),
    ('furkan_film', 'Klasikler arasında bir tane: Yedi Samuray. Bu filmi izlemeyenin sineması eksik 🎌', '[]'::jsonb),
    ('furkan_film', 'En sevdiğiniz Türk filmi? Bende ilk üç: Eşkıya, Hababam Sınıfı, Ayla. Yorumlarda paylaşın 🇹🇷', '[]'::jsonb),
    ('furkan_film', 'Netflixin yeni dizisi 3 Body Problem 4. bölüme kadar idare ederdi, 5. bölümden sonra patladı 🚀', '[]'::jsonb),
    ('furkan_film', 'Sineması olan kasaba olmak isterdim. Gebzede yeni bir art-house sinema açılsa diyorum 🎥', '[]'::jsonb)
) AS t(uname, text, media)
WHERE v.username = t.uname;

-- ───────────────────── COMMENTS (parent_id ile) ─────────────────────
-- Bazı popüler postlara yorum
WITH ahmet_post AS (
  SELECT id FROM social_posts WHERE author_id = (SELECT uid FROM v_users WHERE username='ahmet_yilmaz') LIMIT 1
),
zeynep_post AS (
  SELECT id FROM social_posts WHERE author_id = (SELECT uid FROM v_users WHERE username='zeynep_kaya')
    AND text LIKE 'Bugünkü tarifim%' LIMIT 1
),
kerem_post AS (
  SELECT id FROM social_posts WHERE author_id = (SELECT uid FROM v_users WHERE username='kerem_haber')
    AND text LIKE 'BREAKING%' LIMIT 1
)
INSERT INTO social_posts (author_id, text, media, parent_id, created_at)
SELECT v.uid, t.text, '[]'::jsonb, t.parent_id, NOW() - (random() * INTERVAL '5 days')
FROM (
  VALUES
    ('sema_fitness',  'Helal! Hangi rotayı kullandın?', (SELECT id FROM ahmet_post)),
    ('mert_oyun',     'Sabah 6da uyanmak baba 😅 Tebrikler', (SELECT id FROM ahmet_post)),
    ('zeynep_kaya',   'Koşu sonrası kahvaltıya bekleriz! 🍳', (SELECT id FROM ahmet_post)),
    ('elif_anne',     'Tarifi paylaşır mısın lütfen? 🙏', (SELECT id FROM zeynep_post)),
    ('ayse_moda',     'Görsel müthiş. Tabağın da güzel ✨', (SELECT id FROM zeynep_post)),
    ('derya_kahve',   'Yanına bir Latte gider 😍☕', (SELECT id FROM zeynep_post)),
    ('can_seyahat',   'Bu güzel haber! Açılış için orada olacağım 📸', (SELECT id FROM kerem_post)),
    ('pinar_sanat',   'Park için sergi düşünüyorum, beraber yapalım 🎨', (SELECT id FROM kerem_post)),
    ('ozan_muzik',    'Açılışta canlı müzik için müsaitim 🎸', (SELECT id FROM kerem_post)),
    ('furkan_film',   'Açılışta open-air sinema yapılsa harika olur 🎬', (SELECT id FROM kerem_post))
) AS t(uname, text, parent_id)
JOIN v_users v ON v.username = t.uname
WHERE t.parent_id IS NOT NULL;

-- Update comment counts
UPDATE social_posts p SET comments_count = (
  SELECT COUNT(*) FROM social_posts c WHERE c.parent_id = p.id
);

-- ───────────────────── REACTIONS ─────────────────────
-- Her kullanıcı 5-15 random posta like atar (ama kendi postuna değil)
INSERT INTO social_reactions (user_id, post_id, reaction)
SELECT u.uid, p.id, 'like'
FROM v_users u
CROSS JOIN LATERAL (
  SELECT id FROM social_posts
  WHERE author_id != u.uid AND parent_id IS NULL AND is_deleted = false
  ORDER BY random() LIMIT 8
) p
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Likes count refresh
UPDATE social_posts p SET likes_count = (
  SELECT COUNT(*) FROM social_reactions r WHERE r.post_id = p.id AND r.reaction='like'
);
UPDATE social_posts p SET dislikes_count = (
  SELECT COUNT(*) FROM social_reactions r WHERE r.post_id = p.id AND r.reaction='dislike'
);

-- ───────────────────── FOLLOWS ─────────────────────
-- Her kullanıcı 4-8 random kişiyi takip eder
INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT a.uid, b.uid, 'accepted', NOW() - (random() * INTERVAL '30 days')
FROM v_users a
CROSS JOIN LATERAL (
  SELECT uid FROM v_users WHERE uid != a.uid ORDER BY random() LIMIT 6
) b
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- Private hesaplara (selin, elif) bazı pending istek
INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT
  (SELECT uid FROM v_users WHERE username='ahmet_yilmaz'),
  (SELECT uid FROM v_users WHERE username='selin_kitap'),
  'pending', NOW() - INTERVAL '2 days'
ON CONFLICT (follower_id, followed_id) DO NOTHING;

INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT
  (SELECT uid FROM v_users WHERE username='furkan_film'),
  (SELECT uid FROM v_users WHERE username='elif_anne'),
  'pending', NOW() - INTERVAL '1 day'
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- Counter refresh
UPDATE social_profiles sp SET
  followers_count = (SELECT COUNT(*) FROM social_follows f WHERE f.followed_id = sp.user_id AND f.status='accepted'),
  following_count = (SELECT COUNT(*) FROM social_follows f WHERE f.follower_id = sp.user_id AND f.status='accepted'),
  posts_count     = (SELECT COUNT(*) FROM social_posts p WHERE p.author_id = sp.user_id AND p.is_deleted = false AND p.parent_id IS NULL);

-- ───────────────────── HASHTAGS ─────────────────────
-- Hashtag'leri post içeriklerinden çıkar (basit regex)
INSERT INTO social_hashtags (tag, posts_count, last_used_at)
SELECT lower(matches.tag), COUNT(*), MAX(p.created_at)
FROM social_posts p
CROSS JOIN LATERAL (
  SELECT regexp_matches(p.text, '#([a-zA-Z0-9_]{1,50})', 'g') AS m
) re
CROSS JOIN LATERAL (SELECT re.m[1] AS tag) matches
WHERE p.text IS NOT NULL AND p.is_deleted = false
GROUP BY lower(matches.tag)
ON CONFLICT (tag) DO UPDATE SET
  posts_count = EXCLUDED.posts_count,
  last_used_at = EXCLUDED.last_used_at;

-- Post-hashtag junction
INSERT INTO social_post_hashtags (post_id, hashtag_id)
SELECT p.id, h.id
FROM social_posts p
JOIN LATERAL (
  SELECT lower(re.m[1]) AS tag
  FROM regexp_matches(p.text, '#([a-zA-Z0-9_]{1,50})', 'g') AS re(m)
) tags ON true
JOIN social_hashtags h ON h.tag = tags.tag
WHERE p.text IS NOT NULL AND p.is_deleted = false
ON CONFLICT DO NOTHING;

-- ───────────────────── DM CONVERSATIONS + MESSAGES ─────────────────────
-- 8 DM thread, her biri 4-12 mesaj. canonical pair: u1 < u2

DO $$
DECLARE
  ahmet uuid := (SELECT uid FROM v_users WHERE username='ahmet_yilmaz');
  zeynep uuid := (SELECT uid FROM v_users WHERE username='zeynep_kaya');
  mehmet uuid := (SELECT uid FROM v_users WHERE username='mehmet_dev');
  ayse uuid := (SELECT uid FROM v_users WHERE username='ayse_moda');
  can_u uuid := (SELECT uid FROM v_users WHERE username='can_seyahat');
  selin uuid := (SELECT uid FROM v_users WHERE username='selin_kitap');
  mert uuid := (SELECT uid FROM v_users WHERE username='mert_oyun');
  pinar uuid := (SELECT uid FROM v_users WHERE username='pinar_sanat');
  ozan uuid := (SELECT uid FROM v_users WHERE username='ozan_muzik');
  sema uuid := (SELECT uid FROM v_users WHERE username='sema_fitness');
  derya uuid := (SELECT uid FROM v_users WHERE username='derya_kahve');
  furkan uuid := (SELECT uid FROM v_users WHERE username='furkan_film');
  cid uuid;
  u1 uuid; u2 uuid;
BEGIN
  -- Helper macro: dm_create(a,b)
  -- Thread 1: ahmet - zeynep (koşu sonrası kahvaltı)
  IF ahmet < zeynep THEN u1:=ahmet; u2:=zeynep; ELSE u1:=zeynep; u2:=ahmet; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Tamam yarın 9da bekliyorum 🍳', NOW() - INTERVAL '2 hours', zeynep, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, ahmet,  'Selam! Bahsettiğin tarifi gönderir misin?', true, NOW() - INTERVAL '5 hours'),
    (cid, zeynep, 'Tabii canım, hangi tarif?', true, NOW() - INTERVAL '4 hours 50 minutes'),
    (cid, ahmet,  'Kremalı tavuk sote', true, NOW() - INTERVAL '4 hours 45 minutes'),
    (cid, zeynep, 'Hemen yolluyorum 📝', true, NOW() - INTERVAL '4 hours 30 minutes'),
    (cid, zeynep, 'Yarın koşu sonrası kahvaltıya gel, beraber pişiririz', true, NOW() - INTERVAL '3 hours'),
    (cid, ahmet,  'Süper olur, saat kaçta?', true, NOW() - INTERVAL '2 hours 30 minutes'),
    (cid, zeynep, 'Tamam yarın 9da bekliyorum 🍳', true, NOW() - INTERVAL '2 hours');

  -- Thread 2: mehmet - mert (oyun + yazılım)
  IF mehmet < mert THEN u1:=mehmet; u2:=mert; ELSE u1:=mert; u2:=mehmet; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Pazartesi 20:00 Discord ekran paylaşımıyla', NOW() - INTERVAL '1 day', mehmet, 0, 1)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, mert,   'Hocam yeni kart aldım, sürücü problemi yaşadım', true, NOW() - INTERVAL '2 days'),
    (cid, mehmet, 'Hangi marka? Driver clean install gerekebilir', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (cid, mert,   'Nvidia 4070 Ti', true, NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
    (cid, mehmet, 'DDU ile temizle, sonra fresh kur', true, NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
    (cid, mert,   'Anlaşıldı, akşam denerim. Help eder misin?', true, NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),
    (cid, mehmet, 'Pazartesi 20:00 Discord ekran paylaşımıyla', false, NOW() - INTERVAL '1 day');

  -- Thread 3: ayse - pinar (sanat + moda)
  IF ayse < pinar THEN u1:=ayse; u2:=pinar; ELSE u1:=pinar; u2:=ayse; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Sergi açılışı için kombin tavsiyesi alabilir miyim 🎀', NOW() - INTERVAL '6 hours', ayse, 1, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, pinar, 'Ayşe canım, sergime davetlisin 💕', true, NOW() - INTERVAL '1 day'),
    (cid, ayse,  'Vay! Çok mutlu oldum, kesin gelirim 🥰', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    (cid, pinar, 'Açılış özel — şık bir kombin yap 😉', true, NOW() - INTERVAL '20 hours'),
    (cid, ayse,  'Sergi açılışı için kombin tavsiyesi alabilir miyim 🎀', false, NOW() - INTERVAL '6 hours');

  -- Thread 4: can - kerem (gezi haberi)
  IF can_u < (SELECT uid FROM v_users WHERE username='kerem_haber') THEN
    u1:=can_u; u2:=(SELECT uid FROM v_users WHERE username='kerem_haber');
  ELSE
    u1:=(SELECT uid FROM v_users WHERE username='kerem_haber'); u2:=can_u;
  END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Tamam haberi yarın yayınlıyoruz 📰', NOW() - INTERVAL '8 hours', (SELECT uid FROM v_users WHERE username='kerem_haber'), 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, can_u, 'Selam Kerem, Ballıkayalar yürüyüşü için detaylı yazı hazırladım', true, NOW() - INTERVAL '12 hours'),
    (cid, (SELECT uid FROM v_users WHERE username='kerem_haber'), 'Süper, fotoğraflarla beraber gönderebilir misin?', true, NOW() - INTERVAL '11 hours'),
    (cid, can_u, 'Hemen yolluyorum 📸', true, NOW() - INTERVAL '10 hours'),
    (cid, (SELECT uid FROM v_users WHERE username='kerem_haber'), 'Tamam haberi yarın yayınlıyoruz 📰', true, NOW() - INTERVAL '8 hours');

  -- Thread 5: ozan - sema (konser organize)
  IF ozan < sema THEN u1:=ozan; u2:=sema; ELSE u1:=sema; u2:=ozan; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Açık hava bence harika fikir 🎸', NOW() - INTERVAL '3 hours', sema, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, ozan, 'Sema, Bayramoğlu konserine eşlik etmek ister misin? 🎶', true, NOW() - INTERVAL '6 hours'),
    (cid, sema, 'Vay, ne hoş bir öneri! Saxophone mu, ne çalıyorum?', true, NOW() - INTERVAL '5 hours'),
    (cid, ozan, 'Akustik gitar - vokal istiyorum, sen yan vokal? 🎤', true, NOW() - INTERVAL '4 hours'),
    (cid, sema, 'Açık hava bence harika fikir 🎸', true, NOW() - INTERVAL '3 hours');

  -- Thread 6: derya - zeynep (kahve + tatlı kombinasyon)
  IF derya < zeynep THEN u1:=derya; u2:=zeynep; ELSE u1:=zeynep; u2:=derya; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Cumartesi 14:00 Mavi Kafede 💕', NOW() - INTERVAL '4 hours', derya, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, zeynep, 'Senin yaptığın latteleri çok övüyorlar! Bir gün bizden ne dersin?', true, NOW() - INTERVAL '8 hours'),
    (cid, derya,  'Davet ettiğin için sevindim 🥰 Kahve + dondurmanı denemek isterim', true, NOW() - INTERVAL '7 hours'),
    (cid, zeynep, 'O zaman cumartesi nasıl?', true, NOW() - INTERVAL '5 hours'),
    (cid, derya,  'Cumartesi 14:00 Mavi Kafede 💕', true, NOW() - INTERVAL '4 hours');

  -- Thread 7: furkan - selin (film + kitap)
  IF furkan < selin THEN u1:=furkan; u2:=selin; ELSE u1:=selin; u2:=furkan; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Anlaştık o zaman, paylaşımlı blog yazalım', NOW() - INTERVAL '15 minutes', furkan, 1, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, selin, 'Furkan, kitap-film karşılaştırması yapalım mı? Suç ve Ceza dizisi var', true, NOW() - INTERVAL '2 hours'),
    (cid, furkan, 'Süper fikir! Film vs kitap analizi her zaman ilginç', true, NOW() - INTERVAL '1 hour 30 minutes'),
    (cid, selin, 'Birlikte yazsak nasıl olur? Sen film, ben kitap yorumu', true, NOW() - INTERVAL '45 minutes'),
    (cid, furkan, 'Anlaştık o zaman, paylaşımlı blog yazalım', false, NOW() - INTERVAL '15 minutes');

  -- Thread 8: burak - elif (ev + okul)
  IF (SELECT uid FROM v_users WHERE username='burak_emlak') < (SELECT uid FROM v_users WHERE username='elif_anne') THEN
    u1:=(SELECT uid FROM v_users WHERE username='burak_emlak'); u2:=(SELECT uid FROM v_users WHERE username='elif_anne');
  ELSE
    u1:=(SELECT uid FROM v_users WHERE username='elif_anne'); u2:=(SELECT uid FROM v_users WHERE username='burak_emlak');
  END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, '3+1 deniz manzaralı, anaokulu yakın bir liste yolladım', NOW() - INTERVAL '1 hour', (SELECT uid FROM v_users WHERE username='burak_emlak'), 1, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, (SELECT uid FROM v_users WHERE username='elif_anne'), 'Burak, Gebzede aile dostu site arıyoruz', true, NOW() - INTERVAL '1 day'),
    (cid, (SELECT uid FROM v_users WHERE username='burak_emlak'), 'Bütçe ne, kaç+kaç?', true, NOW() - INTERVAL '23 hours'),
    (cid, (SELECT uid FROM v_users WHERE username='elif_anne'), '3+1, manzaralı, anaokulu yakın olsun', true, NOW() - INTERVAL '20 hours'),
    (cid, (SELECT uid FROM v_users WHERE username='burak_emlak'), '3+1 deniz manzaralı, anaokulu yakın bir liste yolladım', false, NOW() - INTERVAL '1 hour');
END $$;

-- ───────────────────── STORIES ─────────────────────
-- 6 aktif story (3 image + 3 video)
INSERT INTO social_stories (author_id, media_url, media_type, thumbnail_url, caption, duration_sec, created_at, expires_at)
SELECT v.uid, t.media_url, t.media_type, t.thumbnail, t.caption, t.duration, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours'
FROM (
  VALUES
    ('zeynep_kaya',  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200', 'image', NULL, 'Akşam yemeği 🍝', 5),
    ('ahmet_yilmaz', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', 'image', NULL, 'Sabah koşusu 🏃‍♂️', 5),
    ('pinar_sanat',  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200', 'image', NULL, 'Yeni eserim 🎨', 5),
    ('derya_kahve',  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 'image', NULL, 'Latte art ☕', 5),
    ('can_seyahat',  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', 'image', NULL, 'Eskihisar sahili 🌊', 5),
    ('kerem_haber',  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200', 'image', NULL, 'Gebze haberleri 📰', 5)
) AS t(uname, media_url, media_type, thumbnail, caption, duration)
JOIN v_users v ON v.username = t.uname;

-- ───────────────────── SOSYAL BİLDİRİMLER (mock) ─────────────────────
-- ahmet_yilmaz alıcı; bazı sahte bildirimleri ekle (görselin nasıl çalıştığını görmek için)
INSERT INTO notifications (user_id, business_id, admin, type, title, body, is_read, actors, count, aggregation_key, target_url, created_at, updated_at)
SELECT
  ahmet.uid, NULL, false, t.type, t.title, t.body, false,
  jsonb_build_array(jsonb_build_object(
    'user_id', actor.uid::text,
    'username', actor.username,
    'display_name', sp.display_name,
    'avatar_url', sp.avatar_url
  )),
  1, t.type || ':' || t.target, t.target_url,
  NOW() - t.age, NOW() - t.age
FROM (SELECT uid, username FROM v_users WHERE username='ahmet_yilmaz') ahmet
CROSS JOIN LATERAL (
  VALUES
    ('zeynep_kaya', 'social_like',     'Zeynep Kaya gönderini beğendi',          NULL,                                    'feed-1', '/sosyal/post/feed-1', INTERVAL '5 minutes'),
    ('mehmet_dev',  'social_comment',  'Mehmet Demir gönderine yorum yaptı',     'Helal sana usta, ne kadar kaçtın?',     'feed-1', '/sosyal/post/feed-1', INTERVAL '12 minutes'),
    ('sema_fitness','social_follow',   'Sema Erdoğan seni takip etti',           NULL,                                    'follow-sema', '/sosyal/sema_fitness', INTERVAL '1 hour'),
    ('mert_oyun',   'social_repost',   'Mert Çelik gönderini paylaştı',          NULL,                                    'feed-2', '/sosyal/post/feed-2', INTERVAL '2 hours'),
    ('kerem_haber', 'social_mention',  'Kerem Aksoy seni bir gönderide etiketledi', '@ahmet_yilmaz Gebze maraton kayıtları açıldı!', 'mention-1', '/sosyal/post/mention-1', INTERVAL '4 hours'),
    ('can_seyahat', 'social_follow',   'Can Öztürk seni takip etti',             NULL,                                    'follow-can', '/sosyal/can_seyahat', INTERVAL '8 hours')
) AS t(actor_un, type, title, body, target, target_url, age)
JOIN v_users actor ON actor.username = t.actor_un
JOIN social_profiles sp ON sp.user_id = actor.uid;

-- ───────────────────── SONUÇ ─────────────────────
SELECT 'social_profiles' AS tbl, COUNT(*) FROM social_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_posts',         COUNT(*) FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_reactions',     COUNT(*) FROM social_reactions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_follows',       COUNT(*) FROM social_follows WHERE follower_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_dm_conversations', COUNT(*) FROM social_dm_conversations
UNION ALL SELECT 'social_dm_messages',   COUNT(*) FROM social_dm_messages
UNION ALL SELECT 'social_stories',       COUNT(*) FROM social_stories
UNION ALL SELECT 'notifications (social)', COUNT(*) FROM notifications WHERE type LIKE 'social_%';

DROP VIEW IF EXISTS v_users;

SQLEOF

ok "GebzemSosyal seed tamamlandı"
log "Test hesapları: social01@gebzem.app ... social15@gebzem.app (şifre: 80148014)"
log "Username'ler: ahmet_yilmaz, zeynep_kaya, mehmet_dev, ayse_moda, can_seyahat, selin_kitap (private), mert_oyun, elif_anne (private), burak_emlak, pinar_sanat, ozan_muzik, sema_fitness, kerem_haber (verified), derya_kahve, furkan_film"
