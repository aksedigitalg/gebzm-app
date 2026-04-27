package handlers

import (
	"database/sql"
	"strings"
	"time"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

type DeliverySettingsResp struct {
	BusinessID            string  `json:"business_id"`
	AcceptsOrders         bool    `json:"accepts_orders"`
	DeliveryFee           float64 `json:"delivery_fee"`
	FreeDeliveryThreshold float64 `json:"free_delivery_threshold,omitempty"`
	MinOrderAmount        float64 `json:"min_order_amount"`
	DeliveryRadiusKm      float64 `json:"delivery_radius_km"`
	EstimatedDeliveryMin  int     `json:"estimated_delivery_min"`
	AcceptsCash           bool    `json:"accepts_cash"`
	AcceptsCardAtDoor     bool    `json:"accepts_card_at_door"`
	AcceptsEft            bool    `json:"accepts_eft"`
	EftIban               string  `json:"eft_iban,omitempty"`
	EftBankName           string  `json:"eft_bank_name,omitempty"`
	EftAccountHolder      string  `json:"eft_account_holder,omitempty"`
	OpenHour              int     `json:"open_hour"`
	CloseHour             int     `json:"close_hour"`
	IsOpenNow             bool    `json:"is_open_now"`
}

func loadDeliverySettings(businessID string, includeIBAN bool) DeliverySettingsResp {
	var d DeliverySettingsResp
	d.BusinessID = businessID
	// Default değerler — eğer kayıt yoksa
	d.AcceptsCash = true
	d.AcceptsCardAtDoor = true
	d.DeliveryRadiusKm = 5
	d.EstimatedDeliveryMin = 30
	d.OpenHour = 10
	d.CloseHour = 23

	var freeThreshold sql.NullFloat64
	var iban, bankName, holder sql.NullString
	err := config.DB.QueryRow(`
		SELECT accepts_orders, delivery_fee, free_delivery_threshold, min_order_amount,
		       delivery_radius_km, estimated_delivery_min,
		       accepts_cash, accepts_card_at_door, accepts_eft,
		       eft_iban, eft_bank_name, eft_account_holder,
		       open_hour, close_hour
		FROM business_delivery_settings WHERE business_id = $1
	`, businessID).Scan(&d.AcceptsOrders, &d.DeliveryFee, &freeThreshold, &d.MinOrderAmount,
		&d.DeliveryRadiusKm, &d.EstimatedDeliveryMin,
		&d.AcceptsCash, &d.AcceptsCardAtDoor, &d.AcceptsEft,
		&iban, &bankName, &holder,
		&d.OpenHour, &d.CloseHour)
	if err == nil {
		if freeThreshold.Valid {
			d.FreeDeliveryThreshold = freeThreshold.Float64
		}
		if includeIBAN {
			d.EftIban = iban.String
			d.EftBankName = bankName.String
			d.EftAccountHolder = holder.String
		} else if d.AcceptsEft {
			// Public API: müşteri sadece sipariş onayında IBAN görür, listede görmesin
			d.EftIban = iban.String
			d.EftBankName = bankName.String
			d.EftAccountHolder = holder.String
		}
	}

	// is_open_now hesabı (Türkiye saati)
	loc, _ := time.LoadLocation("Europe/Istanbul")
	now := time.Now().In(loc)
	hour := now.Hour()
	d.IsOpenNow = d.AcceptsOrders && hour >= d.OpenHour && hour < d.CloseHour
	return d
}

// Public — restoran detayında müşteri görür
func GetBusinessDelivery(c *fiber.Ctx) error {
	id := c.Params("id")
	d := loadDeliverySettings(id, true)
	return c.JSON(d)
}

// Business — kendi ayarlarını getir
func GetMyDeliverySettings(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	d := loadDeliverySettings(bID, true)
	return c.JSON(d)
}

type DeliveryUpdateBody struct {
	AcceptsOrders         *bool    `json:"accepts_orders"`
	DeliveryFee           *float64 `json:"delivery_fee"`
	FreeDeliveryThreshold *float64 `json:"free_delivery_threshold"`
	MinOrderAmount        *float64 `json:"min_order_amount"`
	DeliveryRadiusKm      *float64 `json:"delivery_radius_km"`
	EstimatedDeliveryMin  *int     `json:"estimated_delivery_min"`
	AcceptsCash           *bool    `json:"accepts_cash"`
	AcceptsCardAtDoor     *bool    `json:"accepts_card_at_door"`
	AcceptsEft            *bool    `json:"accepts_eft"`
	EftIban               *string  `json:"eft_iban"`
	EftBankName           *string  `json:"eft_bank_name"`
	EftAccountHolder      *string  `json:"eft_account_holder"`
	OpenHour              *int     `json:"open_hour"`
	CloseHour             *int     `json:"close_hour"`
}

func validateIBAN(iban string) bool {
	cleaned := strings.ReplaceAll(strings.ToUpper(iban), " ", "")
	if len(cleaned) != 26 {
		return false
	}
	if !strings.HasPrefix(cleaned, "TR") {
		return false
	}
	for i := 2; i < len(cleaned); i++ {
		if cleaned[i] < '0' || cleaned[i] > '9' {
			return false
		}
	}
	return true
}

func UpdateMyDeliverySettings(c *fiber.Ctx) error {
	bID := c.Locals("user_id").(string)
	var body DeliveryUpdateBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}

	// IBAN doğrulama
	if body.EftIban != nil && *body.EftIban != "" {
		if !validateIBAN(*body.EftIban) {
			return c.Status(400).JSON(fiber.Map{"error": "IBAN formatı geçersiz (TR + 24 hane olmalı)"})
		}
		clean := strings.ReplaceAll(strings.ToUpper(*body.EftIban), " ", "")
		body.EftIban = &clean
	}

	// Saat doğrulama
	if body.OpenHour != nil && (*body.OpenHour < 0 || *body.OpenHour > 23) {
		return c.Status(400).JSON(fiber.Map{"error": "Açılış saati geçersiz"})
	}
	if body.CloseHour != nil && (*body.CloseHour < 1 || *body.CloseHour > 24) {
		return c.Status(400).JSON(fiber.Map{"error": "Kapanış saati geçersiz"})
	}
	if body.OpenHour != nil && body.CloseHour != nil && *body.OpenHour >= *body.CloseHour {
		return c.Status(400).JSON(fiber.Map{"error": "Açılış kapanıştan önce olmalı"})
	}

	// Sayısal min/max kontroller
	if body.DeliveryFee != nil && (*body.DeliveryFee < 0 || *body.DeliveryFee > 10000) {
		return c.Status(400).JSON(fiber.Map{"error": "Teslimat ücreti geçersiz"})
	}
	if body.MinOrderAmount != nil && (*body.MinOrderAmount < 0 || *body.MinOrderAmount > 100000) {
		return c.Status(400).JSON(fiber.Map{"error": "Min sipariş tutarı geçersiz"})
	}
	if body.DeliveryRadiusKm != nil && (*body.DeliveryRadiusKm < 0 || *body.DeliveryRadiusKm > 100) {
		return c.Status(400).JSON(fiber.Map{"error": "Yarıçap geçersiz"})
	}
	if body.EstimatedDeliveryMin != nil && (*body.EstimatedDeliveryMin < 1 || *body.EstimatedDeliveryMin > 999) {
		return c.Status(400).JSON(fiber.Map{"error": "Süre geçersiz"})
	}

	// String uzunluk kontrolü
	if body.EftBankName != nil && len(*body.EftBankName) > 100 {
		clean := (*body.EftBankName)[:100]
		body.EftBankName = &clean
	}
	if body.EftAccountHolder != nil && len(*body.EftAccountHolder) > 200 {
		clean := (*body.EftAccountHolder)[:200]
		body.EftAccountHolder = &clean
	}

	// UPSERT — yoksa oluştur, varsa güncelle
	_, err := config.DB.Exec(`
		INSERT INTO business_delivery_settings (
			business_id, accepts_orders, delivery_fee, free_delivery_threshold, min_order_amount,
			delivery_radius_km, estimated_delivery_min,
			accepts_cash, accepts_card_at_door, accepts_eft,
			eft_iban, eft_bank_name, eft_account_holder,
			open_hour, close_hour, updated_at
		) VALUES ($1, COALESCE($2, false), COALESCE($3, 0), $4, COALESCE($5, 0),
		          COALESCE($6, 5), COALESCE($7, 30),
		          COALESCE($8, true), COALESCE($9, true), COALESCE($10, false),
		          $11, $12, $13,
		          COALESCE($14, 10), COALESCE($15, 23), NOW())
		ON CONFLICT (business_id) DO UPDATE SET
			accepts_orders = COALESCE($2, business_delivery_settings.accepts_orders),
			delivery_fee = COALESCE($3, business_delivery_settings.delivery_fee),
			free_delivery_threshold = $4,
			min_order_amount = COALESCE($5, business_delivery_settings.min_order_amount),
			delivery_radius_km = COALESCE($6, business_delivery_settings.delivery_radius_km),
			estimated_delivery_min = COALESCE($7, business_delivery_settings.estimated_delivery_min),
			accepts_cash = COALESCE($8, business_delivery_settings.accepts_cash),
			accepts_card_at_door = COALESCE($9, business_delivery_settings.accepts_card_at_door),
			accepts_eft = COALESCE($10, business_delivery_settings.accepts_eft),
			eft_iban = $11,
			eft_bank_name = $12,
			eft_account_holder = $13,
			open_hour = COALESCE($14, business_delivery_settings.open_hour),
			close_hour = COALESCE($15, business_delivery_settings.close_hour),
			updated_at = NOW()
	`, bID,
		body.AcceptsOrders, body.DeliveryFee, body.FreeDeliveryThreshold, body.MinOrderAmount,
		body.DeliveryRadiusKm, body.EstimatedDeliveryMin,
		body.AcceptsCash, body.AcceptsCardAtDoor, body.AcceptsEft,
		body.EftIban, body.EftBankName, body.EftAccountHolder,
		body.OpenHour, body.CloseHour)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Kaydedilemedi"})
	}
	return c.JSON(fiber.Map{"message": "Kaydedildi"})
}
