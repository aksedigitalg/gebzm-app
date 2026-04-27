package handlers

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

// ─── ORTAK YAPILAR ─────────────────────────────────────────────────────────

type OrderItemReq struct {
	MenuItemID string  `json:"menu_item_id"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Quantity   int     `json:"quantity"`
	Note       string  `json:"note"`
}

type CreateOrderReq struct {
	BusinessID       string         `json:"business_id"`
	Items            []OrderItemReq `json:"items"`
	PaymentMethod    string         `json:"payment_method"`
	DeliveryAddress  string         `json:"delivery_address"`
	DeliveryLat      *float64       `json:"delivery_lat"`
	DeliveryLng      *float64       `json:"delivery_lng"`
	DeliveryDistrict string         `json:"delivery_district"`
	ContactPhone     string         `json:"contact_phone"`
	ContactName      string         `json:"contact_name"`
	UserNote         string         `json:"user_note"`
}

type OrderItemResp struct {
	ID         string  `json:"id"`
	MenuItemID *string `json:"menu_item_id,omitempty"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Quantity   int     `json:"quantity"`
	Subtotal   float64 `json:"subtotal"`
	Note       string  `json:"note"`
}

type OrderResp struct {
	ID                   string          `json:"id"`
	UserID               *string         `json:"user_id,omitempty"`
	BusinessID           string          `json:"business_id"`
	BusinessName         string          `json:"business_name,omitempty"`
	BusinessPhone        string          `json:"business_phone,omitempty"`
	Status               string          `json:"status"`
	PaymentMethod        string          `json:"payment_method"`
	PaymentStatus        string          `json:"payment_status"`
	DeliveryAddress      string          `json:"delivery_address"`
	DeliveryLat          *float64        `json:"delivery_lat,omitempty"`
	DeliveryLng          *float64        `json:"delivery_lng,omitempty"`
	DeliveryDistrict     string          `json:"delivery_district,omitempty"`
	ContactPhone         string          `json:"contact_phone"`
	ContactName          string          `json:"contact_name,omitempty"`
	Subtotal             float64         `json:"subtotal"`
	DeliveryFee          float64         `json:"delivery_fee"`
	Total                float64         `json:"total"`
	UserNote             string          `json:"user_note,omitempty"`
	BusinessNote         string          `json:"business_note,omitempty"`
	EstimatedDeliveryMin *int            `json:"estimated_delivery_min,omitempty"`
	AcceptedAt           *time.Time      `json:"accepted_at,omitempty"`
	ReadyAt              *time.Time      `json:"ready_at,omitempty"`
	DeliveringAt         *time.Time      `json:"delivering_at,omitempty"`
	DeliveredAt          *time.Time      `json:"delivered_at,omitempty"`
	CancelledAt          *time.Time      `json:"cancelled_at,omitempty"`
	CancelledReason      string          `json:"cancelled_reason,omitempty"`
	Rating               *int            `json:"rating,omitempty"`
	RatingComment        string          `json:"rating_comment,omitempty"`
	RatedAt              *time.Time      `json:"rated_at,omitempty"`
	Items                []OrderItemResp `json:"items"`
	CreatedAt            time.Time       `json:"created_at"`
}

// ─── HELPER ────────────────────────────────────────────────────────────────

// Sipariş status değişimi audit log
func recordStatusChange(orderID, fromStatus, toStatus, role, byID, reason string) {
	go func() {
		_, _ = config.DB.Exec(`
			INSERT INTO order_status_history (order_id, from_status, to_status, changed_by_role, changed_by_id, reason)
			VALUES ($1, NULLIF($2,''), $3, $4, NULLIF($5,'')::uuid, NULLIF($6,''))
		`, orderID, fromStatus, toStatus, role, byID, reason)
	}()
}

// Belirli bir siparişin item'larını getir
func loadOrderItems(orderID string) ([]OrderItemResp, error) {
	rows, err := config.DB.Query(`
		SELECT id, menu_item_id, name, price, quantity, subtotal, COALESCE(note,'')
		FROM order_items WHERE order_id = $1 ORDER BY created_at
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []OrderItemResp
	for rows.Next() {
		var it OrderItemResp
		var menuItemID sql.NullString
		var note string
		if err := rows.Scan(&it.ID, &menuItemID, &it.Name, &it.Price, &it.Quantity, &it.Subtotal, &note); err != nil {
			continue
		}
		if menuItemID.Valid {
			s := menuItemID.String
			it.MenuItemID = &s
		}
		it.Note = note
		list = append(list, it)
	}
	if list == nil {
		list = []OrderItemResp{}
	}
	return list, nil
}

// Tek satırı OrderResp'e dönüştür
func scanOrderRow(row interface {
	Scan(...interface{}) error
}) (*OrderResp, error) {
	var o OrderResp
	var userID, busName, busPhone, deliveryDistrict, contactName, userNote, businessNote, cancelledReason, ratingComment sql.NullString
	var deliveryLat, deliveryLng sql.NullFloat64
	var estDeliveryMin, rating sql.NullInt64
	var acceptedAt, readyAt, deliveringAt, deliveredAt, cancelledAt, ratedAt sql.NullTime
	if err := row.Scan(
		&o.ID, &userID, &o.BusinessID, &o.Status, &o.PaymentMethod, &o.PaymentStatus,
		&o.DeliveryAddress, &deliveryLat, &deliveryLng, &deliveryDistrict,
		&o.ContactPhone, &contactName,
		&o.Subtotal, &o.DeliveryFee, &o.Total,
		&userNote, &businessNote, &estDeliveryMin,
		&acceptedAt, &readyAt, &deliveringAt, &deliveredAt,
		&cancelledAt, &cancelledReason,
		&rating, &ratingComment, &ratedAt,
		&o.CreatedAt, &busName, &busPhone,
	); err != nil {
		return nil, err
	}
	if userID.Valid {
		s := userID.String
		o.UserID = &s
	}
	if deliveryLat.Valid {
		v := deliveryLat.Float64
		o.DeliveryLat = &v
	}
	if deliveryLng.Valid {
		v := deliveryLng.Float64
		o.DeliveryLng = &v
	}
	o.DeliveryDistrict = deliveryDistrict.String
	o.ContactName = contactName.String
	o.UserNote = userNote.String
	o.BusinessNote = businessNote.String
	if estDeliveryMin.Valid {
		v := int(estDeliveryMin.Int64)
		o.EstimatedDeliveryMin = &v
	}
	if acceptedAt.Valid {
		t := acceptedAt.Time
		o.AcceptedAt = &t
	}
	if readyAt.Valid {
		t := readyAt.Time
		o.ReadyAt = &t
	}
	if deliveringAt.Valid {
		t := deliveringAt.Time
		o.DeliveringAt = &t
	}
	if deliveredAt.Valid {
		t := deliveredAt.Time
		o.DeliveredAt = &t
	}
	if cancelledAt.Valid {
		t := cancelledAt.Time
		o.CancelledAt = &t
	}
	o.CancelledReason = cancelledReason.String
	if rating.Valid {
		v := int(rating.Int64)
		o.Rating = &v
	}
	o.RatingComment = ratingComment.String
	if ratedAt.Valid {
		t := ratedAt.Time
		o.RatedAt = &t
	}
	o.BusinessName = busName.String
	o.BusinessPhone = busPhone.String
	return &o, nil
}

const orderSelectCols = `
o.id, o.user_id, o.business_id, o.status, o.payment_method, o.payment_status,
o.delivery_address, o.delivery_lat, o.delivery_lng, o.delivery_district,
o.contact_phone, o.contact_name,
o.subtotal, o.delivery_fee, o.total,
o.user_note, o.business_note, o.estimated_delivery_min,
o.accepted_at, o.ready_at, o.delivering_at, o.delivered_at,
o.cancelled_at, o.cancelled_reason,
o.rating, o.rating_comment, o.rated_at,
o.created_at, b.name, COALESCE(b.phone,'')`

// ─── USER: SİPARİŞ OLUŞTUR ─────────────────────────────────────────────────

func CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	var body CreateOrderReq
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	body.BusinessID = strings.TrimSpace(body.BusinessID)
	body.DeliveryAddress = strings.TrimSpace(body.DeliveryAddress)
	body.ContactPhone = strings.TrimSpace(body.ContactPhone)
	if body.BusinessID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme zorunlu"})
	}
	if len(body.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Sepet boş"})
	}
	if len(body.Items) > 50 {
		return c.Status(400).JSON(fiber.Map{"error": "Çok fazla ürün"})
	}
	if len(body.DeliveryAddress) < 10 {
		return c.Status(400).JSON(fiber.Map{"error": "Adresi detaylı yaz (min 10 karakter)"})
	}
	if len(body.DeliveryAddress) > 1000 {
		return c.Status(400).JSON(fiber.Map{"error": "Adres çok uzun"})
	}
	if body.ContactPhone == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Telefon zorunlu"})
	}
	if body.PaymentMethod != "nakit" && body.PaymentMethod != "kart_kapida" && body.PaymentMethod != "eft" {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz ödeme yöntemi"})
	}

	var businessExists bool
	var deliveryFee, freeThreshold, minOrder float64
	var acceptsOrders, acceptsCash, acceptsCard, acceptsEft bool
	var estimatedMin sql.NullInt64
	err := config.DB.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM businesses WHERE id = $1 AND is_approved = true AND is_active = true),
		       COALESCE(s.accepts_orders, false),
		       COALESCE(s.delivery_fee, 0),
		       COALESCE(s.free_delivery_threshold, 0),
		       COALESCE(s.min_order_amount, 0),
		       COALESCE(s.accepts_cash, true),
		       COALESCE(s.accepts_card_at_door, true),
		       COALESCE(s.accepts_eft, false),
		       s.estimated_delivery_min
		FROM businesses b
		LEFT JOIN business_delivery_settings s ON s.business_id = b.id
		WHERE b.id = $1
	`, body.BusinessID).Scan(&businessExists, &acceptsOrders, &deliveryFee, &freeThreshold, &minOrder, &acceptsCash, &acceptsCard, &acceptsEft, &estimatedMin)
	if err != nil || !businessExists {
		return c.Status(404).JSON(fiber.Map{"error": "İşletme bulunamadı"})
	}
	if !acceptsOrders {
		return c.Status(400).JSON(fiber.Map{"error": "İşletme şu an sipariş kabul etmiyor"})
	}
	if body.PaymentMethod == "nakit" && !acceptsCash {
		return c.Status(400).JSON(fiber.Map{"error": "Nakit ödeme kabul edilmiyor"})
	}
	if body.PaymentMethod == "kart_kapida" && !acceptsCard {
		return c.Status(400).JSON(fiber.Map{"error": "Kapıda kart ödeme kabul edilmiyor"})
	}
	if body.PaymentMethod == "eft" && !acceptsEft {
		return c.Status(400).JSON(fiber.Map{"error": "EFT ödeme kabul edilmiyor"})
	}

	type ItemSnap struct {
		MenuItemID string
		Name       string
		Price      float64
		Quantity   int
		Subtotal   float64
		Note       string
	}
	var snaps []ItemSnap
	subtotal := 0.0
	for _, it := range body.Items {
		if it.Quantity < 1 || it.Quantity > 99 {
			return c.Status(400).JSON(fiber.Map{"error": "Geçersiz adet"})
		}
		var name string
		var price float64
		err := config.DB.QueryRow(`
			SELECT name, price FROM menu_items
			WHERE id = $1 AND business_id = $2
		`, it.MenuItemID, body.BusinessID).Scan(&name, &price)
		if err == sql.ErrNoRows {
			return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Ürün bulunamadı: %s", it.Name)})
		}
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Ürün doğrulanamadı"})
		}
		sub := price * float64(it.Quantity)
		subtotal += sub
		note := it.Note
		if len(note) > 500 {
			note = note[:500]
		}
		snaps = append(snaps, ItemSnap{
			MenuItemID: it.MenuItemID,
			Name:       name,
			Price:      price,
			Quantity:   it.Quantity,
			Subtotal:   sub,
			Note:       note,
		})
	}

	if minOrder > 0 && subtotal < minOrder {
		return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Minimum sipariş tutarı %.2f TL", minOrder)})
	}

	finalDeliveryFee := deliveryFee
	if freeThreshold > 0 && subtotal >= freeThreshold {
		finalDeliveryFee = 0
	}
	total := subtotal + finalDeliveryFee

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Sipariş oluşturulamadı"})
	}
	defer tx.Rollback()

	contactName := strings.TrimSpace(body.ContactName)
	userNote := strings.TrimSpace(body.UserNote)
	if len(userNote) > 500 {
		userNote = userNote[:500]
	}

	var orderID string
	err = tx.QueryRow(`
		INSERT INTO orders (
			user_id, business_id, payment_method,
			delivery_address, delivery_lat, delivery_lng, delivery_district,
			contact_phone, contact_name,
			subtotal, delivery_fee, total,
			user_note, estimated_delivery_min
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
		RETURNING id
	`, userID, body.BusinessID, body.PaymentMethod,
		body.DeliveryAddress, body.DeliveryLat, body.DeliveryLng, body.DeliveryDistrict,
		body.ContactPhone, contactName,
		subtotal, finalDeliveryFee, total,
		userNote, estimatedMin,
	).Scan(&orderID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Sipariş kaydedilemedi"})
	}

	for _, s := range snaps {
		_, err := tx.Exec(`
			INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, subtotal, note)
			VALUES ($1, NULLIF($2,'')::uuid, $3, $4, $5, $6, NULLIF($7,''))
		`, orderID, s.MenuItemID, s.Name, s.Price, s.Quantity, s.Subtotal, s.Note)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Sipariş ürünleri kaydedilemedi"})
		}
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Sipariş kaydedilemedi"})
	}

	recordStatusChange(orderID, "", "bekliyor", "user", userID, "")
	go func() {
		CreateNotification("", body.BusinessID, "order", "Yeni Sipariş", fmt.Sprintf("Yeni sipariş: %.2f TL", total), false)
	}()

	resp := fiber.Map{
		"id":    orderID,
		"total": total,
	}
	if estimatedMin.Valid {
		resp["estimated_delivery_min"] = estimatedMin.Int64
	}
	return c.Status(201).JSON(resp)
}

// ─── USER: SİPARİŞLERİM ────────────────────────────────────────────────────

func GetMyOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	filter := c.Query("filter", "")
	whereExtra := ""
	if filter == "aktif" {
		whereExtra = " AND o.status IN ('bekliyor','onaylandi','hazirlaniyor','hazir','yolda')"
	} else if filter == "gecmis" {
		whereExtra = " AND o.status IN ('teslim_edildi','iptal')"
	}
	q := fmt.Sprintf(`
		SELECT %s
		FROM orders o
		JOIN businesses b ON b.id = o.business_id
		WHERE o.user_id = $1%s
		ORDER BY o.created_at DESC
		LIMIT 200
	`, orderSelectCols, whereExtra)
	rows, err := config.DB.Query(q, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Listelenemedi"})
	}
	defer rows.Close()
	var list []OrderResp
	for rows.Next() {
		o, err := scanOrderRow(rows)
		if err != nil {
			continue
		}
		items, _ := loadOrderItems(o.ID)
		o.Items = items
		list = append(list, *o)
	}
	if list == nil {
		list = []OrderResp{}
	}
	return c.JSON(list)
}

func GetMyOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	q := fmt.Sprintf(`
		SELECT %s
		FROM orders o JOIN businesses b ON b.id = o.business_id
		WHERE o.id = $1 AND o.user_id = $2
	`, orderSelectCols)
	o, err := scanOrderRow(config.DB.QueryRow(q, id, userID))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Sipariş bulunamadı"})
	}
	items, _ := loadOrderItems(o.ID)
	o.Items = items
	return c.JSON(o)
}

func CancelMyOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&body)
	reason := strings.TrimSpace(body.Reason)
	if len(reason) > 200 {
		reason = reason[:200]
	}

	var status, businessID string
	err := config.DB.QueryRow(`SELECT status, business_id FROM orders WHERE id = $1 AND user_id = $2`, id, userID).Scan(&status, &businessID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Sipariş bulunamadı"})
	}
	if status != "bekliyor" {
		return c.Status(400).JSON(fiber.Map{"error": "Bu durumda iptal edilemez"})
	}
	res, err := config.DB.Exec(`
		UPDATE orders SET status = 'iptal', cancelled_at = NOW(), cancelled_reason = NULLIF($1,''),
		                  cancelled_by = 'user'
		WHERE id = $2 AND user_id = $3 AND status = 'bekliyor'
	`, reason, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "İptal edilemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Sipariş zaten güncellenmiş"})
	}
	recordStatusChange(id, status, "iptal", "user", userID, reason)
	go func() {
		CreateNotification("", businessID, "order_cancelled", "Sipariş İptal", "Müşteri siparişi iptal etti", false)
	}()
	return c.JSON(fiber.Map{"message": "İptal edildi"})
}

func RateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if body.Rating < 1 || body.Rating > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Puan 1-5 arası olmalı"})
	}
	comment := strings.TrimSpace(body.Comment)
	if len(comment) > 300 {
		comment = comment[:300]
	}
	res, err := config.DB.Exec(`
		UPDATE orders SET rating = $1, rating_comment = NULLIF($2,''), rated_at = NOW()
		WHERE id = $3 AND user_id = $4 AND status = 'teslim_edildi' AND rating IS NULL
	`, body.Rating, comment, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Değerlendirme kaydedilemedi"})
	}
	return c.JSON(fiber.Map{"message": "Teşekkürler!"})
}

// ─── BUSINESS: SİPARİŞLER ──────────────────────────────────────────────────

func GetBusinessOrders(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	filter := c.Query("filter", "")
	whereExtra := ""
	switch filter {
	case "yeni":
		whereExtra = " AND o.status = 'bekliyor'"
	case "aktif":
		whereExtra = " AND o.status IN ('onaylandi','hazirlaniyor','hazir','yolda')"
	case "tamamlandi":
		whereExtra = " AND o.status = 'teslim_edildi'"
	case "iptal":
		whereExtra = " AND o.status = 'iptal'"
	}
	q := fmt.Sprintf(`
		SELECT %s
		FROM orders o JOIN businesses b ON b.id = o.business_id
		WHERE o.business_id = $1%s
		ORDER BY o.created_at DESC
		LIMIT 200
	`, orderSelectCols, whereExtra)
	rows, err := config.DB.Query(q, bID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Listelenemedi"})
	}
	defer rows.Close()
	var list []OrderResp
	for rows.Next() {
		o, err := scanOrderRow(rows)
		if err != nil {
			continue
		}
		items, _ := loadOrderItems(o.ID)
		o.Items = items
		list = append(list, *o)
	}
	if list == nil {
		list = []OrderResp{}
	}
	return c.JSON(list)
}

func GetBusinessOrder(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	id := c.Params("id")
	q := fmt.Sprintf(`
		SELECT %s
		FROM orders o JOIN businesses b ON b.id = o.business_id
		WHERE o.id = $1 AND o.business_id = $2
	`, orderSelectCols)
	o, err := scanOrderRow(config.DB.QueryRow(q, id, bID))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Sipariş bulunamadı"})
	}
	items, _ := loadOrderItems(o.ID)
	o.Items = items
	return c.JSON(o)
}

// State machine — sadece geçerli geçişlere izin ver
var validTransitions = map[string]map[string]bool{
	"bekliyor":     {"onaylandi": true, "iptal": true},
	"onaylandi":    {"hazirlaniyor": true, "iptal": true},
	"hazirlaniyor": {"hazir": true, "yolda": true, "iptal": true},
	"hazir":        {"yolda": true, "iptal": true},
	"yolda":        {"teslim_edildi": true},
}

func UpdateOrderStatus(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body struct {
		Status string `json:"status"`
		Reason string `json:"reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	var current, userID string
	err := config.DB.QueryRow(`SELECT status, COALESCE(user_id::text,'') FROM orders WHERE id = $1 AND business_id = $2`, id, bID).Scan(&current, &userID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Sipariş bulunamadı"})
	}

	allowed, ok := validTransitions[current]
	if !ok || !allowed[body.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "Bu durum geçişi yapılamaz"})
	}

	reason := strings.TrimSpace(body.Reason)
	if len(reason) > 200 {
		reason = reason[:200]
	}

	timestampCol := ""
	switch body.Status {
	case "onaylandi":
		timestampCol = "accepted_at"
	case "hazir":
		timestampCol = "ready_at"
	case "yolda":
		timestampCol = "delivering_at"
	case "teslim_edildi":
		timestampCol = "delivered_at"
	}

	var q string
	if body.Status == "iptal" {
		q = `UPDATE orders SET status = $1, cancelled_at = NOW(), cancelled_reason = NULLIF($2,''), cancelled_by = 'business'
		     WHERE id = $3 AND business_id = $4 AND status = $5`
	} else if timestampCol != "" {
		q = fmt.Sprintf(`UPDATE orders SET status = $1, %s = NOW() WHERE id = $3 AND business_id = $4 AND status = $5`, timestampCol)
	} else {
		q = `UPDATE orders SET status = $1 WHERE id = $3 AND business_id = $4 AND status = $5`
	}
	res, err := config.DB.Exec(q, body.Status, reason, id, bID, current)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Sipariş zaten güncellenmiş"})
	}

	recordStatusChange(id, current, body.Status, "business", bID, reason)
	if userID != "" {
		go func() {
			titleMap := map[string]string{
				"onaylandi":     "Siparişin Onaylandı",
				"hazirlaniyor":  "Siparişin Hazırlanıyor",
				"hazir":         "Siparişin Hazır",
				"yolda":         "Siparişin Yolda",
				"teslim_edildi": "Sipariş Teslim Edildi",
				"iptal":         "Sipariş İptal Edildi",
			}
			title := titleMap[body.Status]
			if title == "" {
				title = "Sipariş güncellendi"
			}
			CreateNotification(userID, "", "order_status", title, "", false)
		}()
	}
	return c.JSON(fiber.Map{"message": "Güncellendi", "status": body.Status})
}
