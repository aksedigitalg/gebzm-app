package handlers

import (
	"database/sql"
	"log"
	"strings"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

// ─── İŞLETME YORUMLARI ─────────────────────────────────────────────────────
// Tablo: business_reviews
//
// Kurallar:
//   - Bir kullanıcı bir işletmeye sadece 1 standalone (order_id=NULL) yorum yazabilir
//   - Bir siparişe sadece 1 yorum yazılabilir (UNIQUE order_id)
//   - rating 1-5 arası, comment 1-1000 karakter
//   - İşletme kendi yorumlarına bir kez cevap verebilir
//   - Admin yorumu silebilir (kötü içerik için)

type Review struct {
	ID                string  `json:"id"`
	BusinessID        string  `json:"business_id"`
	UserID            string  `json:"user_id"`
	UserName          string  `json:"user_name"`
	OrderID           *string `json:"order_id,omitempty"`
	Rating            int     `json:"rating"`
	Comment           string  `json:"comment"`
	BusinessReply     *string `json:"business_reply,omitempty"`
	BusinessRepliedAt *string `json:"business_replied_at,omitempty"`
	CreatedAt         string  `json:"created_at"`
}

type ReviewStats struct {
	Count       int     `json:"count"`
	AverageRating float64 `json:"average_rating"`
	Distribution map[string]int `json:"distribution"` // {"1": n, ..., "5": n}
}

// ─── PUBLIC ──────────────────────────────────────────────────────────────

// GET /businesses/:id/reviews — public liste (en yeni önce, sayfalı)
func GetBusinessReviews(c *fiber.Ctx) error {
	bID := c.Params("id")
	if bID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme yok"})
	}

	limit := 20
	offset := 0
	if p := c.QueryInt("page", 1); p > 0 {
		offset = (p - 1) * limit
	}

	rows, err := config.DB.Query(`
		SELECT r.id, r.business_id, r.user_id,
		       COALESCE(u.name, 'Kullanıcı'),
		       r.order_id::text,
		       r.rating, r.comment,
		       r.business_reply,
		       to_char(r.business_replied_at, 'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM business_reviews r
		LEFT JOIN users u ON u.id = r.user_id
		WHERE r.business_id = $1 AND r.is_hidden = false
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3
	`, bID, limit, offset)
	if err != nil {
		log.Printf("GetBusinessReviews query error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yorumlar yüklenemedi"})
	}
	defer rows.Close()

	list := []Review{}
	for rows.Next() {
		var r Review
		var orderID, reply, repliedAt sql.NullString
		if err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.UserName,
			&orderID, &r.Rating, &r.Comment, &reply, &repliedAt, &r.CreatedAt); err != nil {
			log.Printf("GetBusinessReviews scan error: %v", err)
			continue
		}
		if orderID.Valid && orderID.String != "" {
			s := orderID.String
			r.OrderID = &s
		}
		if reply.Valid && reply.String != "" {
			s := reply.String
			r.BusinessReply = &s
		}
		if repliedAt.Valid && repliedAt.String != "" {
			s := repliedAt.String
			r.BusinessRepliedAt = &s
		}
		list = append(list, r)
	}
	return c.JSON(list)
}

// GET /businesses/:id/reviews/stats — public istatistik
func GetBusinessReviewStats(c *fiber.Ctx) error {
	bID := c.Params("id")
	if bID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme yok"})
	}

	stats := ReviewStats{
		Count:        0,
		AverageRating: 0,
		Distribution: map[string]int{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
	}

	rows, err := config.DB.Query(`
		SELECT rating, COUNT(*)::int
		FROM business_reviews
		WHERE business_id = $1 AND is_hidden = false
		GROUP BY rating
	`, bID)
	if err != nil {
		return c.JSON(stats)
	}
	defer rows.Close()

	totalSum := 0
	totalCount := 0
	for rows.Next() {
		var rating, count int
		if err := rows.Scan(&rating, &count); err != nil {
			continue
		}
		if rating >= 1 && rating <= 5 {
			key := string(rune('0' + rating))
			stats.Distribution[key] = count
			totalSum += rating * count
			totalCount += count
		}
	}
	stats.Count = totalCount
	if totalCount > 0 {
		stats.AverageRating = float64(totalSum) / float64(totalCount)
	}
	return c.JSON(stats)
}

// ─── USER ────────────────────────────────────────────────────────────────

// POST /user/businesses/:id/reviews — auth gerekli
//
// Body: { order_id?: string, rating: 1-5, comment: string }
//
// Validation:
//   - rating 1-5
//   - comment 1-1000 karakter (boş yorum yok)
//   - order_id verilmişse: o sipariş bu kullanıcıya ait OLMALI ve teslim_edildi
//   - order_id verilmişse: aynı siparişe önceden yorum yapılmamış olmalı
//   - order_id yoksa: bu kullanıcının bu işletmeye standalone yorumu var mı?
func CreateBusinessReview(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(string)
	bID := c.Params("id")
	if bID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme yok"})
	}

	var body struct {
		OrderID string `json:"order_id"`
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	// Validation
	if body.Rating < 1 || body.Rating > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Puan 1-5 arasında olmalı"})
	}
	body.Comment = strings.TrimSpace(body.Comment)
	if body.Comment == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Yorum boş olamaz"})
	}
	if len(body.Comment) > 1000 {
		body.Comment = body.Comment[:1000]
	}

	// İşletme var mı?
	var exists bool
	if err := config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM businesses WHERE id = $1 AND is_active = true AND is_approved = true)`, bID).Scan(&exists); err != nil || !exists {
		return c.Status(404).JSON(fiber.Map{"error": "İşletme bulunamadı"})
	}

	var orderIDArg interface{}
	if body.OrderID != "" {
		// Bu siparişin sahibi gerçekten bu kullanıcı mı + teslim edildi mi?
		var ordStatus string
		var ordBID string
		if err := config.DB.QueryRow(`SELECT status, business_id::text FROM orders WHERE id = $1 AND user_id = $2`, body.OrderID, uID).Scan(&ordStatus, &ordBID); err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Sipariş bulunamadı"})
		}
		if ordBID != bID {
			return c.Status(403).JSON(fiber.Map{"error": "Bu sipariş bu işletmeye ait değil"})
		}
		if ordStatus != "teslim_edildi" {
			return c.Status(400).JSON(fiber.Map{"error": "Sadece teslim edilmiş siparişlere yorum yazılabilir"})
		}
		orderIDArg = body.OrderID
	} else {
		orderIDArg = nil
	}

	// Insert (UNIQUE constraint duplicate'i bloke eder)
	var id string
	err := config.DB.QueryRow(`
		INSERT INTO business_reviews (business_id, user_id, order_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, bID, uID, orderIDArg, body.Rating, body.Comment).Scan(&id)
	if err != nil {
		log.Printf("CreateBusinessReview insert error: %v (uid=%s bid=%s)", err, uID, bID)
		// Unique constraint
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return c.Status(409).JSON(fiber.Map{"error": "Bu işletmeye zaten yorum yazmışsın"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Yorum kaydedilemedi"})
	}

	// İşletmeye bildirim
	go func() {
		CreateNotification("", bID, "review_new", "Yeni yorum aldın",
			"İşletmene yeni bir yorum yazıldı: \""+truncate(body.Comment, 80)+"\"", false)
	}()

	return c.Status(201).JSON(fiber.Map{"id": id, "message": "Yorum kaydedildi"})
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}

// DELETE /user/reviews/:id — kendi yorumunu sil (auth)
func DeleteMyReview(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(string)
	id := c.Params("id")
	res, err := config.DB.Exec(`DELETE FROM business_reviews WHERE id = $1 AND user_id = $2`, id, uID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Yorum bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Silindi"})
}

// GET /user/reviews/eligibility/:business_id — kullanıcı bu işletmeye yorum yazabilir mi?
//
// Dönüş: { can_review: bool, has_standalone: bool, eligible_orders: [{id, created_at}] }
//   - can_review: en az bir yöntem mevcutsa true
//   - has_standalone: standalone yorumu varsa
//   - eligible_orders: teslim edilmiş ve yorum yapılmamış siparişler
func GetReviewEligibility(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(string)
	bID := c.Params("business_id")
	if bID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme yok"})
	}

	var hasStandalone bool
	if err := config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM business_reviews WHERE business_id = $1 AND user_id = $2 AND order_id IS NULL)`, bID, uID).Scan(&hasStandalone); err != nil {
		hasStandalone = false
	}

	type EligibleOrder struct {
		ID        string `json:"id"`
		CreatedAt string `json:"created_at"`
	}
	eligible := []EligibleOrder{}
	rows, err := config.DB.Query(`
		SELECT o.id, to_char(o.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM orders o
		WHERE o.business_id = $1 AND o.user_id = $2 AND o.status = 'teslim_edildi'
		  AND NOT EXISTS (SELECT 1 FROM business_reviews r WHERE r.order_id = o.id)
		ORDER BY o.created_at DESC
		LIMIT 5
	`, bID, uID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var e EligibleOrder
			if err := rows.Scan(&e.ID, &e.CreatedAt); err == nil {
				eligible = append(eligible, e)
			}
		}
	}

	return c.JSON(fiber.Map{
		"can_review":      !hasStandalone || len(eligible) > 0,
		"has_standalone":  hasStandalone,
		"eligible_orders": eligible,
	})
}

// ─── BUSINESS (kendi yorumları + cevap) ─────────────────────────────────

// GET /business/reviews — kendi yorumlarını listele
func GetMyBusinessReviews(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)

	rows, err := config.DB.Query(`
		SELECT r.id, r.business_id, r.user_id,
		       COALESCE(u.name, 'Kullanıcı'),
		       r.order_id::text,
		       r.rating, r.comment,
		       r.business_reply,
		       to_char(r.business_replied_at, 'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM business_reviews r
		LEFT JOIN users u ON u.id = r.user_id
		WHERE r.business_id = $1
		ORDER BY r.created_at DESC
	`, bID)
	if err != nil {
		log.Printf("GetMyBusinessReviews error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Yorumlar yüklenemedi"})
	}
	defer rows.Close()

	list := []Review{}
	for rows.Next() {
		var r Review
		var orderID, reply, repliedAt sql.NullString
		if err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.UserName,
			&orderID, &r.Rating, &r.Comment, &reply, &repliedAt, &r.CreatedAt); err != nil {
			continue
		}
		if orderID.Valid && orderID.String != "" {
			s := orderID.String
			r.OrderID = &s
		}
		if reply.Valid && reply.String != "" {
			s := reply.String
			r.BusinessReply = &s
		}
		if repliedAt.Valid && repliedAt.String != "" {
			s := repliedAt.String
			r.BusinessRepliedAt = &s
		}
		list = append(list, r)
	}
	return c.JSON(list)
}

// PUT /business/reviews/:id/reply — yoruma cevap ver (max 1 kez güncellenebilir)
func ReplyToReview(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	id := c.Params("id")

	var body struct {
		Reply string `json:"reply"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	body.Reply = strings.TrimSpace(body.Reply)
	if body.Reply == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Cevap boş olamaz"})
	}
	if len(body.Reply) > 1000 {
		body.Reply = body.Reply[:1000]
	}

	res, err := config.DB.Exec(`
		UPDATE business_reviews
		SET business_reply = $1, business_replied_at = NOW()
		WHERE id = $2 AND business_id = $3
	`, body.Reply, id, bID)
	if err != nil {
		log.Printf("ReplyToReview error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Cevap kaydedilemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Yorum bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Cevap kaydedildi"})
}

// ─── ADMIN ───────────────────────────────────────────────────────────────

// PUT /admin/reviews/:id/hide — yorumu gizle (kötü içerik)
func AdminHideReview(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := config.DB.Exec(`UPDATE business_reviews SET is_hidden = NOT is_hidden WHERE id = $1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Yorum bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Güncellendi"})
}
