package handlers

import (
	"database/sql"
	"log"
	"strings"
	"time"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

// ───────────────────────── DM (Direct Messages) ─────────────────────────

// canonicalPair — DB'de UNIQUE(user1<user2) için sıralama
func canonicalPair(a, b string) (string, string) {
	if a < b {
		return a, b
	}
	return b, a
}

// canMessage — A, B'yi mesajlayabilir mi?
//   - B private değilse OK
//   - B private ama A B'yi accepted takip ediyorsa OK (DM açabilir)
//   - Veya: B kendi engellemiş değilse her zaman OK (Twitter tarzı)
// Şimdilik basit: aynı sosyal platformda olmalı + B banlı olmamalı
func canMessage(senderID, targetID string) bool {
	if senderID == targetID {
		return false
	}
	var banned bool
	err := config.DB.QueryRow(`SELECT is_banned FROM social_profiles WHERE user_id = $1`, targetID).Scan(&banned)
	if err != nil || banned {
		return false
	}
	// Sender'ın da profili olmalı
	var senderHas bool
	err = config.DB.QueryRow(`SELECT NOT is_banned FROM social_profiles WHERE user_id = $1`, senderID).Scan(&senderHas)
	if err != nil || !senderHas {
		return false
	}
	return true
}

// GET /social/dm — kullanıcının konuşmaları
func GetDMConversations(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	rows, err := config.DB.Query(`
		SELECT
		  c.id::text,
		  CASE WHEN c.user1_id = $1 THEN c.user2_id::text ELSE c.user1_id::text END AS other_id,
		  sp.username, sp.display_name, sp.avatar_url,
		  c.last_message,
		  to_char(c.last_message_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		  CASE WHEN c.user1_id = $1 THEN c.user1_unread ELSE c.user2_unread END AS unread,
		  c.last_sender_id::text
		FROM social_dm_conversations c
		JOIN social_profiles sp ON sp.user_id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
		WHERE (c.user1_id = $1 OR c.user2_id = $1) AND sp.is_banned = false
		ORDER BY c.last_message_at DESC NULLS LAST
		LIMIT 100
	`, uid)
	if err != nil {
		log.Printf("GetDMConversations: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, otherID, un, dn string
		var av, lastMsg, lastTs, lastSender sql.NullString
		var unread int
		if err := rows.Scan(&id, &otherID, &un, &dn, &av, &lastMsg, &lastTs, &unread, &lastSender); err == nil {
			out = append(out, map[string]interface{}{
				"id":              id,
				"other_user_id":   otherID,
				"username":        un,
				"display_name":    dn,
				"avatar_url":      av.String,
				"last_message":    lastMsg.String,
				"last_message_at": lastTs.String,
				"unread":          unread,
				"last_sender_id":  lastSender.String,
			})
		}
	}
	return c.JSON(out)
}

// GET /social/dm/:conversationId/messages
func GetDMMessages(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	cid := c.Params("conversationId")

	// Yetki: kullanıcı bu konuşmanın katılımcısı mı?
	var u1, u2 string
	if err := config.DB.QueryRow(`SELECT user1_id::text, user2_id::text FROM social_dm_conversations WHERE id = $1`, cid).Scan(&u1, &u2); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Konuşma bulunamadı"})
	}
	if u1 != uid && u2 != uid {
		return c.Status(403).JSON(fiber.Map{"error": "Yetkin yok"})
	}

	rows, err := config.DB.Query(`
		SELECT id::text, sender_id::text, text, media_url, is_read,
		       to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM social_dm_messages
		WHERE conversation_id = $1
		ORDER BY created_at ASC LIMIT 500
	`, cid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, senderID, ts string
		var text, media sql.NullString
		var read bool
		if err := rows.Scan(&id, &senderID, &text, &media, &read, &ts); err == nil {
			out = append(out, map[string]interface{}{
				"id":         id,
				"sender_id":  senderID,
				"text":       text.String,
				"media_url":  media.String,
				"is_read":    read,
				"created_at": ts,
			})
		}
	}

	// Okundu işaretle
	col := "user2_unread"
	if u1 == uid {
		col = "user1_unread"
	}
	_, _ = config.DB.Exec(`UPDATE social_dm_conversations SET `+col+` = 0 WHERE id = $1`, cid)
	_, _ = config.DB.Exec(`UPDATE social_dm_messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2`, cid, uid)

	return c.JSON(out)
}

// POST /social/dm/:targetUserId — yeni mesaj (konuşma yoksa oluşturur)
func SendDM(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	targetID := c.Params("targetUserId")

	var body struct {
		Text     string `json:"text"`
		MediaURL string `json:"media_url"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	body.Text = strings.TrimSpace(body.Text)
	if len(body.Text) > 2000 {
		body.Text = body.Text[:2000]
	}
	if body.Text == "" && body.MediaURL == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Boş mesaj gönderemezsin"})
	}

	if !canMessage(uid, targetID) {
		return c.Status(403).JSON(fiber.Map{"error": "Bu kullanıcıya mesaj gönderemezsin"})
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "DB hatası"})
	}
	defer tx.Rollback()

	u1, u2 := canonicalPair(uid, targetID)

	// Konuşmayı bul/yarat
	var convID string
	err = tx.QueryRow(`
		INSERT INTO social_dm_conversations (user1_id, user2_id)
		VALUES ($1, $2)
		ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = EXCLUDED.user1_id
		RETURNING id::text
	`, u1, u2).Scan(&convID)
	if err != nil {
		log.Printf("SendDM upsert conv: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Konuşma oluşturulamadı"})
	}

	// Mesaj insert
	var msgID string
	err = tx.QueryRow(`
		INSERT INTO social_dm_messages (conversation_id, sender_id, text, media_url)
		VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''))
		RETURNING id::text
	`, convID, uid, body.Text, body.MediaURL).Scan(&msgID)
	if err != nil {
		log.Printf("SendDM insert msg: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Mesaj gönderilemedi"})
	}

	// Konuşmayı güncelle (last_message + unread)
	preview := body.Text
	if preview == "" {
		preview = "[Medya]"
	}
	if len(preview) > 200 {
		preview = preview[:200]
	}
	unreadCol := "user2_unread"
	if u2 == uid {
		unreadCol = "user1_unread"
	}
	_, err = tx.Exec(`
		UPDATE social_dm_conversations
		SET last_message = $1, last_message_at = NOW(), last_sender_id = $2,
		    `+unreadCol+` = `+unreadCol+` + 1
		WHERE id = $3
	`, preview, uid, convID)
	if err != nil {
		log.Printf("SendDM update conv: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// ── Bildirim + WebSocket push ──
	go func() {
		// 1) Bildirim sistemi (batch'lemeli — aynı thread'den 1 saatte 1 bildirim)
		SocialNotify(SocialNotifyOpts{
			UserID:    targetID,
			ActorID:   uid,
			Type:      "social_dm",
			TargetID:  convID,
			TargetURL: "/sosyal/mesajlar/" + convID,
			Body:      preview,
			Aggregate: true,
		})

		// 2) DM kanalına anlık push (alıcının açık DM thread'i otomatik update olur)
		PushDM(targetID, map[string]interface{}{
			"id":              msgID,
			"conversation_id": convID,
			"sender_id":       uid,
			"text":            body.Text,
			"media_url":       body.MediaURL,
			"is_read":         false,
			"created_at":      time.Now().UTC().Format(time.RFC3339),
		})

		// 3) Sender'ın diğer cihazlarına da yansıması için kendi DM kanalına push
		PushDM(uid, map[string]interface{}{
			"id":              msgID,
			"conversation_id": convID,
			"sender_id":       uid,
			"text":            body.Text,
			"media_url":       body.MediaURL,
			"is_read":         false,
			"created_at":      time.Now().UTC().Format(time.RFC3339),
			"echo":            true, // sender'ın kendi UI'ı bunu duplicate etmesin
		})
	}()

	return c.Status(201).JSON(fiber.Map{"id": msgID, "conversation_id": convID})
}
