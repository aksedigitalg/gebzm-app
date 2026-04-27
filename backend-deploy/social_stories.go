package handlers

import (
	"database/sql"
	"log"
	"regexp"
	"strings"
	"time"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

var hexColorRe = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// ─────────────────────────────────────────────────────────────────────────────
// Stories — 24 saat ephemeral içerik (Instagram/Snapchat tarzı)
//
// Endpoint:
//   GET    /social/stories                       Takip edilenlerin aktif story'leri (gruplu)
//   POST   /social/stories                       Yeni story (24h auto-expire)
//   GET    /social/stories/:id                   Detay (view track)
//   DELETE /social/stories/:id                   Sahibi siler
//   GET    /social/stories/:id/viewers           Kim izledi (sadece sahibi)
//   POST   /social/stories/:id/reply             DM olarak gönder
//   GET    /social/profile/:username/stories     Kullanıcının aktif story'leri
//
// Güvenlik:
//   - Auth zorunlu (her endpoint user_id Locals'da)
//   - Sahip kontrolü (DELETE/viewers)
//   - Private profil: takipçi olmayan göremez
//   - Banlı author → görünmez
//   - View dedup: PRIMARY KEY(story_id, viewer_id)
//   - URL validation: media_url http(s):// olmalı
//   - Rate limit (story create): 10 story/saat (route'da)
// ─────────────────────────────────────────────────────────────────────────────

type SocialStory struct {
	ID              string         `json:"id"`
	AuthorID        string         `json:"author_id"`
	Author          *SocialProfile `json:"author,omitempty"`
	MediaURL        string         `json:"media_url"`
	MediaType       string         `json:"media_type"`
	ThumbnailURL    string         `json:"thumbnail_url,omitempty"`
	Caption         string         `json:"caption,omitempty"`
	BackgroundColor string         `json:"background_color,omitempty"`
	DurationSec     int            `json:"duration_sec"`
	ViewsCount      int            `json:"views_count"`
	CreatedAt       string         `json:"created_at"`
	ExpiresAt       string         `json:"expires_at"`
	HasViewed       bool           `json:"has_viewed,omitempty"`
}

// validateMediaURL — XSS / open-redirect kontrolü için
func validateMediaURL(u string) bool {
	if u == "" {
		return false
	}
	if len(u) > 2000 {
		return false
	}
	lower := strings.ToLower(u)
	return strings.HasPrefix(lower, "https://") || strings.HasPrefix(lower, "http://")
}

// POST /social/stories — yeni story
func CreateStory(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)

	var profileExists bool
	_ = config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM social_profiles WHERE user_id = $1 AND is_banned = false)`, uid).Scan(&profileExists)
	if !profileExists {
		return c.Status(403).JSON(fiber.Map{"error": "Önce sosyal profil oluştur"})
	}

	var body struct {
		MediaURL        string `json:"media_url"`
		MediaType       string `json:"media_type"`
		ThumbnailURL    string `json:"thumbnail_url"`
		Caption         string `json:"caption"`
		BackgroundColor string `json:"background_color"`
		DurationSec     int    `json:"duration_sec"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	if !validateMediaURL(body.MediaURL) {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz medya URL"})
	}
	if body.MediaType != "image" && body.MediaType != "video" {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz medya tipi"})
	}
	if body.ThumbnailURL != "" && !validateMediaURL(body.ThumbnailURL) {
		body.ThumbnailURL = ""
	}
	body.Caption = strings.TrimSpace(body.Caption)
	if len(body.Caption) > 200 {
		body.Caption = body.Caption[:200]
	}
	if body.BackgroundColor != "" {
		// #RRGGBB regex check
		if !hexColorRe.MatchString(body.BackgroundColor) {
			body.BackgroundColor = ""
		}
	}
	dur := body.DurationSec
	if dur < 1 || dur > 30 {
		if body.MediaType == "video" {
			dur = 15
		} else {
			dur = 5
		}
	}

	var storyID string
	var thumb, cap, bg interface{}
	if body.ThumbnailURL != "" {
		thumb = body.ThumbnailURL
	}
	if body.Caption != "" {
		cap = body.Caption
	}
	if body.BackgroundColor != "" {
		bg = body.BackgroundColor
	}
	err := config.DB.QueryRow(`
		INSERT INTO social_stories
		  (author_id, media_url, media_type, thumbnail_url, caption, background_color, duration_sec)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id::text
	`, uid, body.MediaURL, body.MediaType, thumb, cap, bg, dur).Scan(&storyID)
	if err != nil {
		log.Printf("CreateStory: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Story oluşturulamadı"})
	}

	return c.Status(201).JSON(fiber.Map{
		"id":         storyID,
		"expires_at": time.Now().Add(24 * time.Hour).UTC().Format(time.RFC3339),
	})
}

// GET /social/stories — takip ettiklerinin aktif story'leri (author'a göre gruplu)
func GetActiveStories(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)

	// Author bazında gruplu (her author'ın stories listesi)
	rows, err := config.DB.Query(`
		SELECT s.id::text, s.author_id::text, s.media_url, s.media_type,
		       s.thumbnail_url, s.caption, s.background_color, s.duration_sec, s.views_count,
		       to_char(s.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(s.expires_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       sp.username, sp.display_name, sp.avatar_url, sp.is_verified,
		       EXISTS(SELECT 1 FROM social_story_views v WHERE v.story_id = s.id AND v.viewer_id = $1) AS viewed
		FROM social_stories s
		JOIN social_profiles sp ON sp.user_id = s.author_id
		WHERE s.is_deleted = false AND s.expires_at > NOW()
		  AND sp.is_banned = false
		  AND (
		    s.author_id = $1
		    OR s.author_id IN (
		      SELECT followed_id FROM social_follows
		      WHERE follower_id = $1 AND status = 'accepted'
		    )
		  )
		ORDER BY s.author_id, s.created_at ASC
		LIMIT 500
	`, uid)
	if err != nil {
		log.Printf("GetActiveStories: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()

	type group struct {
		AuthorID    string         `json:"author_id"`
		Username    string         `json:"username"`
		DisplayName string         `json:"display_name"`
		AvatarURL   string         `json:"avatar_url,omitempty"`
		IsVerified  bool           `json:"is_verified"`
		Stories     []*SocialStory `json:"stories"`
		AllSeen     bool           `json:"all_seen"`
	}
	groups := []*group{}
	groupMap := map[string]*group{}

	for rows.Next() {
		var s SocialStory
		var thumb, cap, bg, av sql.NullString
		var un, dn string
		var verified, viewed bool
		err := rows.Scan(
			&s.ID, &s.AuthorID, &s.MediaURL, &s.MediaType,
			&thumb, &cap, &bg, &s.DurationSec, &s.ViewsCount,
			&s.CreatedAt, &s.ExpiresAt,
			&un, &dn, &av, &verified, &viewed,
		)
		if err != nil {
			continue
		}
		s.ThumbnailURL = thumb.String
		s.Caption = cap.String
		s.BackgroundColor = bg.String
		s.HasViewed = viewed

		g, ok := groupMap[s.AuthorID]
		if !ok {
			g = &group{
				AuthorID: s.AuthorID, Username: un, DisplayName: dn,
				AvatarURL: av.String, IsVerified: verified,
				Stories: []*SocialStory{}, AllSeen: true,
			}
			groupMap[s.AuthorID] = g
			groups = append(groups, g)
		}
		if !viewed {
			g.AllSeen = false
		}
		g.Stories = append(g.Stories, &s)
	}

	// Kendi story'mizi en başa al
	for i, g := range groups {
		if g.AuthorID == uid {
			if i > 0 {
				groups = append([]*group{g}, append(groups[:i], groups[i+1:]...)...)
			}
			break
		}
	}

	return c.JSON(groups)
}

// GET /social/stories/:id — tek story (view track)
func GetStory(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")

	row := config.DB.QueryRow(`
		SELECT s.id::text, s.author_id::text, s.media_url, s.media_type,
		       s.thumbnail_url, s.caption, s.background_color, s.duration_sec, s.views_count,
		       to_char(s.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(s.expires_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM social_stories s
		WHERE s.id = $1 AND s.is_deleted = false AND s.expires_at > NOW()
	`, id)

	var s SocialStory
	var thumb, cap, bg sql.NullString
	if err := row.Scan(
		&s.ID, &s.AuthorID, &s.MediaURL, &s.MediaType,
		&thumb, &cap, &bg, &s.DurationSec, &s.ViewsCount,
		&s.CreatedAt, &s.ExpiresAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Story bulunamadı veya süresi doldu"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	s.ThumbnailURL = thumb.String
	s.Caption = cap.String
	s.BackgroundColor = bg.String

	// Private profil kontrolü
	if s.AuthorID != uid {
		var isPrivate, banned bool
		_ = config.DB.QueryRow(`SELECT is_private, is_banned FROM social_profiles WHERE user_id = $1`, s.AuthorID).Scan(&isPrivate, &banned)
		if banned {
			return c.Status(404).JSON(fiber.Map{"error": "Story bulunamadı"})
		}
		if isPrivate {
			var status string
			_ = config.DB.QueryRow(`SELECT status FROM social_follows WHERE follower_id = $1 AND followed_id = $2`, uid, s.AuthorID).Scan(&status)
			if status != "accepted" {
				return c.Status(403).JSON(fiber.Map{"error": "Bu profil gizli"})
			}
		}
	}

	// View track (sahibi hariç)
	if s.AuthorID != uid {
		res, err := config.DB.Exec(`
			INSERT INTO social_story_views (story_id, viewer_id) VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, id, uid)
		if err == nil {
			if rows, _ := res.RowsAffected(); rows > 0 {
				_, _ = config.DB.Exec(`UPDATE social_stories SET views_count = views_count + 1 WHERE id = $1`, id)
				s.ViewsCount++
				// WS push to author
				go PushStoryView(s.AuthorID, map[string]interface{}{
					"story_id":  s.ID,
					"viewer":    loadActor(uid),
				})
			}
		}
		s.HasViewed = true
	}

	// Author hidrate
	authorRow := config.DB.QueryRow(`SELECT `+profileSelectCols+` FROM social_profiles WHERE user_id = $1`, s.AuthorID)
	var p SocialProfile
	if err := scanProfile(authorRow, &p); err == nil {
		s.Author = &p
	}

	return c.JSON(s)
}

// DELETE /social/stories/:id — sahibi siler
func DeleteStory(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")
	res, err := config.DB.Exec(`UPDATE social_stories SET is_deleted = true WHERE id = $1 AND author_id = $2 AND is_deleted = false`, id, uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	if rows, _ := res.RowsAffected(); rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Story bulunamadı"})
	}
	return c.JSON(fiber.Map{"ok": true})
}

// GET /social/stories/:id/viewers — kim izledi (sadece sahibi)
func GetStoryViewers(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")

	var authorID string
	if err := config.DB.QueryRow(`SELECT author_id::text FROM social_stories WHERE id = $1`, id).Scan(&authorID); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Story bulunamadı"})
	}
	if authorID != uid {
		return c.Status(403).JSON(fiber.Map{"error": "Yetkin yok"})
	}

	rows, err := config.DB.Query(`
		SELECT v.viewer_id::text, sp.username, sp.display_name, sp.avatar_url, sp.is_verified,
		       to_char(v.viewed_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM social_story_views v
		LEFT JOIN social_profiles sp ON sp.user_id = v.viewer_id
		WHERE v.story_id = $1
		ORDER BY v.viewed_at DESC
		LIMIT 500
	`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()

	out := []map[string]interface{}{}
	for rows.Next() {
		var vid, ts string
		var un, dn sql.NullString
		var av sql.NullString
		var verified sql.NullBool
		if err := rows.Scan(&vid, &un, &dn, &av, &verified, &ts); err == nil {
			out = append(out, map[string]interface{}{
				"user_id": vid, "username": un.String, "display_name": dn.String,
				"avatar_url": av.String, "is_verified": verified.Bool,
				"viewed_at": ts,
			})
		}
	}
	return c.JSON(out)
}

// POST /social/stories/:id/reply — DM olarak gönder
func ReplyToStory(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")

	var body struct {
		Text string `json:"text"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	body.Text = strings.TrimSpace(body.Text)
	if body.Text == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Metin gerekli"})
	}
	if len(body.Text) > 1000 {
		body.Text = body.Text[:1000]
	}

	var authorID, mediaURL string
	err := config.DB.QueryRow(`
		SELECT author_id::text, media_url
		FROM social_stories
		WHERE id = $1 AND is_deleted = false AND expires_at > NOW()
	`, id).Scan(&authorID, &mediaURL)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Story bulunamadı"})
	}
	if authorID == uid {
		return c.Status(400).JSON(fiber.Map{"error": "Kendi story'ne cevap yazamazsın"})
	}

	if !canMessage(uid, authorID) {
		return c.Status(403).JSON(fiber.Map{"error": "Bu kullanıcıya mesaj gönderemezsin"})
	}

	// Story referansı ile DM gönder (mesaj formatı: "📖 Story'ne cevap: {text}")
	messageText := "📖 " + body.Text

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "DB hatası"})
	}
	defer tx.Rollback()

	u1, u2 := canonicalPair(uid, authorID)

	var convID string
	err = tx.QueryRow(`
		INSERT INTO social_dm_conversations (user1_id, user2_id)
		VALUES ($1, $2)
		ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = EXCLUDED.user1_id
		RETURNING id::text
	`, u1, u2).Scan(&convID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Konuşma açılamadı"})
	}

	var msgID string
	err = tx.QueryRow(`
		INSERT INTO social_dm_messages (conversation_id, sender_id, text, media_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text
	`, convID, uid, messageText, mediaURL).Scan(&msgID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Mesaj gönderilemedi"})
	}

	preview := messageText
	if len(preview) > 200 {
		preview = preview[:200]
	}
	unreadCol := "user2_unread"
	if u2 == uid {
		unreadCol = "user1_unread"
	}
	_, _ = tx.Exec(`
		UPDATE social_dm_conversations
		SET last_message = $1, last_message_at = NOW(), last_sender_id = $2,
		    `+unreadCol+` = `+unreadCol+` + 1
		WHERE id = $3
	`, preview, uid, convID)

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// Bildirim + WS
	go func() {
		SocialNotify(SocialNotifyOpts{
			UserID:    authorID,
			ActorID:   uid,
			Type:      "social_story_reply",
			TargetID:  id,
			TargetURL: "/sosyal/mesajlar/" + convID,
			Body:      body.Text,
			Aggregate: false,
		})
		PushDM(authorID, map[string]interface{}{
			"id":              msgID,
			"conversation_id": convID,
			"sender_id":       uid,
			"text":            messageText,
			"media_url":       mediaURL,
			"created_at":      time.Now().UTC().Format(time.RFC3339),
		})
	}()

	return c.Status(201).JSON(fiber.Map{"id": msgID, "conversation_id": convID})
}

// GET /social/profile/:username/stories — kullanıcının aktif story'leri
func GetUserStories(c *fiber.Ctx) error {
	username := c.Params("username")
	uid, _ := c.Locals("user_id").(string)

	var targetID string
	var isPrivate bool
	err := config.DB.QueryRow(`SELECT user_id::text, is_private FROM social_profiles WHERE LOWER(username) = LOWER($1) AND is_banned = false`, username).Scan(&targetID, &isPrivate)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}

	if isPrivate && targetID != uid {
		var status string
		_ = config.DB.QueryRow(`SELECT status FROM social_follows WHERE follower_id = $1 AND followed_id = $2`, uid, targetID).Scan(&status)
		if status != "accepted" {
			return c.Status(403).JSON(fiber.Map{"error": "Bu profil gizli"})
		}
	}

	rows, err := config.DB.Query(`
		SELECT id::text, author_id::text, media_url, media_type,
		       thumbnail_url, caption, background_color, duration_sec, views_count,
		       to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(expires_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM social_stories
		WHERE author_id = $1 AND is_deleted = false AND expires_at > NOW()
		ORDER BY created_at ASC
	`, targetID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()

	stories := []*SocialStory{}
	for rows.Next() {
		var s SocialStory
		var thumb, cap, bg sql.NullString
		if err := rows.Scan(
			&s.ID, &s.AuthorID, &s.MediaURL, &s.MediaType,
			&thumb, &cap, &bg, &s.DurationSec, &s.ViewsCount,
			&s.CreatedAt, &s.ExpiresAt,
		); err == nil {
			s.ThumbnailURL = thumb.String
			s.Caption = cap.String
			s.BackgroundColor = bg.String
			stories = append(stories, &s)
		}
	}
	return c.JSON(stories)
}

// CleanupExpiredStories — günlük cron, expire olanları soft delete
func CleanupExpiredStories() {
	res, err := config.DB.Exec(`UPDATE social_stories SET is_deleted = true WHERE expires_at <= NOW() AND is_deleted = false`)
	if err != nil {
		log.Printf("CleanupExpiredStories: %v", err)
		return
	}
	if rows, _ := res.RowsAffected(); rows > 0 {
		log.Printf("Cleanup: %d expired stories soft-deleted", rows)
	}
}

// StartStoryCleanupCron — main.go'dan çağrılacak (saatte bir)
func StartStoryCleanupCron() {
	go func() {
		t := time.NewTicker(1 * time.Hour)
		defer t.Stop()
		// İlk run: 1 dk sonra
		time.Sleep(1 * time.Minute)
		CleanupExpiredStories()
		for range t.C {
			CleanupExpiredStories()
		}
	}()
}
