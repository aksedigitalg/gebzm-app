package handlers

import (
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

// ─── ORTAK YAPILAR ─────────────────────────────────────────────────────────

type EventCategoryResp struct {
	ID        string `json:"id"`
	Key       string `json:"key"`
	Label     string `json:"label"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	SortOrder int    `json:"sort_order"`
}

type EventResp struct {
	ID              string     `json:"id"`
	Slug            string     `json:"slug"`
	Title           string     `json:"title"`
	CategoryKey     string     `json:"category_key,omitempty"`
	CategoryLabel   string     `json:"category_label,omitempty"`
	CategoryColor   string     `json:"category_color,omitempty"`
	Description     string     `json:"description,omitempty"`
	PhotoURL        string     `json:"photo_url,omitempty"`
	CoverURL        string     `json:"cover_url,omitempty"`
	StartAt         time.Time  `json:"start_at"`
	EndAt           *time.Time `json:"end_at,omitempty"`
	LocationName    string     `json:"location_name,omitempty"`
	Address         string     `json:"address,omitempty"`
	Lat             *float64   `json:"lat,omitempty"`
	Lng             *float64   `json:"lng,omitempty"`
	Organizer       string     `json:"organizer,omitempty"`
	ContactPhone    string     `json:"contact_phone,omitempty"`
	ContactURL      string     `json:"contact_url,omitempty"`
	TicketURL       string     `json:"ticket_url,omitempty"`
	Price           float64    `json:"price"`
	Status          string     `json:"status"`
	InterestedCount int        `json:"interested_count"`
	AttendingCount  int        `json:"attending_count"`
	UserStatus      string     `json:"user_status,omitempty"` // "katiliyor" | "ilgileniyor" | ""
	CreatedAt       time.Time  `json:"created_at"`
}

const eventSelectCols = `
e.id, e.slug, e.title, COALESCE(e.category_key,''), COALESCE(c.label,''), COALESCE(c.color,''),
COALESCE(e.description,''), COALESCE(e.photo_url,''), COALESCE(e.cover_url,''),
e.start_at, e.end_at,
COALESCE(e.location_name,''), COALESCE(e.address,''), e.lat, e.lng,
COALESCE(e.organizer,''), COALESCE(e.contact_phone,''), COALESCE(e.contact_url,''),
COALESCE(e.ticket_url,''),
COALESCE(e.price, 0), e.status,
COALESCE(e.interested_count, 0), COALESCE(e.attending_count, 0),
e.created_at`

func scanEventRow(row interface {
	Scan(...interface{}) error
}) (*EventResp, error) {
	var e EventResp
	var endAt sql.NullTime
	var lat, lng sql.NullFloat64
	if err := row.Scan(
		&e.ID, &e.Slug, &e.Title, &e.CategoryKey, &e.CategoryLabel, &e.CategoryColor,
		&e.Description, &e.PhotoURL, &e.CoverURL,
		&e.StartAt, &endAt,
		&e.LocationName, &e.Address, &lat, &lng,
		&e.Organizer, &e.ContactPhone, &e.ContactURL,
		&e.TicketURL,
		&e.Price, &e.Status,
		&e.InterestedCount, &e.AttendingCount,
		&e.CreatedAt,
	); err != nil {
		return nil, err
	}
	if endAt.Valid {
		t := endAt.Time
		e.EndAt = &t
	}
	if lat.Valid {
		v := lat.Float64
		e.Lat = &v
	}
	if lng.Valid {
		v := lng.Float64
		e.Lng = &v
	}
	return &e, nil
}

// ─── KATEGORİLER ───────────────────────────────────────────────────────────

func GetEventCategories(c *fiber.Ctx) error {
	rows, err := config.DB.Query(`
		SELECT id, key, label, COALESCE(icon,''), COALESCE(color,''), sort_order
		FROM event_categories WHERE is_active = true
		ORDER BY sort_order, label
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	var list []EventCategoryResp
	for rows.Next() {
		var r EventCategoryResp
		if err := rows.Scan(&r.ID, &r.Key, &r.Label, &r.Icon, &r.Color, &r.SortOrder); err != nil {
			continue
		}
		list = append(list, r)
	}
	if list == nil {
		list = []EventCategoryResp{}
	}
	return c.JSON(list)
}

// ─── PUBLIC: ETKİNLİK LİSTE ────────────────────────────────────────────────

func GetEvents(c *fiber.Ctx) error {
	category := c.Query("category", "")
	when := c.Query("when", "") // "today" | "week" | "month" | "" (tümü)
	search := strings.TrimSpace(c.Query("q", ""))

	conditions := []string{"e.status = 'yayinda'"}
	args := []interface{}{}
	argIdx := 1

	// Geçmiş etkinlikleri otomatik gizle
	conditions = append(conditions, "e.start_at >= NOW() - INTERVAL '1 day'")

	if category != "" && len(category) < 50 {
		conditions = append(conditions, fmt.Sprintf("e.category_key = $%d", argIdx))
		args = append(args, category)
		argIdx++
	}

	switch when {
	case "today":
		conditions = append(conditions, "DATE(e.start_at) = CURRENT_DATE")
	case "week":
		conditions = append(conditions, "e.start_at <= NOW() + INTERVAL '7 days'")
	case "month":
		conditions = append(conditions, "e.start_at <= NOW() + INTERVAL '30 days'")
	}

	if search != "" && len(search) >= 2 && len(search) <= 100 {
		conditions = append(conditions, fmt.Sprintf("(e.title ILIKE $%d OR e.description ILIKE $%d OR e.location_name ILIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	q := fmt.Sprintf(`
		SELECT %s
		FROM events e
		LEFT JOIN event_categories c ON c.key = e.category_key
		WHERE %s
		ORDER BY e.start_at ASC
		LIMIT 200
	`, eventSelectCols, strings.Join(conditions, " AND "))

	rows, err := config.DB.Query(q, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()

	var list []EventResp
	for rows.Next() {
		e, err := scanEventRow(rows)
		if err != nil {
			continue
		}
		list = append(list, *e)
	}
	if list == nil {
		list = []EventResp{}
	}
	return c.JSON(list)
}

// ─── PUBLIC: ETKİNLİK DETAY (slug ile) ─────────────────────────────────────

func GetEventBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}
	q := fmt.Sprintf(`
		SELECT %s
		FROM events e
		LEFT JOIN event_categories c ON c.key = e.category_key
		WHERE e.slug = $1 AND e.status IN ('yayinda','bitti')
	`, eventSelectCols)
	e, err := scanEventRow(config.DB.QueryRow(q, slug))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}

	// Kullanıcı login ise ilgi durumunu döndür
	if userIDLocal := c.Locals("user_id"); userIDLocal != nil {
		userID, _ := userIDLocal.(string)
		if userID != "" {
			var status string
			err := config.DB.QueryRow(`
				SELECT status FROM event_attendees WHERE event_id = $1 AND user_id = $2
			`, e.ID, userID).Scan(&status)
			if err == nil {
				e.UserStatus = status
			}
		}
	}

	return c.JSON(e)
}

// ─── USER: KATILIYORUM / İLGİLENİYORUM ─────────────────────────────────────

func MarkEventInterest(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body struct {
		Status string `json:"status"` // "katiliyor" | "ilgileniyor"
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if body.Status != "katiliyor" && body.Status != "ilgileniyor" {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz durum"})
	}

	// Etkinlik var mı?
	var exists bool
	err := config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM events WHERE id = $1 AND status = 'yayinda')`, id).Scan(&exists)
	if err != nil || !exists {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}

	// UPSERT
	_, err = config.DB.Exec(`
		INSERT INTO event_attendees (event_id, user_id, status)
		VALUES ($1, $2, $3)
		ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3, created_at = NOW()
	`, id, userID, body.Status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}

	// Sayaçları güncelle (ayrı query'de transaction olmadan, güvenli)
	go updateEventCounts(id)

	return c.JSON(fiber.Map{"status": body.Status})
}

func RemoveEventInterest(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	_, err := config.DB.Exec(`DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	go updateEventCounts(id)
	return c.JSON(fiber.Map{"message": "Kaldırıldı"})
}

func updateEventCounts(eventID string) {
	_, _ = config.DB.Exec(`
		UPDATE events SET
			interested_count = (SELECT COUNT(*) FROM event_attendees WHERE event_id = $1 AND status = 'ilgileniyor'),
			attending_count = (SELECT COUNT(*) FROM event_attendees WHERE event_id = $1 AND status = 'katiliyor')
		WHERE id = $1
	`, eventID)
}

// ─── ADMIN: ETKİNLİK CRUD ──────────────────────────────────────────────────

type EventBody struct {
	Title        string   `json:"title"`
	CategoryKey  string   `json:"category_key"`
	Description  string   `json:"description"`
	PhotoURL     string   `json:"photo_url"`
	CoverURL     string   `json:"cover_url"`
	StartAt      string   `json:"start_at"` // ISO
	EndAt        string   `json:"end_at"`
	LocationName string   `json:"location_name"`
	Address      string   `json:"address"`
	Lat          *float64 `json:"lat"`
	Lng          *float64 `json:"lng"`
	Organizer    string   `json:"organizer"`
	ContactPhone string   `json:"contact_phone"`
	ContactURL   string   `json:"contact_url"`
	TicketURL    string   `json:"ticket_url"`
	Price        float64  `json:"price"`
	Status       string   `json:"status"`
}

var slugRegex = regexp.MustCompile(`[^a-z0-9]+`)

func makeSlug(title string) string {
	s := strings.ToLower(title)
	// Türkçe karakter dönüşümü
	replacer := strings.NewReplacer(
		"ç", "c", "ğ", "g", "ı", "i", "ö", "o", "ş", "s", "ü", "u",
		"Ç", "c", "Ğ", "g", "İ", "i", "Ö", "o", "Ş", "s", "Ü", "u",
	)
	s = replacer.Replace(s)
	s = slugRegex.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if len(s) > 200 {
		s = s[:200]
	}
	return s
}

func validateEventBody(b *EventBody) string {
	b.Title = strings.TrimSpace(b.Title)
	if len(b.Title) < 3 {
		return "Başlık en az 3 karakter olmalı"
	}
	if len(b.Title) > 200 {
		return "Başlık çok uzun"
	}
	if b.StartAt == "" {
		return "Başlangıç tarihi zorunlu"
	}
	if b.Status == "" {
		b.Status = "yayinda"
	}
	if b.Status != "taslak" && b.Status != "yayinda" && b.Status != "iptal" && b.Status != "bitti" {
		return "Geçersiz durum"
	}
	if b.Lat != nil && (*b.Lat < -90 || *b.Lat > 90) {
		return "Geçersiz koordinat"
	}
	if b.Lng != nil && (*b.Lng < -180 || *b.Lng > 180) {
		return "Geçersiz koordinat"
	}
	if b.Price < 0 || b.Price > 1_000_000 {
		return "Geçersiz fiyat"
	}
	if len(b.Description) > 5000 {
		b.Description = b.Description[:5000]
	}
	if len(b.LocationName) > 200 {
		b.LocationName = b.LocationName[:200]
	}
	if len(b.Address) > 500 {
		b.Address = b.Address[:500]
	}
	if len(b.Organizer) > 200 {
		b.Organizer = b.Organizer[:200]
	}
	if len(b.ContactPhone) > 20 {
		b.ContactPhone = b.ContactPhone[:20]
	}
	if len(b.ContactURL) > 500 {
		b.ContactURL = b.ContactURL[:500]
	}
	if len(b.TicketURL) > 500 {
		b.TicketURL = b.TicketURL[:500]
	}
	return ""
}

// uniqueSlug — eğer slug çakışırsa sonuna -2, -3 ekle
func uniqueSlug(base string, excludeID string) (string, error) {
	candidate := base
	for i := 0; i < 50; i++ {
		var exists bool
		var query string
		var args []interface{}
		if excludeID == "" {
			query = `SELECT EXISTS(SELECT 1 FROM events WHERE slug = $1)`
			args = []interface{}{candidate}
		} else {
			query = `SELECT EXISTS(SELECT 1 FROM events WHERE slug = $1 AND id != $2)`
			args = []interface{}{candidate, excludeID}
		}
		err := config.DB.QueryRow(query, args...).Scan(&exists)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i+2)
	}
	return "", fmt.Errorf("slug üretilemedi")
}

func AdminCreateEvent(c *fiber.Ctx) error {
	var body EventBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if msg := validateEventBody(&body); msg != "" {
		return c.Status(400).JSON(fiber.Map{"error": msg})
	}

	startAt, err := time.Parse(time.RFC3339, body.StartAt)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Başlangıç tarihi formatı geçersiz (ISO bekleniyor)"})
	}
	var endAt sql.NullTime
	if body.EndAt != "" {
		t, err := time.Parse(time.RFC3339, body.EndAt)
		if err == nil {
			endAt = sql.NullTime{Time: t, Valid: true}
		}
	}

	base := makeSlug(body.Title)
	if base == "" {
		base = "etkinlik"
	}
	slug, err := uniqueSlug(base, "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Slug üretilemedi"})
	}

	var id string
	err = config.DB.QueryRow(`
		INSERT INTO events (
			slug, title, category_key, description, photo_url, cover_url,
			start_at, end_at, location_name, address, lat, lng,
			organizer, contact_phone, contact_url, ticket_url, price, status
		) VALUES (
			$1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''), NULLIF($6,''),
			$7, $8, NULLIF($9,''), NULLIF($10,''), $11, $12,
			NULLIF($13,''), NULLIF($14,''), NULLIF($15,''), NULLIF($16,''), $17, $18
		) RETURNING id
	`,
		slug, body.Title, body.CategoryKey, body.Description, body.PhotoURL, body.CoverURL,
		startAt, endAt, body.LocationName, body.Address, body.Lat, body.Lng,
		body.Organizer, body.ContactPhone, body.ContactURL, body.TicketURL, body.Price, body.Status,
	).Scan(&id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}
	return c.Status(201).JSON(fiber.Map{"id": id, "slug": slug})
}

func AdminUpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	var body EventBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if msg := validateEventBody(&body); msg != "" {
		return c.Status(400).JSON(fiber.Map{"error": msg})
	}

	startAt, err := time.Parse(time.RFC3339, body.StartAt)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Başlangıç tarihi formatı geçersiz"})
	}
	var endAt sql.NullTime
	if body.EndAt != "" {
		t, err := time.Parse(time.RFC3339, body.EndAt)
		if err == nil {
			endAt = sql.NullTime{Time: t, Valid: true}
		}
	}

	res, err := config.DB.Exec(`
		UPDATE events SET
			title = $1, category_key = NULLIF($2,''), description = NULLIF($3,''),
			photo_url = NULLIF($4,''), cover_url = NULLIF($5,''),
			start_at = $6, end_at = $7,
			location_name = NULLIF($8,''), address = NULLIF($9,''), lat = $10, lng = $11,
			organizer = NULLIF($12,''), contact_phone = NULLIF($13,''),
			contact_url = NULLIF($14,''), ticket_url = NULLIF($15,''),
			price = $16, status = $17, updated_at = NOW()
		WHERE id = $18
	`,
		body.Title, body.CategoryKey, body.Description, body.PhotoURL, body.CoverURL,
		startAt, endAt, body.LocationName, body.Address, body.Lat, body.Lng,
		body.Organizer, body.ContactPhone, body.ContactURL, body.TicketURL,
		body.Price, body.Status, id,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Güncellendi"})
}

func AdminDeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := config.DB.Exec(`DELETE FROM events WHERE id = $1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Silindi"})
}

func AdminListEvents(c *fiber.Ctx) error {
	q := fmt.Sprintf(`
		SELECT %s
		FROM events e
		LEFT JOIN event_categories c ON c.key = e.category_key
		ORDER BY e.start_at DESC
		LIMIT 500
	`, eventSelectCols)
	rows, err := config.DB.Query(q)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Yüklenemedi"})
	}
	defer rows.Close()
	var list []EventResp
	for rows.Next() {
		e, err := scanEventRow(rows)
		if err != nil {
			continue
		}
		list = append(list, *e)
	}
	if list == nil {
		list = []EventResp{}
	}
	return c.JSON(list)
}

func AdminGetEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	q := fmt.Sprintf(`
		SELECT %s
		FROM events e
		LEFT JOIN event_categories c ON c.key = e.category_key
		WHERE e.id = $1
	`, eventSelectCols)
	e, err := scanEventRow(config.DB.QueryRow(q, id))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Etkinlik bulunamadı"})
	}
	return c.JSON(e)
}
