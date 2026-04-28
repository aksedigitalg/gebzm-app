package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"gebzem-api/config"
)

// ─────────────────────────────────────────────────────────────────────────────
// Sosyal bildirim sistemi: aggregation (batch) + WebSocket push
//
// Akış:
//   1. SocialNotify(...) çağrılır (ör. like, comment, follow)
//   2. aggregation_key = "<userID>:<type>:<targetID>" (ya da boş, batch'siz)
//   3. Eğer 60dk içinde aynı key'le bildirim varsa → actors append + count++
//   4. Yoksa yeni satır INSERT
//   5. Sonuç: hub.PushToUser(userID, "notif", payload)
//
// 10 trigger:
//   social_follow, social_follow_request, social_follow_accepted,
//   social_like, social_comment, social_repost, social_reply,
//   social_mention, social_dm, social_story_reply
// ─────────────────────────────────────────────────────────────────────────────

const aggregationWindow = 60 * time.Minute

type socialActor struct {
	UserID      string `json:"user_id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url,omitempty"`
}

// loadActor — username + display_name + avatar
func loadActor(userID string) *socialActor {
	var a socialActor
	a.UserID = userID
	var av sql.NullString
	err := config.DB.QueryRow(`
		SELECT username, display_name, avatar_url
		FROM social_profiles WHERE user_id = $1
	`, userID).Scan(&a.Username, &a.DisplayName, &av)
	if err != nil {
		// Fallback users.name
		_ = config.DB.QueryRow(`SELECT name FROM users WHERE id = $1`, userID).Scan(&a.DisplayName)
		a.Username = "kullanici"
	}
	a.AvatarURL = av.String
	return &a
}

// formatBatchTitle — "Ahmet ve 3 kişi gönderini beğendi" formatı
func formatBatchTitle(actors []socialActor, count int, kind string) string {
	if len(actors) == 0 || count == 0 {
		return ""
	}
	first := actors[len(actors)-1] // En son ekleyen actor
	name := first.DisplayName
	if name == "" {
		name = "@" + first.Username
	}
	verb := ""
	switch kind {
	case "social_like":
		verb = "gönderini beğendi"
	case "social_comment":
		verb = "gönderine yorum yaptı"
	case "social_repost":
		verb = "gönderini paylaştı"
	case "social_dm":
		verb = "sana mesaj gönderdi"
	default:
		verb = "etkileşimde bulundu"
	}
	if count == 1 {
		return name + " " + verb
	}
	return fmt.Sprintf("%s ve %d kişi %s", name, count-1, verb)
}

// SocialNotifyOpts — bildirim parametreleri
type SocialNotifyOpts struct {
	UserID         string // alıcı (kim bildirim alacak)
	ActorID        string // tetikleyen (kim aksiyonu yaptı) — userID
	Type           string // "social_like" vb.
	TargetID       string // post_id, story_id, follow için actor_id
	TargetURL      string // tıklanınca gidilecek path
	Body           string // ön-izleme metni (ör. yorum içeriği)
	Aggregate      bool   // batch'lenecek mi
	BypassSelfPing bool   // actor==user ise yine de bildir mi (false: bildirme)
}

// SocialNotify — ana giriş noktası. Batch'leme + WS push.
func SocialNotify(opts SocialNotifyOpts) {
	// Sanity
	if opts.UserID == "" || opts.Type == "" {
		return
	}
	// Self-ping engelle
	if !opts.BypassSelfPing && opts.ActorID == opts.UserID {
		return
	}
	// Alıcı banlı mı
	var banned bool
	_ = config.DB.QueryRow(`SELECT COALESCE(is_banned, false) FROM social_profiles WHERE user_id = $1`, opts.UserID).Scan(&banned)
	if banned {
		return
	}

	actor := loadActor(opts.ActorID)

	// Aggregation key (batch için)
	aggKey := ""
	if opts.Aggregate {
		aggKey = opts.Type + ":" + opts.TargetID
	}

	// Body kısaltma
	body := opts.Body
	if len(body) > 200 {
		body = body[:200]
	}

	notifID := ""
	updated := false

	if aggKey != "" {
		// Mevcut aktif (60dk içinde) bildirim var mı?
		var existingID string
		var existingActorsRaw []byte
		err := config.DB.QueryRow(`
			SELECT id::text, actors
			FROM notifications
			WHERE user_id = $1
			  AND aggregation_key = $2
			  AND created_at > NOW() - INTERVAL '60 minutes'
			ORDER BY created_at DESC LIMIT 1
		`, opts.UserID, aggKey).Scan(&existingID, &existingActorsRaw)

		if err == nil && existingID != "" {
			// Append actor (eğer aynı actor değilse)
			var actors []socialActor
			_ = json.Unmarshal(existingActorsRaw, &actors)
			alreadyIn := false
			for _, a := range actors {
				if a.UserID == actor.UserID {
					alreadyIn = true
					break
				}
			}
			if !alreadyIn {
				actors = append(actors, *actor)
			}
			actorsJSON, _ := json.Marshal(actors)
			title := formatBatchTitle(actors, len(actors), opts.Type)

			_, err = config.DB.Exec(`
				UPDATE notifications
				SET actors = $1, count = $2, title = $3, body = NULLIF($4,''),
				    is_read = false, updated_at = NOW()
				WHERE id = $5
			`, actorsJSON, len(actors), title, body, existingID)
			if err != nil {
				log.Printf("SocialNotify update: %v", err)
				return
			}
			notifID = existingID
			updated = true
		}
	}

	if !updated {
		actors := []socialActor{*actor}
		actorsJSON, _ := json.Marshal(actors)
		title := formatBatchTitle(actors, 1, opts.Type)

		var aggKeyVal interface{}
		if aggKey != "" {
			aggKeyVal = aggKey
		}
		err := config.DB.QueryRow(`
			INSERT INTO notifications
			  (user_id, business_id, admin, type, title, body, is_read, actors, count, aggregation_key, target_url, created_at, updated_at)
			VALUES ($1, NULL, false, $2, $3, NULLIF($4,''), false, $5, 1, $6, NULLIF($7,''), NOW(), NOW())
			RETURNING id::text
		`, opts.UserID, opts.Type, title, body, actorsJSON, aggKeyVal, opts.TargetURL).Scan(&notifID)
		if err != nil {
			log.Printf("SocialNotify insert: %v", err)
			return
		}
	}

	// WebSocket push
	hub.PushToUser(opts.UserID, "notif", map[string]interface{}{
		"type":         "notification",
		"id":           notifID,
		"notif_type":   opts.Type,
		"title":        formatBatchTitle([]socialActor{*actor}, 1, opts.Type),
		"body":         body,
		"target_url":   opts.TargetURL,
		"actor":        actor,
		"target_id":    opts.TargetID,
		"created_at":   time.Now().UTC().Format(time.RFC3339),
		"unread_delta": 1,
	})
}

// extractMentions — @username regex match (3-30 ASCII)
func extractMentions(text string) []string {
	if text == "" {
		return nil
	}
	matches := mentionRe.FindAllStringSubmatch(text, -1)
	seen := map[string]bool{}
	out := []string{}
	for _, m := range matches {
		u := strings.ToLower(m[1])
		if !seen[u] {
			seen[u] = true
			out = append(out, u)
		}
	}
	return out
}

// notifyMentions — text içinde @username geçen kullanıcıları bildirim gönder
func notifyMentions(text, actorID, postID, postURL string) {
	usernames := extractMentions(text)
	if len(usernames) == 0 {
		return
	}
	// Username → user_id lookup
	for _, un := range usernames {
		var targetID string
		err := config.DB.QueryRow(`SELECT user_id::text FROM social_profiles WHERE LOWER(username) = $1 AND is_banned = false`, un).Scan(&targetID)
		if err != nil {
			continue
		}
		if targetID == actorID {
			continue
		}
		body := text
		if len(body) > 100 {
			body = body[:100] + "..."
		}
		SocialNotify(SocialNotifyOpts{
			UserID:    targetID,
			ActorID:   actorID,
			Type:      "social_mention",
			TargetID:  postID,
			TargetURL: postURL,
			Body:      body,
			Aggregate: false,
		})
	}
}

// PushPostUpdate — like/comment count değişiminde post:<id> kanalına push
func PushPostUpdate(postID string, payload map[string]interface{}) {
	payload["type"] = "post_update"
	payload["post_id"] = postID
	hub.PushToChannel("post:"+postID, payload, "")
}

// PushFeedNewPost — takipçilere "yeni post var" sinyali (badge için)
func PushFeedNewPost(authorID, postID string) {
	rows, err := config.DB.Query(`
		SELECT follower_id::text FROM social_follows
		WHERE followed_id = $1 AND status = 'accepted'
		LIMIT 1000
	`, authorID)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var followerID string
		if err := rows.Scan(&followerID); err == nil {
			hub.PushToUser(followerID, "feed", map[string]interface{}{
				"type":      "new_post",
				"post_id":   postID,
				"author_id": authorID,
			})
		}
	}
}

// PushDM — DM mesajı geldiğinde alıcıya push
func PushDM(targetUserID string, payload map[string]interface{}) {
	payload["type"] = "dm_message"
	hub.PushToUser(targetUserID, "dm", payload)
}

// PushStoryView — kendi story'ne biri baktığında sahibine push
func PushStoryView(authorID string, payload map[string]interface{}) {
	payload["type"] = "story_view"
	hub.PushToUser(authorID, "story", payload)
}

// PushStoryCreated — yeni story atıldığında author'a + tüm takipçilerine push.
// Tray bileşeni story:<userId> kanalını dinliyor; bu sinyal gelince load() tetikler.
func PushStoryCreated(authorID, storyID string) {
	payload := map[string]interface{}{
		"type":      "story_created",
		"story_id":  storyID,
		"author_id": authorID,
	}
	// Author kendi tray'ini güncellesin (kendi story'sini görsün)
	hub.PushToUser(authorID, "story", payload)

	// Takipçilere de push (accepted)
	rows, err := config.DB.Query(`
		SELECT follower_id::text FROM social_follows
		WHERE followed_id = $1 AND status = 'accepted'
		LIMIT 5000
	`, authorID)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var followerID string
		if err := rows.Scan(&followerID); err == nil {
			hub.PushToUser(followerID, "story", payload)
		}
	}
}
