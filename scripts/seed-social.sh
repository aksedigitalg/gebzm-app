#!/bin/bash
# =============================================================================
# GebzemSosyal — Mockup Seed Script (FAZ 3 — zenginleştirilmiş)
# 20 sosyal hesap | kapak+avatar | 100+ post (çoğunda 2-4 foto) | 30+ yorum
# 8 DM thread | 8 aktif story | yoğun beğeni | bildirim
# =============================================================================

set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[SOCIAL-SEED]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }

log "GebzemSosyal mockup seed başlıyor (20 hesap)..."

sudo -u postgres psql -d gebzem_db << 'SQLEOF'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ───────────────────── ESKİ MOCK VERİYİ TEMİZLE ─────────────────────
DELETE FROM social_story_views WHERE story_id IN (SELECT id FROM social_stories WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'));
DELETE FROM social_stories WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM social_dm_messages WHERE sender_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM social_dm_conversations WHERE user1_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app') OR user2_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM social_follows WHERE follower_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app') OR followed_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM social_post_hashtags WHERE post_id IN (SELECT id FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'));
DELETE FROM social_reactions WHERE post_id IN (SELECT id FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'));
DELETE FROM social_bookmarks WHERE post_id IN (SELECT id FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app'));
DELETE FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM social_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app');
DELETE FROM users WHERE email LIKE 'social%@gebzem.app';

-- ───────────────────── 20 USER + PROFİL ─────────────────────
-- Avatarlar: pravatar.cc (gerçek yüzler, deterministik img=N parametresiyle)
-- Coverlar: Unsplash 1200x400 landscape

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
    (gen_random_uuid(), 'Furkan Bilgin',   'social15@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '12 days', '+905551110015'),
    (gen_random_uuid(), 'Tuğçe Yağmur',    'social16@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '10 days', '+905551110016'),
    (gen_random_uuid(), 'Ömer Acar',       'social17@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '9 days',  '+905551110017'),
    (gen_random_uuid(), 'Gülşah Tan',      'social18@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '7 days',  '+905551110018'),
    (gen_random_uuid(), 'Hakan Şen',       'social19@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '5 days',  '+905551110019'),
    (gen_random_uuid(), 'Beste Aksu',      'social20@gebzem.app', crypt('80148014', gen_salt('bf', 10)), 'email', NOW() - INTERVAL '3 days',  '+905551110020')
  RETURNING id, email
)
INSERT INTO social_profiles (user_id, username, display_name, bio, avatar_url, cover_url, is_private, is_verified, created_at)
SELECT iu.id,
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
    WHEN 'social16@gebzem.app' THEN 'tugce_gezgin'
    WHEN 'social17@gebzem.app' THEN 'omer_chef'
    WHEN 'social18@gebzem.app' THEN 'gulsah_yoga'
    WHEN 'social19@gebzem.app' THEN 'hakan_oto'
    WHEN 'social20@gebzem.app' THEN 'beste_dans'
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
    WHEN 'social16@gebzem.app' THEN 'Tuğçe Yağmur'
    WHEN 'social17@gebzem.app' THEN 'Ömer Acar'
    WHEN 'social18@gebzem.app' THEN 'Gülşah Tan'
    WHEN 'social19@gebzem.app' THEN 'Hakan Şen'
    WHEN 'social20@gebzem.app' THEN 'Beste Aksu'
  END,
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'Spor tutkunu | Gebze koşu klubü | Sabah 6da Eskihisar parkurunda'
    WHEN 'social02@gebzem.app' THEN 'Yemek bloggeri | Tarif paylaşımı | Gebze lezzetleri | Cmt yayın'
    WHEN 'social03@gebzem.app' THEN 'Backend developer | Go enthusiast | Open source | Gebze tech meetup'
    WHEN 'social04@gebzem.app' THEN 'Moda & Stil | Kombinler | İlham veren bakış | Vintage tutkusu'
    WHEN 'social05@gebzem.app' THEN 'Gezgin | Gebze tarihi | Fotoğraf tutkunu | Sahil rotaları'
    WHEN 'social06@gebzem.app' THEN 'Kitap kurdu | Roman | Öneri ve eleştiri | Özel hesap'
    WHEN 'social07@gebzem.app' THEN 'Oyuncu | FPS / RPG | Stream paylaşımları | Gebze esports'
    WHEN 'social08@gebzem.app' THEN 'Anne hayatı | Tavsiyeler | Gebze çocuk etkinlikleri | Özel hesap'
    WHEN 'social09@gebzem.app' THEN 'Emlak danışmanı | Gebze pazarı uzmanı | Yatırım rehberi'
    WHEN 'social10@gebzem.app' THEN 'Ressam | Akrilik & yağlı boya | Atölye | Sergi takibi'
    WHEN 'social11@gebzem.app' THEN 'Müzisyen | Akustik gitar | Cover videolar | Sokak konserleri'
    WHEN 'social12@gebzem.app' THEN 'Fitness antrenörü | Beslenme | Kadın antrenmanları | Form tutma'
    WHEN 'social13@gebzem.app' THEN 'Gebze yerel haberleri | Etkinlik duyurusu | Resmi muhabir'
    WHEN 'social14@gebzem.app' THEN 'Barista | Latte art | Specialty kahve | Workshop'
    WHEN 'social15@gebzem.app' THEN 'Film eleştirmeni | Listeler | Yıl sonu özet | Festival takibi'
    WHEN 'social16@gebzem.app' THEN 'Solo backpacker | 32 ülke | Türkiye-Avrupa rotaları | Gebze backpack'
    WHEN 'social17@gebzem.app' THEN 'Şef | Akdeniz mutfağı | Catering | Restoran danışmanlığı'
    WHEN 'social18@gebzem.app' THEN 'Yoga eğitmeni | Vinyasa & Hatha | Meditasyon | Sabah seansları'
    WHEN 'social19@gebzem.app' THEN 'Otomobil tutkunu | Klasik araçlar | Test sürüşleri | Galerici'
    WHEN 'social20@gebzem.app' THEN 'Modern dans eğitmeni | Performans | Workshop | Gebze sahne'
  END,
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'https://i.pravatar.cc/400?img=12'
    WHEN 'social02@gebzem.app' THEN 'https://i.pravatar.cc/400?img=49'
    WHEN 'social03@gebzem.app' THEN 'https://i.pravatar.cc/400?img=33'
    WHEN 'social04@gebzem.app' THEN 'https://i.pravatar.cc/400?img=44'
    WHEN 'social05@gebzem.app' THEN 'https://i.pravatar.cc/400?img=15'
    WHEN 'social06@gebzem.app' THEN 'https://i.pravatar.cc/400?img=47'
    WHEN 'social07@gebzem.app' THEN 'https://i.pravatar.cc/400?img=8'
    WHEN 'social08@gebzem.app' THEN 'https://i.pravatar.cc/400?img=45'
    WHEN 'social09@gebzem.app' THEN 'https://i.pravatar.cc/400?img=11'
    WHEN 'social10@gebzem.app' THEN 'https://i.pravatar.cc/400?img=20'
    WHEN 'social11@gebzem.app' THEN 'https://i.pravatar.cc/400?img=14'
    WHEN 'social12@gebzem.app' THEN 'https://i.pravatar.cc/400?img=23'
    WHEN 'social13@gebzem.app' THEN 'https://i.pravatar.cc/400?img=51'
    WHEN 'social14@gebzem.app' THEN 'https://i.pravatar.cc/400?img=29'
    WHEN 'social15@gebzem.app' THEN 'https://i.pravatar.cc/400?img=52'
    WHEN 'social16@gebzem.app' THEN 'https://i.pravatar.cc/400?img=25'
    WHEN 'social17@gebzem.app' THEN 'https://i.pravatar.cc/400?img=60'
    WHEN 'social18@gebzem.app' THEN 'https://i.pravatar.cc/400?img=26'
    WHEN 'social19@gebzem.app' THEN 'https://i.pravatar.cc/400?img=68'
    WHEN 'social20@gebzem.app' THEN 'https://i.pravatar.cc/400?img=32'
  END,
  -- Cover (Unsplash 1500x500 landscape, içeriğe uygun tema)
  CASE iu.email
    WHEN 'social01@gebzem.app' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1500&h=500&fit=crop'
    WHEN 'social02@gebzem.app' THEN 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1500&h=500&fit=crop'
    WHEN 'social03@gebzem.app' THEN 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1500&h=500&fit=crop'
    WHEN 'social04@gebzem.app' THEN 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1500&h=500&fit=crop'
    WHEN 'social05@gebzem.app' THEN 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1500&h=500&fit=crop'
    WHEN 'social06@gebzem.app' THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1500&h=500&fit=crop'
    WHEN 'social07@gebzem.app' THEN 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1500&h=500&fit=crop'
    WHEN 'social08@gebzem.app' THEN 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1500&h=500&fit=crop'
    WHEN 'social09@gebzem.app' THEN 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1500&h=500&fit=crop'
    WHEN 'social10@gebzem.app' THEN 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1500&h=500&fit=crop'
    WHEN 'social11@gebzem.app' THEN 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1500&h=500&fit=crop'
    WHEN 'social12@gebzem.app' THEN 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1500&h=500&fit=crop'
    WHEN 'social13@gebzem.app' THEN 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1500&h=500&fit=crop'
    WHEN 'social14@gebzem.app' THEN 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1500&h=500&fit=crop'
    WHEN 'social15@gebzem.app' THEN 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1500&h=500&fit=crop'
    WHEN 'social16@gebzem.app' THEN 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1500&h=500&fit=crop'
    WHEN 'social17@gebzem.app' THEN 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1500&h=500&fit=crop'
    WHEN 'social18@gebzem.app' THEN 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1500&h=500&fit=crop'
    WHEN 'social19@gebzem.app' THEN 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1500&h=500&fit=crop'
    WHEN 'social20@gebzem.app' THEN 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1500&h=500&fit=crop'
  END,
  -- Private: selin, elif
  CASE iu.email WHEN 'social06@gebzem.app' THEN true WHEN 'social08@gebzem.app' THEN true ELSE false END,
  -- Verified: kerem (haber)
  CASE iu.email WHEN 'social13@gebzem.app' THEN true ELSE false END,
  NOW()
FROM inserted_users iu;

-- ───────────────────── HELPER VIEW ─────────────────────
CREATE TEMP VIEW v_users AS
SELECT u.id::uuid AS uid, sp.username
FROM users u JOIN social_profiles sp ON sp.user_id = u.id
WHERE u.email LIKE 'social%@gebzem.app';

-- ───────────────────── POSTLAR ─────────────────────
-- Her kullanıcıya 5-8 post; en az 2-3 tanesi 2-4 fotoğraflı.

INSERT INTO social_posts (author_id, text, media, parent_id, repost_of_id, created_at)
SELECT v.uid, t.text, COALESCE(t.media, '[]'::jsonb), NULL, NULL,
       NOW() - (random() * INTERVAL '6 days') - (INTERVAL '1 minute' * (random() * 1440))
FROM v_users v
CROSS JOIN LATERAL (
  VALUES
    -- ahmet_yilmaz: spor (5 post, 2 fotolu)
    ('ahmet_yilmaz', 'Sabah 6da Eskihisar parkurunda 8km koştum 💪 Hava muhteşemdi! #gebze #kosu #sabah',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000"}]'::jsonb),
    ('ahmet_yilmaz', 'Bu hafta ki antrenman planı: Pzt göğüs, Sal sırt, Çar bacak. Birlikte yapan? #fitness #gebze', '[]'::jsonb),
    ('ahmet_yilmaz', 'Kocaeli yarı maratonu için kayıt açıldı. @sema_fitness ne dersin? Beraber hazırlanalım! #maraton #kocaeli',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1486218119243-13883505764c?w=1000"}]'::jsonb),
    ('ahmet_yilmaz', 'Yeni Asics aldım, ilk koşu denemesi yarın 🔥 Tavsiye ister misin?',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1000"}]'::jsonb),
    ('ahmet_yilmaz', 'Bugünkü hedef: 5K altında 22 dakika 🎯 Düne göre 30 saniye iyileşme.', '[]'::jsonb),
    ('ahmet_yilmaz', 'Kış ayında dış mekan koşu için katmanlı giyim şart. Termal + windbreaker + buff yeterli. #kosu', '[]'::jsonb),

    -- zeynep_kaya: yemek (8 post, 5'i fotolu)
    ('zeynep_kaya', 'Bugünkü tarifim: Kremalı tavuk sote 🍗 Yorumlarda detaylı tarif paylaşıyorum #yemek #tarif #gebzelezzet',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1432139509613-5c4255815697?w=1000"}]'::jsonb),
    ('zeynep_kaya', 'Gebzede yeni keşfettiğim manav var, fiyatlar süper. DM atan herkese yer atıyorum 📍 #gebzelezzet', '[]'::jsonb),
    ('zeynep_kaya', 'Hafta sonu menüsü hazır: Cumartesi mantı 🥟 Pazar etli ekmek 🥖. Hanginiz katılır?',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1565299543923-37dd37887442?w=1000"}]'::jsonb),
    ('zeynep_kaya', 'Ev yapımı dondurma — sadece 4 malzeme. Reels yarın yayında! #yemek #tatli',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1000"}]'::jsonb),
    ('zeynep_kaya', 'Kahvaltı sofrası açıldı 🍳🧀🍅 Pazar günleri en huzurlu an. #gebzelezzet #kahvalti',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1000"}]'::jsonb),
    ('zeynep_kaya', 'Pide hamuru sırrı: en az 1 saat oda sıcaklığında dinlensin. #yemek #ipucu', '[]'::jsonb),
    ('zeynep_kaya', 'Yarın canlı yayın: Tavuk şinitzel tarifi! 20:00de görüşürüz 🎥 #canliyayin #tarif', '[]'::jsonb),
    ('zeynep_kaya', 'Mantı sosu için sarımsaklı yoğurt + tereyağlı sumak — kombinasyon büyüsü ✨',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1000"}]'::jsonb),

    -- mehmet_dev: yazılım (5 post, 1 fotolu)
    ('mehmet_dev', 'Go 1.24 generics constraints daha okunaklı geldi. Type set syntax mükemmel #yazilim #golang',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000"}]'::jsonb),
    ('mehmet_dev', 'Yeni proje: Gebze BS arayüz refactor. Komponent kütüphanesi yenileniyor #yazilim', '[]'::jsonb),
    ('mehmet_dev', 'WebSocket multiplex pattern üzerine blog yazısı hazırlıyorum. İlgilenen DM atsın 💌', '[]'::jsonb),
    ('mehmet_dev', 'Postgres FTS Türkçe için tsvector + Türkçe lexer config'' örneği yarın paylaşacağım.', '[]'::jsonb),
    ('mehmet_dev', 'Junior arkadaşlarımıza ücretsiz Go workshop düşünüyorum. KOÜ ile konuşacağım #egitim #yazilim', '[]'::jsonb),
    ('mehmet_dev', 'Docker compose ile local dev kurmak hâlâ en hızlı. Kubernetes overkill çoğu zaman.', '[]'::jsonb),

    -- ayse_moda: moda (6 post, 4 fotolu)
    ('ayse_moda', 'Bugünkü kombin ☀️ Vintage tarz | mom jean + crop. Yorumlarınız bekleniyor 💕 #moda #stil',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000"}]'::jsonb),
    ('ayse_moda', 'Sonbahar trendi: Toprak tonları! Kahverengi-haki-bej üçlüsü her şeye yakışıyor 🍂',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000"}]'::jsonb),
    ('ayse_moda', 'Gebzede outlet alışverişi karşılaştırma: TopCu, FLO, LCW. Hangisi en iyi? Yorumda 💬', '[]'::jsonb),
    ('ayse_moda', 'Vintage çantamı yeniledim ✨ Önce-sonra:',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000"}]'::jsonb),
    ('ayse_moda', 'Kapsül gardırop yaklaşımı son zamanlarda dikkatimi çekti. Sade ve şık. Deneyenler? 🧥', '[]'::jsonb),
    ('ayse_moda', 'Kış ayakkabısı bot mu spor mu? Ben her gün spor giyiyorum, tören için bot şart 👢',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000"}]'::jsonb),

    -- can_seyahat: gezi (7 post, 5 fotolu)
    ('can_seyahat', 'Gebze Çoban Mustafa Paşa Külliyesi gezdim. Tarihimizi bilmek farklı bir his ✨ #gebze #tarih',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000"}]'::jsonb),
    ('can_seyahat', 'Bayramoğlu sahili sabah 7de. Olağanüstü 🌊 #gebze #sahil',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000"}]'::jsonb),
    ('can_seyahat', 'Eskihisar feribot turu klasik ama hep güzel. Tavsiye: Cumartesi sabah, kalabalık değil 🚢',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1502740479091-635887520276?w=1000"}]'::jsonb),
    ('can_seyahat', 'Bursa-Mudanya vs Eskihisar-Topçular karşılaştırması. Hangisi daha pratik?', '[]'::jsonb),
    ('can_seyahat', 'Yarın Ballıkayalar kanyonu trekking 🥾 Birlikte gelmek isteyen DM atsın!',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000"}]'::jsonb),
    ('can_seyahat', 'Gebze tarihi yapı rotası: 7 yer 1 günde. Yarın detaylı listeyi paylaşacağım 📍', '[]'::jsonb),
    ('can_seyahat', 'Plansız bir Sapanca turu en iyi turdur 🚗💨 #gezi #sapanca',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000"}]'::jsonb),

    -- selin_kitap: kitap, private (4 post, 1 fotolu)
    ('selin_kitap', 'Bu ay 3 kitap bitirdim 📚: 1Q84, Suç ve Ceza, Sapiens. Önerilerinizi yorumda bekliyorum.',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000"}]'::jsonb),
    ('selin_kitap', 'Suç ve Cezada Raskolnikov karakteri için tartışma açıyorum. Vicdan vs ego nerede başlıyor?', '[]'::jsonb),
    ('selin_kitap', 'Gebze kitap kulübü kuruyoruz! İlgilenen DM atsın ✉️ #kitap #gebze', '[]'::jsonb),
    ('selin_kitap', 'En sevdiğiniz Türk yazar kim? Benimki: Sait Faik Abasıyanık. Onun hikayeleri ayrı dünya.', '[]'::jsonb),

    -- mert_oyun: oyun (6 post, 2 fotolu)
    ('mert_oyun', 'CS2 yeni patch geldi, AWP nerf dökümanı çıktı. Görüşler? #oyun',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000"}]'::jsonb),
    ('mert_oyun', 'Akşam stream: Valorant ranked. 21:00de canlı 🎮 #stream', '[]'::jsonb),
    ('mert_oyun', 'Yeni RTX 4070 Ti aldım. FPS testleri yarın paylaşacağım 🔥',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000"}]'::jsonb),
    ('mert_oyun', 'Bana göre yılın en iyi oyunu Baldurs Gate 3. Tartışmaya açığım! ⚔️', '[]'::jsonb),
    ('mert_oyun', 'Gebzede LAN cafe açma fikri konuşuyoruz. İlgilenenler yorumlasın 🎯', '[]'::jsonb),
    ('mert_oyun', 'Eski oyun nostaljisi: GTA San Andreas — hâlâ en iyi açık dünya bence. Tartışalım', '[]'::jsonb),

    -- elif_anne: anne, private (5 post, 1 fotolu)
    ('elif_anne', 'Gebzede çocuk dostu kafe önerileri için DM bekliyorum. Aile gezisi planlıyorum 👶', '[]'::jsonb),
    ('elif_anne', 'Yenidoğan uyku düzeni nasıl olmalı? Tecrübelerinizi yorumda paylaşın 🤱',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1000"}]'::jsonb),
    ('elif_anne', 'Anaokulu seçimi yaptık! Detaylı blog yazısı yarın 📝 #anne #gebze', '[]'::jsonb),
    ('elif_anne', 'Bu hafta ev yapımı bebek maması tarifim — 10 dk hazır 🍎', '[]'::jsonb),
    ('elif_anne', 'Pediatrist önerisi olan? @burak_emlak senin çevren geniş, biliyor musun?', '[]'::jsonb),

    -- burak_emlak: emlak (5 post, 2 fotolu)
    ('burak_emlak', 'Bu hafta öne çıkan: Gebze merkez 3+1, deniz manzaralı, 145m2. Detay DM 🏠 #emlak #gebze',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000"}]'::jsonb),
    ('burak_emlak', 'Kira piyasası analizi: 2024-2026 arası %120 artış. Yatırımcı için fırsat var mı?', '[]'::jsonb),
    ('burak_emlak', 'Konut kredisi faiz indirimi geldi. Ev sahibi olmak için doğru zaman olabilir mi?',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000"}]'::jsonb),
    ('burak_emlak', 'Gebze yeni metro projesi gayrimenkul fiyatlarını nasıl etkileyecek? Tartışalım. #emlak', '[]'::jsonb),
    ('burak_emlak', 'Yatırımlık mı, oturmalık mı? İki farklı strateji, iki farklı analiz. Yarın detay yazı 📊', '[]'::jsonb),

    -- pinar_sanat: sanat (7 post, 5 fotolu)
    ('pinar_sanat', 'Bu haftaki çalışmam: Gebze sahili, akrilik 50x70 🎨 #sanat #resim',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1000"}]'::jsonb),
    ('pinar_sanat', 'Atölyemde kontörlü yağlı boya dersleri başlıyor. Hafta içi akşamları. DM ✏️',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1000"}]'::jsonb),
    ('pinar_sanat', 'Resim yapmaya başlarken en zoru ne? Beyaz tuval. Çözümü: HEMEN BAŞLA. #sanat', '[]'::jsonb),
    ('pinar_sanat', 'Sergi açılışı: 15 Mayıs, Gebze Kültür Merkezi. Tüm Gebzem ailesi davetli 🖼️ #sergi',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1545987796-200677ee1011?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1000"}]'::jsonb),
    ('pinar_sanat', 'Sulu boya tekniği — 3 ipucu yarın yayında. Beni takip etmeyi unutmayın 💧',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=1000"}]'::jsonb),
    ('pinar_sanat', 'Gebze sanatçıları olarak bir kolektif kuralım. Katılmak isteyen yorumlasın 🎨',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1000"}]'::jsonb),
    ('pinar_sanat', 'Atölye günlüğü: 6 saatte bitirdim! Kahve molası bile vermedim ☕❌', '[]'::jsonb),

    -- ozan_muzik: müzik (5 post, 2 fotolu)
    ('ozan_muzik', 'Yeni cover yarın yayında: Tarkan - Beni Çok Sev. Akustik gitar ile 🎸 #muzik',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000"}]'::jsonb),
    ('ozan_muzik', 'Gitar çalmaya başlamak isteyenler için ipuçları thread hazırlıyorum 🎼', '[]'::jsonb),
    ('ozan_muzik', 'Gebzede sokak müziği yapmak yasal mı? Belediyeden bilen var mı?', '[]'::jsonb),
    ('ozan_muzik', 'Hafta sonu Bayramoğlu sahilinde mini konser. Detaylar pinned post 📌',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1501612780327-45045538702b?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000"}]'::jsonb),
    ('ozan_muzik', 'Favori Türkçe şarkı sözü? Benimki: "Gül dudaklı, kara kaşlı" — Ahmet Kaya 💔', '[]'::jsonb),
    ('ozan_muzik', 'Akustik vs elektro gitar başlangıç tartışması. Bence akustik öncelikli — ritim öğreniyorsun.', '[]'::jsonb),

    -- sema_fitness: fitness (7 post, 3 fotolu)
    ('sema_fitness', 'HIIT 20 dk antrenman = 1 saat kardio. Kanıtlanmış bilim. Yarın tutorial 💪 #fitness',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000"}]'::jsonb),
    ('sema_fitness', 'Beslenme tablosu: Kahvaltı yumurta + yulaf, öğle tavuk + sebze, akşam balık + salata. #beslenme',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000"}]'::jsonb),
    ('sema_fitness', 'Kıştan formda çıkmanın yolu — bu üç egzersiz: squat, push-up, plank. Her gün 10 dk. #fitness', '[]'::jsonb),
    ('sema_fitness', 'Kadın antrenmanı erkekten farklı mı? Bilim ne diyor — yarın detaylı yazı 📊', '[]'::jsonb),
    ('sema_fitness', 'Gebze fitness centerlarından hangisini öneriyorsunuz? @ahmet_yilmaz görüşün?', '[]'::jsonb),
    ('sema_fitness', 'Kreatin alıyor musunuz? 5 yıllık deneyimim ile detaylı yorum yarın yayında 💊',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000"}]'::jsonb),
    ('sema_fitness', 'Pilates mi yoga mı? Bence ikisi farklı disiplin, birleştirmek doğru. @gulsah_yoga görüşün?', '[]'::jsonb),

    -- kerem_haber: haber, verified (6 post, 3 fotolu)
    ('kerem_haber', 'GEBZE TRAFİK: D-100 sabah 8-9 arası kilitlendi. Alternatif rota? Yorumda 🚗 #gebze',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000"}]'::jsonb),
    ('kerem_haber', 'Gebze Belediye Başkanı bugün açıklama yapacak. Detaylar 14:00de yayında 📺', '[]'::jsonb),
    ('kerem_haber', 'YEREL HABER: Yeni park açılıyor — Bağlarbaşı bölgesi. Aile dostu, ücretsiz giriş 🌳',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=1000"}]'::jsonb),
    ('kerem_haber', 'Hava durumu uyarısı: Yarın sağanak yağmur 🌧️ Şemsiyenizi unutmayın!', '[]'::jsonb),
    ('kerem_haber', 'Gebze Etkinlik Takvimi (Mayıs): 12-15 Çocuk Şenliği, 20 Hıdırellez, 28 Bahar Konseri 🎉',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000"}]'::jsonb),
    ('kerem_haber', 'BREAKING: Gebze Kentpark açılış tarihi belli oldu. Tüm aile için ücretsiz aktiviteler #gebze', '[]'::jsonb),

    -- derya_kahve: kahve (5 post, 4 fotolu)
    ('derya_kahve', 'Bugünkü latte art ☕ İlk kez kalp + tulip kombo başardım! #kahve #latteart',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1000"}]'::jsonb),
    ('derya_kahve', 'Specialty kahve nedir? 80+ puan. Kavurma 1 ayı geçmemeli. Tek menşeli olmalı 🌱',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1000"}]'::jsonb),
    ('derya_kahve', 'V60 vs Kalita Wave demleme — hangi yöntem daha temiz cup? Test sonuçları yarın ⚗️',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000"}]'::jsonb),
    ('derya_kahve', 'Mavi Kafede yarın specialty kahve workshop. Kayıt için DM 💌 #gebze',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1000"}]'::jsonb),
    ('derya_kahve', 'Türk kahvesi mi espresso mu? İkisi de farklı bir sanat. Biri kültür, biri teknik ☕', '[]'::jsonb),

    -- furkan_film: film (5 post, 2 fotolu)
    ('furkan_film', 'Bu hafta izlediklerim: Oppenheimer (10/10), Past Lives (8/10), Killers of the Flower Moon (9/10) 🎬',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000"}]'::jsonb),
    ('furkan_film', 'Klasikler: Yedi Samuray. Bu filmi izlemeyenin sineması eksik 🎌', '[]'::jsonb),
    ('furkan_film', 'En sevdiğiniz Türk filmi? Bende ilk üç: Eşkıya, Hababam Sınıfı, Ayla. Yorumlarda 🇹🇷',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1000"}]'::jsonb),
    ('furkan_film', 'Netflix yeni dizisi 3 Body Problem 4. bölüme kadar idare ederdi, 5. bölümden sonra patladı 🚀', '[]'::jsonb),
    ('furkan_film', 'Sineması olan kasaba olmak isterdim. Gebzede yeni bir art-house sinema açılsa 🎥', '[]'::jsonb),

    -- tugce_gezgin: solo backpacker (6 post, 4 fotolu)
    ('tugce_gezgin', '32 ülkeden notlar — Geçen sene Gürcistan, bu sene Vietnam. En unutulmaz: Tiflis sokakları 🇬🇪',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000"}]'::jsonb),
    ('tugce_gezgin', 'Solo gezi tavsiyesi: ilk gün sade kalın. Şehri jet-lag dolu görmek vızıltı yapar.', '[]'::jsonb),
    ('tugce_gezgin', 'Bütçeli gezi rehberi: Hostel + ortak mutfak + günlük 1 lokal yemek = günde 30 EUR 💰',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1000"}]'::jsonb),
    ('tugce_gezgin', 'Türkiyede en sevdiğim rota: Likya yolu. Adrasan-Olimpos arası 4 gün — eşsiz 🥾',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1505765050516-f237aab16ce4?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000"}]'::jsonb),
    ('tugce_gezgin', 'Gebze backpack — şehirden çıkış için ucuz uçuş kaynağı: SAW + Skyscanner whole month',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000"}]'::jsonb),
    ('tugce_gezgin', 'Sırt çantasında olmazsa olmaz 5 şey: powerbank, kit-medikal, dünya prizi, çamaşır ipi, dry bag', '[]'::jsonb),

    -- omer_chef: şef (5 post, 4 fotolu)
    ('omer_chef', 'Bugünkü menü: Hellim salatası + arpa şehriye pilavı + balık carpaccio 🐟',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000"}]'::jsonb),
    ('omer_chef', 'Akdeniz mutfağı sırrı: zeytinyağı + limon + tuz. Üçü doğruysa, malzeme parlar.', '[]'::jsonb),
    ('omer_chef', 'Catering hizmeti veriyorum, Gebze ve civar düğünler için. DM ile detay 💌',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000"}]'::jsonb),
    ('omer_chef', 'Restoran açma planlayan arkadaşlara danışmanlık. 12 yıllık tecrübe + maliyet analizi 📊', '[]'::jsonb),
    ('omer_chef', 'Carpaccio kesim için bıçak ısı önemli. Frigorifik dakikalardan sonra 1 mm ince kesim sağlanır.',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=1000"}]'::jsonb),

    -- gulsah_yoga: yoga (5 post, 3 fotolu)
    ('gulsah_yoga', 'Sabah seansı bugün dolu! 7:00 Vinyasa flow, online + stüdyo. Kayıt linki bio''da 🧘',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=1000"}]'::jsonb),
    ('gulsah_yoga', 'Meditasyon temel kuralı: nefesi takip et, düşünceleri yargılamadan akıt. 5 dakika yeter.', '[]'::jsonb),
    ('gulsah_yoga', 'Hatha mı Vinyasa mı? Hatha durağan, vinyasa akıcı. Başlangıç için Hatha, ilerleme için Vinyasa.', '[]'::jsonb),
    ('gulsah_yoga', 'Yoga matı seçimi: 6mm konfor, 4mm denge. PVC değil TPE tercih edilir 🧘‍♀️',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1000"}]'::jsonb),
    ('gulsah_yoga', 'Yarın sabah 7:00 — Bayramoğlu sahilinde açık hava yoga. Ücretsiz, davet et beraber. 🌅',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000"}]'::jsonb),

    -- hakan_oto: otomobil (5 post, 3 fotolu)
    ('hakan_oto', 'Klasik otomobil: 1972 Ford Mustang elimde. Restorasyon başlıyor. Süreç paylaşılacak 🚗',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1542362567-b07e54358753?w=1000"}]'::jsonb),
    ('hakan_oto', 'Hibrit mi elektrik mi? Türkiye şartlarında hibrit hâlâ avantajlı — şarj altyapısı yetersiz.', '[]'::jsonb),
    ('hakan_oto', 'Galerimde bu hafta yeni stok: BMW 320i 2018, fiyat ve detay DM 📩',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1000"}]'::jsonb),
    ('hakan_oto', '2. el oto alırken ekspertiz şart. 500-1000 TL masraf, 50-100 bin TL kurtarır.', '[]'::jsonb),
    ('hakan_oto', 'Kış lastiği zorunluluğu Aralık 1de başlıyor. Hâlâ değiştirmedinseniz acele 🛞',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1000"}]'::jsonb),

    -- beste_dans: modern dans (5 post, 3 fotolu)
    ('beste_dans', 'Yarın sahne: Modern dans gösterisi, Gebze Kültür Merkezi 19:30. Davetlisiniz! 💃',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1000"},{"type":"image","url":"https://images.unsplash.com/photo-1574391884720-bbc049ec09ad?w=1000"}]'::jsonb),
    ('beste_dans', 'Workshop: Hafta sonu çocuklar için modern dans tanışma seansı. 5-10 yaş 🎶',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1535525153412-5a092d46b6c6?w=1000"}]'::jsonb),
    ('beste_dans', 'Dansta esnek olmak başlangıç değil sonuç. Önce form, sonra esneme. Sıralama önemli.', '[]'::jsonb),
    ('beste_dans', '@ozan_muzik canlı performans için anlaştık! Önümüzdeki ay dans + akustik gitar gösterisi 🎸💃', '[]'::jsonb),
    ('beste_dans', 'Hafta sonu workshop kayıt limit: 12 kişi. Şu ana kadar 8 kişi. Acele edin! 📞',
      '[{"type":"image","url":"https://images.unsplash.com/photo-1547153760-18fc86324498?w=1000"}]'::jsonb)
) AS t(uname, text, media)
WHERE v.username = t.uname;

-- ───────────────────── COMMENTS (parent_id ile) ─────────────────────
-- Birçok popüler posta yorum

DO $$
DECLARE
  ahmet_p1 uuid;
  zeynep_p1 uuid;
  zeynep_p2 uuid;
  kerem_p1 uuid;
  pinar_p1 uuid;
  derya_p1 uuid;
  ayse_p1 uuid;
  can_p1 uuid;
  furkan_p1 uuid;
  sema_p1 uuid;
  tugce_p1 uuid;
  omer_p1 uuid;
BEGIN
  SELECT id INTO ahmet_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='ahmet_yilmaz') AND text LIKE 'Sabah 6da%' LIMIT 1;
  SELECT id INTO zeynep_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='zeynep_kaya') AND text LIKE 'Bugünkü tarifim%' LIMIT 1;
  SELECT id INTO zeynep_p2 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='zeynep_kaya') AND text LIKE 'Kahvaltı%' LIMIT 1;
  SELECT id INTO kerem_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='kerem_haber') AND text LIKE 'BREAKING%' LIMIT 1;
  SELECT id INTO pinar_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='pinar_sanat') AND text LIKE 'Bu haftaki%' LIMIT 1;
  SELECT id INTO derya_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='derya_kahve') AND text LIKE 'Bugünkü latte%' LIMIT 1;
  SELECT id INTO ayse_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='ayse_moda') AND text LIKE 'Bugünkü kombin%' LIMIT 1;
  SELECT id INTO can_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='can_seyahat') AND text LIKE 'Bayramoğlu%' LIMIT 1;
  SELECT id INTO furkan_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='furkan_film') AND text LIKE 'Bu hafta izledikler%' LIMIT 1;
  SELECT id INTO sema_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='sema_fitness') AND text LIKE 'HIIT%' LIMIT 1;
  SELECT id INTO tugce_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='tugce_gezgin') AND text LIKE '32 ülke%' LIMIT 1;
  SELECT id INTO omer_p1 FROM social_posts WHERE author_id=(SELECT uid FROM v_users WHERE username='omer_chef') AND text LIKE 'Bugünkü menü%' LIMIT 1;

  INSERT INTO social_posts (author_id, text, media, parent_id, created_at)
  SELECT v.uid, t.text, '[]'::jsonb, t.parent_id, NOW() - (random() * INTERVAL '5 days')
  FROM (
    VALUES
      -- ahmet koşu yorumları
      ('sema_fitness',  'Helal! Hangi rotayı kullandın?', ahmet_p1),
      ('mert_oyun',     'Sabah 6da uyanmak baba 😅 Tebrikler', ahmet_p1),
      ('zeynep_kaya',   'Koşu sonrası kahvaltıya bekleriz! 🍳', ahmet_p1),
      ('tugce_gezgin',  'Eskihisar parkurunu denemediim henüz, planımda var 🏃‍♀️', ahmet_p1),
      ('gulsah_yoga',   'Koşu sonrası 5 dk esneme şart. Hamstring ve calf öncelikli 🧘', ahmet_p1),

      -- zeynep tarif yorumları
      ('elif_anne',     'Tarifi paylaşır mısın lütfen? 🙏', zeynep_p1),
      ('ayse_moda',     'Görsel müthiş. Tabağın da güzel ✨', zeynep_p1),
      ('derya_kahve',   'Yanına bir Latte gider 😍☕', zeynep_p1),
      ('omer_chef',     'Tavuk pişirmeden önce sütlü marine deneyin, et ekstra yumuşak olur 👌', zeynep_p1),
      ('beste_dans',    'Akşam yemek programıma not aldım 📝', zeynep_p1),

      -- zeynep kahvaltı yorumları
      ('can_seyahat',   'Pazar kahvaltısı huzur veriyor gerçekten ☀️', zeynep_p2),
      ('hakan_oto',     'Bu sofradan tek bir lokma kalmaz! 😋', zeynep_p2),

      -- kerem park yorumları
      ('can_seyahat',   'Bu güzel haber! Açılış için orada olacağım 📸', kerem_p1),
      ('pinar_sanat',   'Park için sergi düşünüyorum, beraber yapalım 🎨', kerem_p1),
      ('ozan_muzik',    'Açılışta canlı müzik için müsaitim 🎸', kerem_p1),
      ('furkan_film',   'Açılışta open-air sinema yapılsa harika olur 🎬', kerem_p1),
      ('beste_dans',    'Dans gösterisiyle açılışa katkı yapabilirim 💃', kerem_p1),
      ('elif_anne',     'Çocukla gideceğim, oyun alanları var mı?', kerem_p1),

      -- pinar resim yorumları
      ('ayse_moda',     'Renkler muhteşem 🎨 Fiyat almak ister misin?', pinar_p1),
      ('derya_kahve',   'Kafe duvarına kesinlikle uyar, görüşelim ☕', pinar_p1),
      ('beste_dans',    'Sergiye geleceğim, sahne dekoru için ilham alıyorum 💡', pinar_p1),

      -- derya latte yorumları
      ('zeynep_kaya',   'Latte art ile dondurma kombosu denemek istiyorum yapıyor musun?', derya_p1),
      ('omer_chef',     'Kavurma derecesi: orta-koyu mu açık mı?', derya_p1),
      ('gulsah_yoga',   'Sabah meditasyonu sonrası en güzel ödül 🧘☕', derya_p1),

      -- ayse kombin yorumları
      ('zeynep_kaya',   'Çok yakışmış! Ayakkabıyla denge kurmuşsun 👟', ayse_p1),
      ('beste_dans',    'Vintage tarzının fanı oldum 💕', ayse_p1),
      ('selin_kitap',   'Bu kombin bir kitap kapağı olabilir 📚✨', ayse_p1),

      -- can sahil yorumları
      ('tugce_gezgin',  'Bayramoğlu sabah ışığı tek kelimeyle inanılmaz 🌅', can_p1),
      ('ahmet_yilmaz',  'O parkurda sabah koşumu yapıyorum, mükemmel manzara!', can_p1),
      ('hakan_oto',     'Klasik araba çekimi için harika lokasyon 🚗📸', can_p1),

      -- furkan film yorumları
      ('selin_kitap',   'Past Lives kitap uyarlaması mı? Ben okumadım, öneri var mı?', furkan_p1),
      ('mert_oyun',     'Oppenheimer 3 saat ama hiç hissetmedim, müthiş kurguydu', furkan_p1),

      -- sema HIIT yorumları
      ('ahmet_yilmaz',  'HIIT koşu için inanılmaz tamamlayıcı 💪', sema_p1),
      ('gulsah_yoga',   'HIIT sonrası 10 dk yoga restorative — dengesi tam çıkıyor', sema_p1),

      -- tugce gezi yorumları
      ('can_seyahat',   'Likya yolu rotanı kesinlikle paylaş, ben de plan yapıyorum 🥾', tugce_p1),
      ('beste_dans',    'Tiflis sokaklarında dans var mı, danslı şehirler listende? 💃', tugce_p1),

      -- omer şef yorumları
      ('zeynep_kaya',   'Hellim salata sosunu paylaşır mısın? 🥗', omer_p1),
      ('derya_kahve',   'Catering için seninle görüşeceğim, kafede etkinlik düşünüyorum', omer_p1)
  ) AS t(uname, text, parent_id)
  JOIN v_users v ON v.username = t.uname
  WHERE t.parent_id IS NOT NULL;
END $$;

-- Yorum sayılarını güncelle
UPDATE social_posts p SET comments_count = (SELECT COUNT(*) FROM social_posts c WHERE c.parent_id = p.id);

-- ───────────────────── REACTIONS (yoğun) ─────────────────────
-- Her kullanıcı 12 random posta like atar (kendi postlarına değil)
INSERT INTO social_reactions (user_id, post_id, reaction)
SELECT u.uid, p.id, 'like'
FROM v_users u
CROSS JOIN LATERAL (
  SELECT id FROM social_posts
  WHERE author_id != u.uid AND parent_id IS NULL AND is_deleted = false
  ORDER BY random() LIMIT 12
) p
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Like count refresh
UPDATE social_posts p SET likes_count = (SELECT COUNT(*) FROM social_reactions r WHERE r.post_id = p.id AND r.reaction='like');

-- Bazı yorumlara da like (sosyal canlılık)
INSERT INTO social_reactions (user_id, post_id, reaction)
SELECT u.uid, p.id, 'like'
FROM v_users u
CROSS JOIN LATERAL (
  SELECT id FROM social_posts WHERE author_id != u.uid AND parent_id IS NOT NULL AND is_deleted = false
  ORDER BY random() LIMIT 4
) p
ON CONFLICT (user_id, post_id) DO NOTHING;

UPDATE social_posts p SET likes_count = (SELECT COUNT(*) FROM social_reactions r WHERE r.post_id = p.id AND r.reaction='like');

-- ───────────────────── VIEWS (canlı görünüm) ─────────────────────
-- Her postu 30-150 view (popülerlik dağılımı)
UPDATE social_posts SET views_count = (random() * 120 + 30)::int
WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
  AND parent_id IS NULL;

-- ───────────────────── FOLLOWS ─────────────────────
-- Her kullanıcı 7-12 random kişiyi takip eder
INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT a.uid, b.uid, 'accepted', NOW() - (random() * INTERVAL '30 days')
FROM v_users a
CROSS JOIN LATERAL (SELECT uid FROM v_users WHERE uid != a.uid ORDER BY random() LIMIT 9) b
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- Kerem (verified) çok takipçi alsın
INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT a.uid, (SELECT uid FROM v_users WHERE username='kerem_haber'), 'accepted', NOW() - (random() * INTERVAL '20 days')
FROM v_users a WHERE a.username != 'kerem_haber'
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- Private hesaplara pending istek
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

INSERT INTO social_follows (follower_id, followed_id, status, created_at)
SELECT
  (SELECT uid FROM v_users WHERE username='tugce_gezgin'),
  (SELECT uid FROM v_users WHERE username='selin_kitap'),
  'pending', NOW() - INTERVAL '6 hours'
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- Counter refresh (followers, following, posts)
UPDATE social_profiles sp SET
  followers_count = (SELECT COUNT(*) FROM social_follows f WHERE f.followed_id = sp.user_id AND f.status='accepted'),
  following_count = (SELECT COUNT(*) FROM social_follows f WHERE f.follower_id = sp.user_id AND f.status='accepted'),
  posts_count     = (SELECT COUNT(*) FROM social_posts p WHERE p.author_id = sp.user_id AND p.is_deleted = false AND p.parent_id IS NULL);

-- ───────────────────── HASHTAGS ─────────────────────
INSERT INTO social_hashtags (tag, posts_count, last_used_at)
SELECT lower(matches.tag), COUNT(*), MAX(p.created_at)
FROM social_posts p
CROSS JOIN LATERAL (SELECT regexp_matches(p.text, '#([a-zA-Z0-9_]{1,50})', 'g') AS m) re
CROSS JOIN LATERAL (SELECT re.m[1] AS tag) matches
WHERE p.text IS NOT NULL AND p.is_deleted = false
GROUP BY lower(matches.tag)
ON CONFLICT (tag) DO UPDATE SET posts_count = EXCLUDED.posts_count, last_used_at = EXCLUDED.last_used_at;

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

-- ───────────────────── DM CONVERSATIONS ─────────────────────
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
  tugce uuid := (SELECT uid FROM v_users WHERE username='tugce_gezgin');
  omer uuid := (SELECT uid FROM v_users WHERE username='omer_chef');
  gulsah uuid := (SELECT uid FROM v_users WHERE username='gulsah_yoga');
  beste uuid := (SELECT uid FROM v_users WHERE username='beste_dans');
  cid uuid;
  u1 uuid; u2 uuid;
BEGIN
  -- Thread 1: ahmet - zeynep
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

  -- Thread 2: mehmet - mert
  IF mehmet < mert THEN u1:=mehmet; u2:=mert; ELSE u1:=mert; u2:=mehmet; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Pazartesi 20:00 Discord ekran paylaşımıyla', NOW() - INTERVAL '1 day', mehmet, CASE WHEN u1=mert THEN 1 ELSE 0 END, CASE WHEN u1=mehmet THEN 1 ELSE 0 END)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, mert,   'Hocam yeni kart aldım, sürücü problemi yaşadım', true, NOW() - INTERVAL '2 days'),
    (cid, mehmet, 'Hangi marka? Driver clean install gerekebilir', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (cid, mert,   'Nvidia 4070 Ti', true, NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
    (cid, mehmet, 'DDU ile temizle, sonra fresh kur', true, NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
    (cid, mert,   'Anlaşıldı, akşam denerim. Help eder misin?', true, NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),
    (cid, mehmet, 'Pazartesi 20:00 Discord ekran paylaşımıyla', false, NOW() - INTERVAL '1 day');

  -- Thread 3: ayse - pinar
  IF ayse < pinar THEN u1:=ayse; u2:=pinar; ELSE u1:=pinar; u2:=ayse; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Sergi açılışı için kombin tavsiyesi alabilir miyim 🎀', NOW() - INTERVAL '6 hours', ayse, CASE WHEN u1=pinar THEN 1 ELSE 0 END, CASE WHEN u1=ayse THEN 1 ELSE 0 END)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, pinar, 'Ayşe canım, sergime davetlisin 💕', true, NOW() - INTERVAL '1 day'),
    (cid, ayse,  'Vay! Çok mutlu oldum, kesin gelirim 🥰', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    (cid, pinar, 'Açılış özel — şık bir kombin yap 😉', true, NOW() - INTERVAL '20 hours'),
    (cid, ayse,  'Sergi açılışı için kombin tavsiyesi alabilir miyim 🎀', false, NOW() - INTERVAL '6 hours');

  -- Thread 4: tugce - can (gezi planları)
  IF tugce < can_u THEN u1:=tugce; u2:=can_u; ELSE u1:=can_u; u2:=tugce; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Likya yolu rotamı PDF olarak gönderdim', NOW() - INTERVAL '4 hours', tugce, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, can_u, 'Tuğçe selam! Likya yolu için detaylı rotan var mı?', true, NOW() - INTERVAL '8 hours'),
    (cid, tugce, 'Kesinlikle! 4 günlük plan, GPS kayıtlı', true, NOW() - INTERVAL '7 hours'),
    (cid, can_u, 'Süper, bana yollar mısın?', true, NOW() - INTERVAL '6 hours'),
    (cid, tugce, 'Likya yolu rotamı PDF olarak gönderdim', true, NOW() - INTERVAL '4 hours');

  -- Thread 5: ozan - sema
  IF ozan < sema THEN u1:=ozan; u2:=sema; ELSE u1:=sema; u2:=ozan; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Açık hava bence harika fikir 🎸', NOW() - INTERVAL '3 hours', sema, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, ozan, 'Sema, Bayramoğlu konserine eşlik etmek ister misin? 🎶', true, NOW() - INTERVAL '6 hours'),
    (cid, sema, 'Vay, ne hoş bir öneri!', true, NOW() - INTERVAL '5 hours'),
    (cid, ozan, 'Akustik gitar - vokal istiyorum, sen yan vokal? 🎤', true, NOW() - INTERVAL '4 hours'),
    (cid, sema, 'Açık hava bence harika fikir 🎸', true, NOW() - INTERVAL '3 hours');

  -- Thread 6: derya - zeynep
  IF derya < zeynep THEN u1:=derya; u2:=zeynep; ELSE u1:=zeynep; u2:=derya; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Cumartesi 14:00 Mavi Kafede 💕', NOW() - INTERVAL '4 hours', derya, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, zeynep, 'Senin yaptığın latteleri çok övüyorlar! Bir gün bizden ne dersin?', true, NOW() - INTERVAL '8 hours'),
    (cid, derya,  'Davet ettiğin için sevindim 🥰 Kahve + dondurma denemek isterim', true, NOW() - INTERVAL '7 hours'),
    (cid, zeynep, 'O zaman cumartesi nasıl?', true, NOW() - INTERVAL '5 hours'),
    (cid, derya,  'Cumartesi 14:00 Mavi Kafede 💕', true, NOW() - INTERVAL '4 hours');

  -- Thread 7: furkan - selin
  IF furkan < selin THEN u1:=furkan; u2:=selin; ELSE u1:=selin; u2:=furkan; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Anlaştık, paylaşımlı blog yazalım', NOW() - INTERVAL '15 minutes', furkan, CASE WHEN u1=selin THEN 1 ELSE 0 END, CASE WHEN u1=furkan THEN 1 ELSE 0 END)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, selin, 'Furkan, kitap-film karşılaştırması yapalım mı? Suç ve Ceza dizisi var', true, NOW() - INTERVAL '2 hours'),
    (cid, furkan, 'Süper fikir! Film vs kitap analizi her zaman ilginç', true, NOW() - INTERVAL '1 hour 30 minutes'),
    (cid, selin, 'Birlikte yazsak nasıl olur? Sen film, ben kitap yorumu', true, NOW() - INTERVAL '45 minutes'),
    (cid, furkan, 'Anlaştık, paylaşımlı blog yazalım', false, NOW() - INTERVAL '15 minutes');

  -- Thread 8: omer - zeynep (mutfak danışma)
  IF omer < zeynep THEN u1:=omer; u2:=zeynep; ELSE u1:=zeynep; u2:=omer; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Yarın atölyemde detaylı anlatırım 🍳', NOW() - INTERVAL '30 minutes', omer, CASE WHEN u1=zeynep THEN 1 ELSE 0 END, CASE WHEN u1=omer THEN 1 ELSE 0 END)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, zeynep, 'Ömer, restoran açma fikrim var. Maliyet danışmanlığı yapar mısın?', true, NOW() - INTERVAL '6 hours'),
    (cid, omer,   'Tabii, görüşelim. Konsept ne — Türk-Akdeniz mi?', true, NOW() - INTERVAL '5 hours'),
    (cid, zeynep, 'Tarif odaklı bistro düşünüyorum', true, NOW() - INTERVAL '2 hours'),
    (cid, omer,   'Yarın atölyemde detaylı anlatırım 🍳', false, NOW() - INTERVAL '30 minutes');

  -- Thread 9: gulsah - sema
  IF gulsah < sema THEN u1:=gulsah; u2:=sema; ELSE u1:=sema; u2:=gulsah; END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Pilates+yoga workshop birleşik yaparız 🧘‍♀️', NOW() - INTERVAL '1 hour', gulsah, 0, 0)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, sema, 'Gülşah, ortak workshop yapalım — fitness + yoga', true, NOW() - INTERVAL '4 hours'),
    (cid, gulsah, 'Süper fikir! Hangi tarih uygun?', true, NOW() - INTERVAL '3 hours'),
    (cid, sema, 'Önümüzdeki hafta sonu Cumartesi sabah?', true, NOW() - INTERVAL '2 hours'),
    (cid, gulsah, 'Pilates+yoga workshop birleşik yaparız 🧘‍♀️', true, NOW() - INTERVAL '1 hour');

  -- Thread 10: hakan - can (klasik araba & gezi)
  IF (SELECT uid FROM v_users WHERE username='hakan_oto') < can_u THEN
    u1:=(SELECT uid FROM v_users WHERE username='hakan_oto'); u2:=can_u;
  ELSE
    u1:=can_u; u2:=(SELECT uid FROM v_users WHERE username='hakan_oto');
  END IF;
  INSERT INTO social_dm_conversations (user1_id, user2_id, last_message, last_message_at, last_sender_id, user1_unread, user2_unread)
  VALUES (u1, u2, 'Bu cumartesi Mustang ile sahil çekimine var mısın?', NOW() - INTERVAL '20 minutes',
    (SELECT uid FROM v_users WHERE username='hakan_oto'), CASE WHEN u1=can_u THEN 1 ELSE 0 END, CASE WHEN u1=(SELECT uid FROM v_users WHERE username='hakan_oto') THEN 1 ELSE 0 END)
  RETURNING id INTO cid;
  INSERT INTO social_dm_messages (conversation_id, sender_id, text, is_read, created_at) VALUES
    (cid, can_u, 'Hakan, klasik Mustangı görmek istedim. Çekim için müsaitiz', true, NOW() - INTERVAL '3 hours'),
    (cid, (SELECT uid FROM v_users WHERE username='hakan_oto'), 'Restorasyon başlamadan önce orijinal hali çekelim', true, NOW() - INTERVAL '2 hours'),
    (cid, can_u, 'Bayramoğlu sabah 7 nasıl?', true, NOW() - INTERVAL '1 hour'),
    (cid, (SELECT uid FROM v_users WHERE username='hakan_oto'), 'Bu cumartesi Mustang ile sahil çekimine var mısın?', false, NOW() - INTERVAL '20 minutes');
END $$;

-- ───────────────────── STORIES (8 aktif) ─────────────────────
INSERT INTO social_stories (author_id, media_url, media_type, thumbnail_url, caption, duration_sec, created_at, expires_at)
SELECT v.uid, t.media_url, t.media_type, t.thumbnail, t.caption, t.duration, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours'
FROM (
  VALUES
    ('zeynep_kaya',  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200', 'image', NULL, 'Akşam yemeği 🍝', 5),
    ('ahmet_yilmaz', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', 'image', NULL, 'Sabah koşusu 🏃‍♂️', 5),
    ('pinar_sanat',  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200', 'image', NULL, 'Yeni eserim 🎨', 5),
    ('derya_kahve',  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 'image', NULL, 'Latte art ☕', 5),
    ('can_seyahat',  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', 'image', NULL, 'Eskihisar sahili 🌊', 5),
    ('kerem_haber',  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200', 'image', NULL, 'Gebze haberleri 📰', 5),
    ('tugce_gezgin', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200', 'image', NULL, 'Yeni rotada ✈️', 5),
    ('beste_dans',   'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200', 'image', NULL, 'Provada 💃', 5)
) AS t(uname, media_url, media_type, thumbnail, caption, duration)
JOIN v_users v ON v.username = t.uname;

-- ───────────────────── BİLDİRİMLER (mock — ahmet alıcı) ─────────────────────
INSERT INTO notifications (user_id, business_id, admin, type, title, body, is_read, actors, count, aggregation_key, target_url, created_at, updated_at)
SELECT
  ahmet.uid, NULL, false, t.type, t.title, t.body, false,
  jsonb_build_array(jsonb_build_object(
    'user_id', actor.uid::text, 'username', actor.username,
    'display_name', sp.display_name, 'avatar_url', sp.avatar_url
  )),
  1, t.type || ':' || t.target, t.target_url,
  NOW() - t.age, NOW() - t.age
FROM (SELECT uid, username FROM v_users WHERE username='ahmet_yilmaz') ahmet
CROSS JOIN LATERAL (
  VALUES
    ('zeynep_kaya', 'social_like',     'Zeynep Kaya gönderini beğendi',          NULL, 'feed-1', '/sosyal/post/feed-1', INTERVAL '5 minutes'),
    ('mehmet_dev',  'social_comment',  'Mehmet Demir gönderine yorum yaptı',     'Helal sana usta, ne kadar kaçtın?', 'feed-1', '/sosyal/post/feed-1', INTERVAL '12 minutes'),
    ('sema_fitness','social_follow',   'Sema Erdoğan seni takip etti',           NULL, 'follow-sema', '/sosyal/sema_fitness', INTERVAL '1 hour'),
    ('mert_oyun',   'social_repost',   'Mert Çelik gönderini paylaştı',          NULL, 'feed-2', '/sosyal/post/feed-2', INTERVAL '2 hours'),
    ('kerem_haber', 'social_mention',  'Kerem Aksoy seni bir gönderide etiketledi', '@ahmet_yilmaz Gebze maraton kayıtları açıldı!', 'mention-1', '/sosyal/post/mention-1', INTERVAL '4 hours'),
    ('can_seyahat', 'social_follow',   'Can Öztürk seni takip etti',             NULL, 'follow-can', '/sosyal/can_seyahat', INTERVAL '8 hours')
) AS t(actor_un, type, title, body, target, target_url, age)
JOIN v_users actor ON actor.username = t.actor_un
JOIN social_profiles sp ON sp.user_id = actor.uid;

-- ───────────────────── SONUÇ RAPORU ─────────────────────
SELECT 'social_profiles' AS tbl, COUNT(*) FROM social_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_posts',         COUNT(*) FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app') AND parent_id IS NULL
UNION ALL SELECT 'social_comments',      COUNT(*) FROM social_posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app') AND parent_id IS NOT NULL
UNION ALL SELECT 'social_reactions',     COUNT(*) FROM social_reactions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_follows',       COUNT(*) FROM social_follows WHERE follower_id IN (SELECT id FROM users WHERE email LIKE 'social%@gebzem.app')
UNION ALL SELECT 'social_dm_conversations', COUNT(*) FROM social_dm_conversations
UNION ALL SELECT 'social_dm_messages',   COUNT(*) FROM social_dm_messages
UNION ALL SELECT 'social_stories',       COUNT(*) FROM social_stories
UNION ALL SELECT 'social_hashtags',      COUNT(*) FROM social_hashtags
UNION ALL SELECT 'notifications (social)', COUNT(*) FROM notifications WHERE type LIKE 'social_%';

DROP VIEW IF EXISTS v_users;

SQLEOF

ok "GebzemSosyal seed tamamlandı (20 hesap, 100+ post, ~40 yorum, kapak+avatar)"
log "Test hesapları: social01@gebzem.app ... social20@gebzem.app (şifre: 80148014)"
log "Username: ahmet_yilmaz, zeynep_kaya, mehmet_dev, ayse_moda, can_seyahat, selin_kitap (private), mert_oyun, elif_anne (private), burak_emlak, pinar_sanat, ozan_muzik, sema_fitness, kerem_haber (verified), derya_kahve, furkan_film, tugce_gezgin, omer_chef, gulsah_yoga, hakan_oto, beste_dans"
