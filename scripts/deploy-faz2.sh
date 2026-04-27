#!/bin/bash
# =============================================================================
# GebzemSosyal FAZ 2 — Tek Seferlik Deploy Script
#
# Kullanım (sunucuda):
#   ssh -i ~/.ssh/gebzem root@138.68.69.122
#   cd /opt/gebzem-web && git pull
#   bash /opt/gebzem-web/scripts/deploy-faz2.sh
# =============================================================================

set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[FAZ2-DEPLOY]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

WEB=/opt/gebzem-web
API=/opt/gebzem-api

[ -d "$WEB" ] || err "$WEB bulunamadı"
[ -d "$API" ] || err "$API bulunamadı"

# 1. DB MIGRATION
log "1/5 — DB migration uygulanıyor (social_stories + notifications)..."
sudo -u postgres psql -d gebzem_db -f "$WEB/scripts/social-faz2-migration.sql" >/dev/null
ok "Migration tamam"

# 2. GO API DOSYALARINI KOPYALA
log "2/5 — Go API dosyaları kopyalanıyor..."
# main.go → /opt/gebzem-api/main.go
cp "$WEB/backend-deploy/main.go" "$API/main.go"
# Yeni handler'lar
cp "$WEB/backend-deploy/social.go"               "$API/handlers/social.go"
cp "$WEB/backend-deploy/social_dm.go"            "$API/handlers/social_dm.go"
cp "$WEB/backend-deploy/social_stories.go"       "$API/handlers/social_stories.go"
cp "$WEB/backend-deploy/social_notifications.go" "$API/handlers/social_notifications.go"
cp "$WEB/backend-deploy/ws_social.go"            "$API/handlers/ws_social.go"
ok "Dosyalar kopyalandı"

# 3. GO BUILD + RESTART
log "3/5 — Go API derleniyor..."
export PATH=/usr/local/go/bin:/usr/bin:/bin
cd "$API"
# Bağımlılıkları yükle (gofiber/contrib/websocket eklenmediyse)
go get github.com/gofiber/contrib/websocket@latest >/dev/null 2>&1 || true
go mod tidy >/dev/null 2>&1
go build -o gebzem-api-bin . || err "Go build başarısız"
systemctl restart gebzem-api
sleep 2
systemctl is-active --quiet gebzem-api || err "gebzem-api başlamadı, journalctl -u gebzem-api -n 50 kontrol et"
ok "Go API canlı"

# 4. FRONT END BUILD (PM2)
log "4/5 — Next.js build..."
cd "$WEB"
npm install --production=false >/dev/null 2>&1 || true
npm run build || err "Next.js build başarısız"
pm2 restart gebzem-web
ok "Next.js canlı"

# 5. SEED (sosyal mock data)
log "5/5 — Sosyal mock seed uygulanıyor..."
bash "$WEB/scripts/seed-social.sh"
ok "Seed tamamlandı"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  GebzemSosyal FAZ 2 deploy tamamlandı!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Test:"
echo "  curl https://gebzem.app/api/v1/health"
echo "  Tarayıcıdan https://gebzem.app/sosyal aç"
echo "  WebSocket: wss://gebzem.app/ws/social?token=<JWT>"
echo ""
echo "Test hesapları (şifre: 80148014):"
echo "  social01@gebzem.app → @ahmet_yilmaz"
echo "  social02@gebzem.app → @zeynep_kaya"
echo "  ... (15 hesap)"
