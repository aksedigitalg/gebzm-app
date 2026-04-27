package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strings"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

// ───────────────────────── ORTAK YAPILAR ─────────────────────────

type SocialProfile struct {
	UserID         string  `json:"user_id"`
	Username       string  `json:"username"`
	DisplayName    string  `json:"display_name"`
	Bio            string  `json:"bio"`
	AvatarURL      string  `json:"avatar_url"`
	CoverURL       string  `json:"cover_url"`
	IsPrivate      bool    `json:"is_private"`
	IsVerified     bool    `json:"is_verified"`
	IsBanned       bool    `json:"is_banned"`
	PostsCount     int     `json:"posts_count"`
	FollowersCount int     `json:"followers_count"`
	FollowingCount int     `json:"following_count"`
	CreatedAt      string  `json:"created_at"`
	// Viewing user'a göre dinamik:
	IsFollowing    bool    `json:"is_following"`
	FollowPending  bool    `json:"follow_pending"`
	IsMe           bool    `json:"is_me"`
}

type SocialPost struct {
	ID            string                   `json:"id"`
	AuthorID      string                   `json:"author_id"`
	Author        *SocialProfile           `json:"author,omitempty"`
	Text          string                   `json:"text"`
	Media         []map[string]interface{} `json:"media"`
	ParentID      *string                  `json:"parent_id,omitempty"`
	RepostOfID    *string                  `json:"repost_of_id,omitempty"`
	RepostOf      *SocialPost              `json:"repost_of,omitempty"`
	QuoteText     string                   `json:"quote_text,omitempty"`
	LikesCount    int                      `json:"likes_count"`
	DislikesCount int                      `json:"dislikes_count"`
	CommentsCount int                      `json:"comments_count"`
	RepostsCount  int                      `json:"reposts_count"`
	ViewsCount    int                      `json:"views_count"`
	CreatedAt     string                   `json:"created_at"`
	// Viewing user'a göre dinamik:
	MyReaction  string `json:"my_reaction,omitempty"` // "like" | "dislike" | ""
	IsBookmarked bool  `json:"is_bookmarked"`
	IsReposted  bool   `json:"is_reposted"`
}

// Hashtag regex (yalnızca ASCII a-z 0-9 _, max 50)
var hashtagRe = regexp.MustCompile(`(?i)#([a-zA-Z0-9_]{1,50})`)
var mentionRe = regexp.MustCompile(`(?i)@([a-zA-Z0-9_]{3,30})`)
var usernameRe = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)

func extractHashtags(text string) []string {
	if text == "" {
		return nil
	}
	matches := hashtagRe.FindAllStringSubmatch(text, -1)
	seen := map[string]bool{}
	out := []string{}
	for _, m := range matches {
		t := strings.ToLower(m[1])
		if !seen[t] && len(t) <= 50 {
			seen[t] = true
			out = append(out, t)
		}
	}
	return out
}

// optionalUserID — auth zorunlu DEĞİL, varsa user_id locals'da
func optionalUserID(c *fiber.Ctx) string {
	if uid, ok := c.Locals("user_id").(string); ok {
		return uid
	}
	return ""
}

// loadProfileScan — common scanner
func scanProfile(row *sql.Row, p *SocialProfile) error {
	var bio, avatarURL, coverURL sql.NullString
	err := row.Scan(
		&p.UserID, &p.Username, &p.DisplayName,
		&bio, &avatarURL, &coverURL,
		&p.IsPrivate, &p.IsVerified, &p.IsBanned,
		&p.PostsCount, &p.FollowersCount, &p.FollowingCount,
		&p.CreatedAt,
	)
	if err != nil {
		return err
	}
	p.Bio = bio.String
	p.AvatarURL = avatarURL.String
	p.CoverURL = coverURL.String
	return nil
}

const profileSelectCols = `user_id::text, username, display_name,
       bio, avatar_url, cover_url,
       is_private, is_verified, is_banned,
       posts_count, followers_count, following_count,
       to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SSZ')`

// ───────────────────────── PROFİL ─────────────────────────

// GET /social/profile/me — varsa profili döner, yoksa 404 (onboarding gerek)
func GetMySocialProfile(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	row := config.DB.QueryRow(`SELECT `+profileSelectCols+` FROM social_profiles WHERE user_id = $1`, uid)
	var p SocialProfile
	if err := scanProfile(row, &p); err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Sosyal profil yok", "needs_onboarding": true})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Profil yüklenemedi"})
	}
	if p.IsBanned {
		return c.Status(403).JSON(fiber.Map{"error": "Hesabın askıya alındı"})
	}
	p.IsMe = true
	return c.JSON(p)
}

// POST /social/profile/me — onboarding (ilk setup)
func CreateMySocialProfile(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)

	// Token'daki user_id db'de hâlâ var mı? (DB reset sonrası eski token'lar için)
	var userExists bool
	_ = config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, uid).Scan(&userExists)
	if !userExists {
		return c.Status(401).JSON(fiber.Map{
			"error":         "Oturum geçersiz, lütfen yeniden giriş yap",
			"session_lost":  true,
		})
	}

	var body struct {
		Username    string `json:"username"`
		DisplayName string `json:"display_name"`
		Bio         string `json:"bio"`
		AvatarURL   string `json:"avatar_url"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	body.Username = strings.TrimSpace(body.Username)
	body.DisplayName = strings.TrimSpace(body.DisplayName)
	body.Bio = strings.TrimSpace(body.Bio)

	if !usernameRe.MatchString(body.Username) {
		return c.Status(400).JSON(fiber.Map{"error": "Kullanıcı adı 3-30 karakter, sadece a-z 0-9 _"})
	}
	if len(body.DisplayName) < 1 || len(body.DisplayName) > 50 {
		return c.Status(400).JSON(fiber.Map{"error": "Görünen ad 1-50 karakter olmalı"})
	}
	if len(body.Bio) > 280 {
		body.Bio = body.Bio[:280]
	}

	// Reserved username'ler (admin, gebzem, support vs.)
	reserved := map[string]bool{
		"admin": true, "gebzem": true, "gebzemapp": true, "support": true,
		"destek": true, "moderator": true, "mod": true, "system": true,
		"null": true, "undefined": true, "test": true,
	}
	if reserved[strings.ToLower(body.Username)] {
		return c.Status(400).JSON(fiber.Map{"error": "Bu kullanıcı adı kullanılamaz"})
	}

	// Bu user'in zaten profili var mı?
	var exists bool
	if err := config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM social_profiles WHERE user_id = $1)`, uid).Scan(&exists); err == nil && exists {
		return c.Status(409).JSON(fiber.Map{"error": "Sosyal profil zaten var"})
	}

	_, err := config.DB.Exec(`
		INSERT INTO social_profiles (user_id, username, display_name, bio, avatar_url)
		VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''))
	`, uid, body.Username, body.DisplayName, body.Bio, body.AvatarURL)
	if err != nil {
		log.Printf("CreateMySocialProfile error: %v", err)
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return c.Status(409).JSON(fiber.Map{"error": "Bu kullanıcı adı alınmış"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Profil oluşturulamadı"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Profil oluşturuldu", "username": body.Username})
}

// PUT /social/profile/me — güncelle
func UpdateMySocialProfile(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	var body struct {
		DisplayName *string `json:"display_name"`
		Bio         *string `json:"bio"`
		AvatarURL   *string `json:"avatar_url"`
		CoverURL    *string `json:"cover_url"`
		IsPrivate   *bool   `json:"is_private"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	if body.DisplayName != nil {
		s := strings.TrimSpace(*body.DisplayName)
		if len(s) < 1 || len(s) > 50 {
			return c.Status(400).JSON(fiber.Map{"error": "Görünen ad 1-50 karakter"})
		}
		body.DisplayName = &s
	}
	if body.Bio != nil {
		s := strings.TrimSpace(*body.Bio)
		if len(s) > 280 {
			s = s[:280]
		}
		body.Bio = &s
	}

	_, err := config.DB.Exec(`
		UPDATE social_profiles SET
		  display_name = COALESCE($1, display_name),
		  bio = COALESCE($2, bio),
		  avatar_url = COALESCE($3, avatar_url),
		  cover_url = COALESCE($4, cover_url),
		  is_private = COALESCE($5, is_private),
		  updated_at = NOW()
		WHERE user_id = $6
	`, body.DisplayName, body.Bio, body.AvatarURL, body.CoverURL, body.IsPrivate, uid)
	if err != nil {
		log.Printf("UpdateMySocialProfile error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	return c.JSON(fiber.Map{"message": "Güncellendi"})
}

// GET /social/profile/:username — başkasının profili
func GetSocialProfile(c *fiber.Ctx) error {
	username := c.Params("username")
	if !usernameRe.MatchString(username) {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz kullanıcı adı"})
	}

	row := config.DB.QueryRow(`SELECT `+profileSelectCols+` FROM social_profiles WHERE LOWER(username) = LOWER($1)`, username)
	var p SocialProfile
	if err := scanProfile(row, &p); err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	if p.IsBanned {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}

	// Viewer perspective
	viewerID := optionalUserID(c)
	if viewerID == p.UserID {
		p.IsMe = true
	} else if viewerID != "" {
		var status string
		err := config.DB.QueryRow(`SELECT status FROM social_follows WHERE follower_id = $1 AND followed_id = $2`, viewerID, p.UserID).Scan(&status)
		if err == nil {
			p.IsFollowing = status == "accepted"
			p.FollowPending = status == "pending"
		}
	}
	return c.JSON(p)
}

// ───────────────────────── POSTLAR ─────────────────────────

const postSelectCols = `p.id::text, p.author_id::text, p.text,
       p.media, p.parent_id::text, p.repost_of_id::text, p.quote_text,
       p.likes_count, p.dislikes_count, p.comments_count, p.reposts_count, p.views_count,
       to_char(p.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ')`

func scanPost(rows *sql.Rows, p *SocialPost) error {
	var text, parentID, repostOfID, quoteText sql.NullString
	var mediaRaw []byte
	if err := rows.Scan(
		&p.ID, &p.AuthorID, &text, &mediaRaw,
		&parentID, &repostOfID, &quoteText,
		&p.LikesCount, &p.DislikesCount, &p.CommentsCount, &p.RepostsCount, &p.ViewsCount,
		&p.CreatedAt,
	); err != nil {
		return err
	}
	p.Text = text.String
	if parentID.Valid {
		s := parentID.String
		p.ParentID = &s
	}
	if repostOfID.Valid {
		s := repostOfID.String
		p.RepostOfID = &s
	}
	p.QuoteText = quoteText.String
	if len(mediaRaw) > 0 {
		_ = json.Unmarshal(mediaRaw, &p.Media)
	}
	if p.Media == nil {
		p.Media = []map[string]interface{}{}
	}
	return nil
}

// Posta author profilini hidrate et + viewer reaction state'i
func hydratePosts(viewerID string, posts []*SocialPost) {
	if len(posts) == 0 {
		return
	}
	authorIDs := make([]string, 0, len(posts))
	postIDs := make([]string, 0, len(posts))
	authorMap := map[string]*SocialProfile{}
	for _, p := range posts {
		authorIDs = append(authorIDs, p.AuthorID)
		postIDs = append(postIDs, p.ID)
	}

	// Authors
	rows, err := config.DB.Query(`SELECT `+profileSelectCols+`
		FROM social_profiles WHERE user_id = ANY($1)`, "{"+strings.Join(authorIDs, ",")+"}")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var p SocialProfile
			var bio, avatarURL, coverURL sql.NullString
			if err := rows.Scan(
				&p.UserID, &p.Username, &p.DisplayName,
				&bio, &avatarURL, &coverURL,
				&p.IsPrivate, &p.IsVerified, &p.IsBanned,
				&p.PostsCount, &p.FollowersCount, &p.FollowingCount,
				&p.CreatedAt,
			); err == nil {
				p.Bio = bio.String
				p.AvatarURL = avatarURL.String
				p.CoverURL = coverURL.String
				authorMap[p.UserID] = &p
			}
		}
	}

	// Viewer reactions
	reactionMap := map[string]string{}
	bookmarkMap := map[string]bool{}
	if viewerID != "" {
		rrows, _ := config.DB.Query(`
			SELECT post_id::text, reaction FROM social_reactions
			WHERE user_id = $1 AND post_id = ANY($2)
		`, viewerID, "{"+strings.Join(postIDs, ",")+"}")
		if rrows != nil {
			defer rrows.Close()
			for rrows.Next() {
				var pid, r string
				if err := rrows.Scan(&pid, &r); err == nil {
					reactionMap[pid] = r
				}
			}
		}
		brows, _ := config.DB.Query(`
			SELECT post_id::text FROM social_bookmarks
			WHERE user_id = $1 AND post_id = ANY($2)
		`, viewerID, "{"+strings.Join(postIDs, ",")+"}")
		if brows != nil {
			defer brows.Close()
			for brows.Next() {
				var pid string
				if err := brows.Scan(&pid); err == nil {
					bookmarkMap[pid] = true
				}
			}
		}
	}

	for _, p := range posts {
		if a, ok := authorMap[p.AuthorID]; ok {
			a2 := *a
			p.Author = &a2
		}
		p.MyReaction = reactionMap[p.ID]
		p.IsBookmarked = bookmarkMap[p.ID]
	}
}

// POST /social/posts — yeni gönderi
func CreatePost(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)

	// Profile zorunlu
	var profileExists bool
	_ = config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM social_profiles WHERE user_id = $1 AND is_banned = false)`, uid).Scan(&profileExists)
	if !profileExists {
		return c.Status(403).JSON(fiber.Map{"error": "Önce sosyal profil oluştur"})
	}

	var body struct {
		Text       string                   `json:"text"`
		Media      []map[string]interface{} `json:"media"`
		ParentID   string                   `json:"parent_id"`
		RepostOfID string                   `json:"repost_of_id"`
		QuoteText  string                   `json:"quote_text"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	body.Text = strings.TrimSpace(body.Text)
	body.QuoteText = strings.TrimSpace(body.QuoteText)
	if len(body.Text) > 500 {
		body.Text = body.Text[:500]
	}
	if len(body.QuoteText) > 500 {
		body.QuoteText = body.QuoteText[:500]
	}

	// En az birisi olmalı: text, media, repost
	if body.Text == "" && len(body.Media) == 0 && body.RepostOfID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Boş gönderi yazılamaz"})
	}
	if len(body.Media) > 4 {
		return c.Status(400).JSON(fiber.Map{"error": "En fazla 4 medya"})
	}

	mediaJSON, _ := json.Marshal(body.Media)

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "DB hatası"})
	}
	defer tx.Rollback()

	var parentID, repostOfID interface{}
	if body.ParentID != "" {
		parentID = body.ParentID
	}
	if body.RepostOfID != "" {
		repostOfID = body.RepostOfID
	}

	var postID string
	err = tx.QueryRow(`
		INSERT INTO social_posts (author_id, text, media, parent_id, repost_of_id, quote_text)
		VALUES ($1, NULLIF($2,''), $3, $4, $5, NULLIF($6,''))
		RETURNING id::text
	`, uid, body.Text, mediaJSON, parentID, repostOfID, body.QuoteText).Scan(&postID)
	if err != nil {
		log.Printf("CreatePost insert: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Gönderi oluşturulamadı"})
	}

	// Counter increments
	if body.ParentID != "" {
		_, _ = tx.Exec(`UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = $1`, body.ParentID)
	}
	if body.RepostOfID != "" {
		_, _ = tx.Exec(`UPDATE social_posts SET reposts_count = reposts_count + 1 WHERE id = $1`, body.RepostOfID)
	}
	_, _ = tx.Exec(`UPDATE social_profiles SET posts_count = posts_count + 1 WHERE user_id = $1`, uid)

	// Hashtag extraction
	tags := extractHashtags(body.Text + " " + body.QuoteText)
	for _, tag := range tags {
		var tagID int
		err := tx.QueryRow(`
			INSERT INTO social_hashtags (tag, posts_count, last_used_at)
			VALUES ($1, 1, NOW())
			ON CONFLICT (tag) DO UPDATE SET posts_count = social_hashtags.posts_count + 1, last_used_at = NOW()
			RETURNING id
		`, tag).Scan(&tagID)
		if err == nil {
			_, _ = tx.Exec(`INSERT INTO social_post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, postID, tagID)
		}
	}

	if err := tx.Commit(); err != nil {
		log.Printf("CreatePost commit: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// ── Bildirimler + WS push (async) ──
	go func() {
		postURL := "/sosyal/post/" + postID

		// Reply: parent post sahibine yorum bildirimi
		if body.ParentID != "" {
			var parentAuthorID string
			_ = config.DB.QueryRow(`SELECT author_id::text FROM social_posts WHERE id = $1`, body.ParentID).Scan(&parentAuthorID)
			if parentAuthorID != "" && parentAuthorID != uid {
				preview := body.Text
				if len(preview) > 100 {
					preview = preview[:100] + "..."
				}
				SocialNotify(SocialNotifyOpts{
					UserID:    parentAuthorID,
					ActorID:   uid,
					Type:      "social_comment",
					TargetID:  body.ParentID,
					TargetURL: "/sosyal/post/" + body.ParentID,
					Body:      preview,
					Aggregate: true,
				})
			}
			// Live counter push to parent post detail
			PushPostUpdate(body.ParentID, map[string]interface{}{
				"comments_delta": 1,
			})
		}

		// Repost: orijinal post sahibine bildirim
		if body.RepostOfID != "" {
			var repostAuthorID string
			_ = config.DB.QueryRow(`SELECT author_id::text FROM social_posts WHERE id = $1`, body.RepostOfID).Scan(&repostAuthorID)
			if repostAuthorID != "" && repostAuthorID != uid {
				SocialNotify(SocialNotifyOpts{
					UserID:    repostAuthorID,
					ActorID:   uid,
					Type:      "social_repost",
					TargetID:  body.RepostOfID,
					TargetURL: "/sosyal/post/" + body.RepostOfID,
					Aggregate: true,
				})
			}
			PushPostUpdate(body.RepostOfID, map[string]interface{}{
				"reposts_delta": 1,
			})
		}

		// @mention'ları bildir
		notifyMentions(body.Text+" "+body.QuoteText, uid, postID, postURL)

		// Feed push: takipçilere yeni post sinyali (sadece top-level post)
		if body.ParentID == "" {
			PushFeedNewPost(uid, postID)
		}
	}()

	return c.Status(201).JSON(fiber.Map{"id": postID})
}

// GET /social/posts/:id — tek gönderi (yorumlar + viewer state)
func GetPost(c *fiber.Ctx) error {
	id := c.Params("id")
	viewerID := optionalUserID(c)

	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		WHERE p.id = $1 AND p.is_deleted = false AND p.is_hidden = false`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	if !rows.Next() {
		return c.Status(404).JSON(fiber.Map{"error": "Gönderi bulunamadı"})
	}
	var p SocialPost
	if err := scanPost(rows, &p); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	hydratePosts(viewerID, []*SocialPost{&p})
	return c.JSON(p)
}

// DELETE /social/posts/:id — sadece sahibi
func DeletePost(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")
	res, err := config.DB.Exec(`UPDATE social_posts SET is_deleted = true WHERE id = $1 AND author_id = $2`, id, uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	if rows, _ := res.RowsAffected(); rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Gönderi bulunamadı"})
	}
	// Author posts_count düşür
	_, _ = config.DB.Exec(`UPDATE social_profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE user_id = $1`, uid)
	return c.JSON(fiber.Map{"message": "Silindi"})
}

// GET /social/feed — takip edilenlerin postları + kullanıcının kendisi
func GetFeed(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)

	limit := c.QueryInt("limit", 30)
	if limit > 50 {
		limit = 50
	}
	offset := c.QueryInt("offset", 0)

	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		WHERE p.is_deleted = false AND p.is_hidden = false AND p.parent_id IS NULL
		  AND (p.author_id = $1
		    OR p.author_id IN (SELECT followed_id FROM social_follows WHERE follower_id = $1 AND status = 'accepted'))
		ORDER BY p.created_at DESC
		LIMIT $2 OFFSET $3
	`, uid, limit, offset)
	if err != nil {
		log.Printf("GetFeed: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(uid, posts)
	return c.JSON(posts)
}

// GET /social/explore — herkesten popüler postlar (son 7 gün, beğeniye göre)
func GetExplore(c *fiber.Ctx) error {
	viewerID := optionalUserID(c)
	limit := c.QueryInt("limit", 30)
	if limit > 50 {
		limit = 50
	}
	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		JOIN social_profiles sp ON sp.user_id = p.author_id
		WHERE p.is_deleted = false AND p.is_hidden = false AND p.parent_id IS NULL
		  AND sp.is_private = false AND sp.is_banned = false
		  AND p.created_at > NOW() - INTERVAL '7 days'
		ORDER BY (p.likes_count * 2 + p.reposts_count * 3 + p.comments_count + p.views_count / 10) DESC,
		         p.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		log.Printf("GetExplore: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(viewerID, posts)
	return c.JSON(posts)
}

// GET /social/profile/:username/posts — user'in postları (private kontrol)
func GetUserPosts(c *fiber.Ctx) error {
	username := c.Params("username")
	viewerID := optionalUserID(c)
	limit := c.QueryInt("limit", 30)
	if limit > 50 {
		limit = 50
	}
	offset := c.QueryInt("offset", 0)

	var targetID string
	var isPrivate bool
	err := config.DB.QueryRow(`SELECT user_id::text, is_private FROM social_profiles WHERE LOWER(username) = LOWER($1) AND is_banned = false`, username).Scan(&targetID, &isPrivate)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}

	if isPrivate && viewerID != targetID {
		var followStatus string
		_ = config.DB.QueryRow(`SELECT status FROM social_follows WHERE follower_id = $1 AND followed_id = $2`, viewerID, targetID).Scan(&followStatus)
		if followStatus != "accepted" {
			return c.Status(403).JSON(fiber.Map{"error": "Bu profil gizli", "is_private": true})
		}
	}

	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		WHERE p.author_id = $1 AND p.is_deleted = false AND p.is_hidden = false AND p.parent_id IS NULL
		ORDER BY p.created_at DESC
		LIMIT $2 OFFSET $3
	`, targetID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(viewerID, posts)
	return c.JSON(posts)
}

// GET /social/posts/:id/comments — yorumlar (parent_id = post)
func GetComments(c *fiber.Ctx) error {
	id := c.Params("id")
	viewerID := optionalUserID(c)
	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		WHERE p.parent_id = $1 AND p.is_deleted = false AND p.is_hidden = false
		ORDER BY p.created_at ASC LIMIT 100`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yorumlar yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(viewerID, posts)
	return c.JSON(posts)
}

// POST /social/posts/:id/view — view artır (dedup)
func TrackPostView(c *fiber.Ctx) error {
	id := c.Params("id")
	viewerKey := c.IP()
	if uid := optionalUserID(c); uid != "" {
		viewerKey = "u:" + uid
	}
	res, err := config.DB.Exec(`
		INSERT INTO social_post_views (post_id, viewer_key, viewed_date)
		VALUES ($1, $2, CURRENT_DATE)
		ON CONFLICT DO NOTHING
	`, id, viewerKey)
	if err == nil {
		if rows, _ := res.RowsAffected(); rows > 0 {
			_, _ = config.DB.Exec(`UPDATE social_posts SET views_count = views_count + 1 WHERE id = $1`, id)
		}
	}
	return c.JSON(fiber.Map{"ok": true})
}

// ───────────────────────── REAKSİYONLAR ─────────────────────────

// POST /social/posts/:id/react — { reaction: "like"|"dislike"|"" (kaldır) }
func ReactToPost(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")

	var body struct {
		Reaction string `json:"reaction"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if body.Reaction != "like" && body.Reaction != "dislike" && body.Reaction != "" {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz reaksiyon"})
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "DB hatası"})
	}
	defer tx.Rollback()

	// Mevcut reaksiyon var mı?
	var current string
	_ = tx.QueryRow(`SELECT reaction FROM social_reactions WHERE user_id = $1 AND post_id = $2`, uid, id).Scan(&current)

	// Önce kaldır
	if current != "" {
		_, _ = tx.Exec(`DELETE FROM social_reactions WHERE user_id = $1 AND post_id = $2`, uid, id)
		col := "likes_count"
		if current == "dislike" {
			col = "dislikes_count"
		}
		_, _ = tx.Exec(fmt.Sprintf(`UPDATE social_posts SET %s = GREATEST(%s - 1, 0) WHERE id = $1`, col, col), id)
	}

	// Yeni reaksiyonu ekle (boş değilse ve mevcuttan farklıysa)
	if body.Reaction != "" && body.Reaction != current {
		_, err := tx.Exec(`INSERT INTO social_reactions (user_id, post_id, reaction) VALUES ($1, $2, $3)`, uid, id, body.Reaction)
		if err != nil {
			log.Printf("ReactToPost insert: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Reaksiyon kaydedilemedi"})
		}
		col := "likes_count"
		if body.Reaction == "dislike" {
			col = "dislikes_count"
		}
		_, _ = tx.Exec(fmt.Sprintf(`UPDATE social_posts SET %s = %s + 1 WHERE id = $1`, col, col), id)
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// ── Bildirim + live counter (sadece "like" için bildir, "dislike" gösterilmez) ──
	go func() {
		// Live counter
		var likes, dislikes int
		_ = config.DB.QueryRow(`SELECT likes_count, dislikes_count FROM social_posts WHERE id = $1`, id).Scan(&likes, &dislikes)
		PushPostUpdate(id, map[string]interface{}{
			"likes_count":    likes,
			"dislikes_count": dislikes,
		})

		// Bildirim sadece "like" yeni eklendiyse
		if body.Reaction == "like" && current != "like" {
			var authorID string
			_ = config.DB.QueryRow(`SELECT author_id::text FROM social_posts WHERE id = $1`, id).Scan(&authorID)
			if authorID != "" && authorID != uid {
				SocialNotify(SocialNotifyOpts{
					UserID:    authorID,
					ActorID:   uid,
					Type:      "social_like",
					TargetID:  id,
					TargetURL: "/sosyal/post/" + id,
					Aggregate: true,
				})
			}
		}
	}()

	return c.JSON(fiber.Map{"ok": true, "reaction": body.Reaction})
}

// POST /social/posts/:id/bookmark — toggle
func ToggleBookmark(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	id := c.Params("id")
	res, err := config.DB.Exec(`DELETE FROM social_bookmarks WHERE user_id = $1 AND post_id = $2`, uid, id)
	if err == nil {
		if rows, _ := res.RowsAffected(); rows > 0 {
			return c.JSON(fiber.Map{"bookmarked": false})
		}
	}
	_, err = config.DB.Exec(`INSERT INTO social_bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, uid, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}
	return c.JSON(fiber.Map{"bookmarked": true})
}

// GET /social/bookmarks — kullanıcının kayıtları
func GetBookmarks(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	limit := c.QueryInt("limit", 30)
	if limit > 50 {
		limit = 50
	}
	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		JOIN social_bookmarks b ON b.post_id = p.id
		WHERE b.user_id = $1 AND p.is_deleted = false AND p.is_hidden = false
		ORDER BY b.created_at DESC LIMIT $2`, uid, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(uid, posts)
	return c.JSON(posts)
}

// ───────────────────────── TAKİP ─────────────────────────

// POST /social/profile/:username/follow — takip et / istek
func FollowUser(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	username := c.Params("username")

	var targetID string
	var isPrivate bool
	if err := config.DB.QueryRow(`SELECT user_id::text, is_private FROM social_profiles WHERE LOWER(username) = LOWER($1) AND is_banned = false`, username).Scan(&targetID, &isPrivate); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}
	if targetID == uid {
		return c.Status(400).JSON(fiber.Map{"error": "Kendini takip edemezsin"})
	}

	status := "accepted"
	if isPrivate {
		status = "pending"
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "DB hatası"})
	}
	defer tx.Rollback()

	res, err := tx.Exec(`
		INSERT INTO social_follows (follower_id, followed_id, status) VALUES ($1, $2, $3)
		ON CONFLICT (follower_id, followed_id) DO NOTHING
	`, uid, targetID, status)
	if err != nil {
		log.Printf("FollowUser: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Takip edilemedi"})
	}
	if rows, _ := res.RowsAffected(); rows == 0 {
		return c.JSON(fiber.Map{"status": "already_following"})
	}

	if status == "accepted" {
		_, _ = tx.Exec(`UPDATE social_profiles SET followers_count = followers_count + 1 WHERE user_id = $1`, targetID)
		_, _ = tx.Exec(`UPDATE social_profiles SET following_count = following_count + 1 WHERE user_id = $1`, uid)
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// ── Bildirim ──
	go func() {
		notifType := "social_follow"
		if status == "pending" {
			notifType = "social_follow_request"
		}
		var actorUsername string
		_ = config.DB.QueryRow(`SELECT username FROM social_profiles WHERE user_id = $1`, uid).Scan(&actorUsername)
		SocialNotify(SocialNotifyOpts{
			UserID:    targetID,
			ActorID:   uid,
			Type:      notifType,
			TargetID:  uid,
			TargetURL: "/sosyal/" + actorUsername,
			Aggregate: false,
		})
	}()

	return c.JSON(fiber.Map{"status": status})
}

// DELETE /social/profile/:username/follow — takipten çık
func UnfollowUser(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	username := c.Params("username")

	var targetID string
	if err := config.DB.QueryRow(`SELECT user_id::text FROM social_profiles WHERE LOWER(username) = LOWER($1)`, username).Scan(&targetID); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}

	tx, _ := config.DB.Begin()
	defer tx.Rollback()
	var prevStatus string
	_ = tx.QueryRow(`DELETE FROM social_follows WHERE follower_id = $1 AND followed_id = $2 RETURNING status`, uid, targetID).Scan(&prevStatus)
	if prevStatus == "accepted" {
		_, _ = tx.Exec(`UPDATE social_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = $1`, targetID)
		_, _ = tx.Exec(`UPDATE social_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = $1`, uid)
	}
	_ = tx.Commit()
	return c.JSON(fiber.Map{"ok": true})
}

// GET /social/follow/requests — bekleyen takip istekleri (private hesap)
func GetFollowRequests(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	rows, err := config.DB.Query(`
		SELECT sp.user_id::text, sp.username, sp.display_name, sp.avatar_url,
		       to_char(sf.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM social_follows sf
		JOIN social_profiles sp ON sp.user_id = sf.follower_id
		WHERE sf.followed_id = $1 AND sf.status = 'pending'
		ORDER BY sf.created_at DESC
	`, uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, un, dn, ts string
		var av sql.NullString
		if err := rows.Scan(&id, &un, &dn, &av, &ts); err == nil {
			out = append(out, map[string]interface{}{
				"user_id": id, "username": un, "display_name": dn,
				"avatar_url": av.String, "requested_at": ts,
			})
		}
	}
	return c.JSON(out)
}

// PUT /social/follow/requests/:followerId — kabul/reddet
func RespondFollowRequest(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	followerID := c.Params("followerId")
	var body struct {
		Action string `json:"action"` // "accept" | "reject"
	}
	if err := c.BodyParser(&body); err != nil || (body.Action != "accept" && body.Action != "reject") {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	tx, _ := config.DB.Begin()
	defer tx.Rollback()

	if body.Action == "accept" {
		res, _ := tx.Exec(`UPDATE social_follows SET status = 'accepted' WHERE follower_id = $1 AND followed_id = $2 AND status = 'pending'`, followerID, uid)
		if rows, _ := res.RowsAffected(); rows == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "İstek bulunamadı"})
		}
		_, _ = tx.Exec(`UPDATE social_profiles SET followers_count = followers_count + 1 WHERE user_id = $1`, uid)
		_, _ = tx.Exec(`UPDATE social_profiles SET following_count = following_count + 1 WHERE user_id = $1`, followerID)
	} else {
		res, _ := tx.Exec(`DELETE FROM social_follows WHERE follower_id = $1 AND followed_id = $2 AND status = 'pending'`, followerID, uid)
		if rows, _ := res.RowsAffected(); rows == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "İstek bulunamadı"})
		}
	}
	_ = tx.Commit()

	// Bildirim: kabul edilirse follower'a "isteğin kabul edildi"
	if body.Action == "accept" {
		go func() {
			var myUsername string
			_ = config.DB.QueryRow(`SELECT username FROM social_profiles WHERE user_id = $1`, uid).Scan(&myUsername)
			SocialNotify(SocialNotifyOpts{
				UserID:    followerID,
				ActorID:   uid,
				Type:      "social_follow_accepted",
				TargetID:  uid,
				TargetURL: "/sosyal/" + myUsername,
				Aggregate: false,
			})
		}()
	}

	return c.JSON(fiber.Map{"ok": true})
}

// GET /social/profile/:username/followers — takipçiler
func GetFollowers(c *fiber.Ctx) error {
	username := c.Params("username")
	var targetID string
	if err := config.DB.QueryRow(`SELECT user_id::text FROM social_profiles WHERE LOWER(username) = LOWER($1)`, username).Scan(&targetID); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}
	rows, err := config.DB.Query(`
		SELECT sp.user_id::text, sp.username, sp.display_name, sp.avatar_url, sp.is_verified
		FROM social_follows sf
		JOIN social_profiles sp ON sp.user_id = sf.follower_id
		WHERE sf.followed_id = $1 AND sf.status = 'accepted'
		ORDER BY sf.created_at DESC LIMIT 200
	`, targetID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, un, dn string
		var av sql.NullString
		var verified bool
		if err := rows.Scan(&id, &un, &dn, &av, &verified); err == nil {
			out = append(out, map[string]interface{}{
				"user_id": id, "username": un, "display_name": dn,
				"avatar_url": av.String, "is_verified": verified,
			})
		}
	}
	return c.JSON(out)
}

// GET /social/profile/:username/following — takip ettikleri
func GetFollowing(c *fiber.Ctx) error {
	username := c.Params("username")
	var targetID string
	if err := config.DB.QueryRow(`SELECT user_id::text FROM social_profiles WHERE LOWER(username) = LOWER($1)`, username).Scan(&targetID); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Kullanıcı bulunamadı"})
	}
	rows, err := config.DB.Query(`
		SELECT sp.user_id::text, sp.username, sp.display_name, sp.avatar_url, sp.is_verified
		FROM social_follows sf
		JOIN social_profiles sp ON sp.user_id = sf.followed_id
		WHERE sf.follower_id = $1 AND sf.status = 'accepted'
		ORDER BY sf.created_at DESC LIMIT 200
	`, targetID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, un, dn string
		var av sql.NullString
		var verified bool
		if err := rows.Scan(&id, &un, &dn, &av, &verified); err == nil {
			out = append(out, map[string]interface{}{
				"user_id": id, "username": un, "display_name": dn,
				"avatar_url": av.String, "is_verified": verified,
			})
		}
	}
	return c.JSON(out)
}

// ───────────────────────── HASHTAG + ARAMA ─────────────────────────

// GET /social/hashtags/trending
func GetTrendingHashtags(c *fiber.Ctx) error {
	rows, err := config.DB.Query(`
		SELECT tag, posts_count FROM social_hashtags
		WHERE last_used_at > NOW() - INTERVAL '7 days'
		ORDER BY posts_count DESC, last_used_at DESC LIMIT 20
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var tag string
		var count int
		if err := rows.Scan(&tag, &count); err == nil {
			out = append(out, map[string]interface{}{"tag": tag, "posts_count": count})
		}
	}
	return c.JSON(out)
}

// GET /social/hashtags/:tag/posts
func GetPostsByHashtag(c *fiber.Ctx) error {
	tag := strings.ToLower(c.Params("tag"))
	viewerID := optionalUserID(c)
	limit := c.QueryInt("limit", 30)
	if limit > 50 {
		limit = 50
	}
	rows, err := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		JOIN social_post_hashtags ph ON ph.post_id = p.id
		JOIN social_hashtags h ON h.id = ph.hashtag_id
		JOIN social_profiles sp ON sp.user_id = p.author_id
		WHERE h.tag = $1 AND p.is_deleted = false AND p.is_hidden = false
		  AND sp.is_private = false AND sp.is_banned = false
		ORDER BY p.created_at DESC LIMIT $2`, tag, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	posts := []*SocialPost{}
	for rows.Next() {
		var p SocialPost
		if err := scanPost(rows, &p); err == nil {
			posts = append(posts, &p)
		}
	}
	hydratePosts(viewerID, posts)
	return c.JSON(posts)
}

// GET /social/search?q=... — kullanıcı + post arama
func SocialSearch(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q", ""))
	if len(q) < 2 {
		return c.JSON(fiber.Map{"users": []interface{}{}, "posts": []interface{}{}})
	}
	if len(q) > 100 {
		q = q[:100]
	}
	pattern := "%" + strings.ToLower(q) + "%"

	// Users
	urows, _ := config.DB.Query(`
		SELECT user_id::text, username, display_name, avatar_url, is_verified
		FROM social_profiles
		WHERE (LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1) AND is_banned = false
		ORDER BY is_verified DESC, followers_count DESC LIMIT 10
	`, pattern)
	users := []map[string]interface{}{}
	if urows != nil {
		defer urows.Close()
		for urows.Next() {
			var id, un, dn string
			var av sql.NullString
			var verified bool
			if err := urows.Scan(&id, &un, &dn, &av, &verified); err == nil {
				users = append(users, map[string]interface{}{
					"user_id": id, "username": un, "display_name": dn,
					"avatar_url": av.String, "is_verified": verified,
				})
			}
		}
	}

	// Posts
	viewerID := optionalUserID(c)
	prows, _ := config.DB.Query(`SELECT `+postSelectCols+` FROM social_posts p
		JOIN social_profiles sp ON sp.user_id = p.author_id
		WHERE LOWER(p.text) LIKE $1 AND p.is_deleted = false AND p.is_hidden = false
		  AND sp.is_private = false AND sp.is_banned = false
		ORDER BY p.created_at DESC LIMIT 20`, pattern)
	posts := []*SocialPost{}
	if prows != nil {
		defer prows.Close()
		for prows.Next() {
			var p SocialPost
			if err := scanPost(prows, &p); err == nil {
				posts = append(posts, &p)
			}
		}
	}
	hydratePosts(viewerID, posts)

	return c.JSON(fiber.Map{"users": users, "posts": posts})
}

// ───────────────────────── ŞİKAYET ─────────────────────────

// POST /social/reports
func CreateReport(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(string)
	var body struct {
		TargetType  string `json:"target_type"`
		TargetID    string `json:"target_id"`
		Reason      string `json:"reason"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if body.TargetType != "post" && body.TargetType != "profile" {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz hedef tipi"})
	}
	validReasons := map[string]bool{
		"spam": true, "hate": true, "violence": true, "harassment": true,
		"fake": true, "sexual": true, "other": true,
	}
	if !validReasons[body.Reason] {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz şikayet sebebi"})
	}
	if len(body.Description) > 500 {
		body.Description = body.Description[:500]
	}

	_, err := config.DB.Exec(`
		INSERT INTO social_reports (reporter_id, target_type, target_id, reason, description)
		VALUES ($1, $2, $3, $4, NULLIF($5,''))
		ON CONFLICT (reporter_id, target_type, target_id) DO NOTHING
	`, uid, body.TargetType, body.TargetID, body.Reason, body.Description)
	if err != nil {
		log.Printf("CreateReport: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Şikayet kaydedilemedi"})
	}
	return c.Status(201).JSON(fiber.Map{"message": "Şikayetin alındı, inceleyeceğiz"})
}

// ───────────────────────── ADMIN ─────────────────────────

// GET /admin/social/reports — bekleyen şikayetler
func AdminListReports(c *fiber.Ctx) error {
	status := c.Query("status", "pending")
	if status != "pending" && status != "resolved" && status != "dismissed" {
		status = "pending"
	}
	rows, err := config.DB.Query(`
		SELECT r.id::text, r.reporter_id::text, r.target_type, r.target_id::text,
		       r.reason, r.description, r.status, r.action_taken,
		       to_char(r.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       sp.username, sp.display_name
		FROM social_reports r
		LEFT JOIN social_profiles sp ON sp.user_id = r.reporter_id
		WHERE r.status = $1
		ORDER BY r.created_at DESC LIMIT 200
	`, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	out := []map[string]interface{}{}
	for rows.Next() {
		var id, reporterID, tType, tID, reason, st string
		var description, action, un, dn sql.NullString
		var ts string
		if err := rows.Scan(&id, &reporterID, &tType, &tID, &reason, &description, &st, &action, &ts, &un, &dn); err == nil {
			out = append(out, map[string]interface{}{
				"id": id, "reporter_id": reporterID, "target_type": tType, "target_id": tID,
				"reason": reason, "description": description.String, "status": st,
				"action_taken": action.String, "created_at": ts,
				"reporter_username": un.String, "reporter_display_name": dn.String,
			})
		}
	}
	return c.JSON(out)
}

// PUT /admin/social/reports/:id — { action: "remove"|"ban"|"warn"|"dismiss" }
func AdminResolveReport(c *fiber.Ctx) error {
	adminID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body struct {
		Action string `json:"action"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	tx, _ := config.DB.Begin()
	defer tx.Rollback()

	var tType, tID string
	err := tx.QueryRow(`SELECT target_type, target_id::text FROM social_reports WHERE id = $1 AND status = 'pending'`, id).Scan(&tType, &tID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Şikayet bulunamadı"})
	}

	resolveStatus := "resolved"
	switch body.Action {
	case "remove":
		if tType == "post" {
			_, _ = tx.Exec(`UPDATE social_posts SET is_hidden = true, hidden_reason = 'admin_removal' WHERE id = $1`, tID)
		}
	case "ban":
		if tType == "profile" {
			_, _ = tx.Exec(`UPDATE social_profiles SET is_banned = true, ban_reason = 'admin_action' WHERE user_id = $1`, tID)
		} else {
			// Post sahibini ban
			_, _ = tx.Exec(`UPDATE social_profiles SET is_banned = true, ban_reason = 'admin_action' WHERE user_id = (SELECT author_id FROM social_posts WHERE id = $1)`, tID)
		}
	case "dismiss":
		resolveStatus = "dismissed"
	case "warn":
		// Sadece status değişir, sistem mesajı gönderilebilir (ileride)
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz aksiyon"})
	}

	_, err = tx.Exec(`UPDATE social_reports SET status = $1, action_taken = $2, resolved_by = $3, resolved_at = NOW() WHERE id = $4`,
		resolveStatus, body.Action, adminID, id)
	if err != nil {
		log.Printf("AdminResolveReport: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	_ = tx.Commit()
	return c.JSON(fiber.Map{"ok": true})
}

// PUT /admin/social/users/:userId/ban — { is_banned: bool, reason: string }
func AdminToggleBan(c *fiber.Ctx) error {
	userID := c.Params("userId")
	var body struct {
		IsBanned bool   `json:"is_banned"`
		Reason   string `json:"reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if len(body.Reason) > 500 {
		body.Reason = body.Reason[:500]
	}
	_, err := config.DB.Exec(`UPDATE social_profiles SET is_banned = $1, ban_reason = NULLIF($2,'') WHERE user_id = $3`, body.IsBanned, body.Reason, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	return c.JSON(fiber.Map{"ok": true})
}
