package handlers

import (
	"database/sql"
	"strings"

	"gebzem-api/config"

	"github.com/gofiber/fiber/v2"
)

type AddressResp struct {
	ID           string   `json:"id"`
	UserID       string   `json:"user_id,omitempty"`
	Label        string   `json:"label"`
	Address      string   `json:"address"`
	District     string   `json:"district,omitempty"`
	Lat          *float64 `json:"lat,omitempty"`
	Lng          *float64 `json:"lng,omitempty"`
	ContactPhone string   `json:"contact_phone,omitempty"`
	ContactName  string   `json:"contact_name,omitempty"`
	IsDefault    bool     `json:"is_default"`
	CreatedAt    string   `json:"created_at"`
}

func GetMyAddresses(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	rows, err := config.DB.Query(`
		SELECT id, COALESCE(label,''), address, COALESCE(district,''),
		       lat, lng, COALESCE(contact_phone,''), COALESCE(contact_name,''),
		       is_default, created_at
		FROM user_addresses WHERE user_id = $1
		ORDER BY is_default DESC, created_at DESC
	`, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Adresler alınamadı"})
	}
	defer rows.Close()
	var list []AddressResp
	for rows.Next() {
		var a AddressResp
		var lat, lng sql.NullFloat64
		if err := rows.Scan(&a.ID, &a.Label, &a.Address, &a.District,
			&lat, &lng, &a.ContactPhone, &a.ContactName,
			&a.IsDefault, &a.CreatedAt); err != nil {
			continue
		}
		if lat.Valid {
			v := lat.Float64
			a.Lat = &v
		}
		if lng.Valid {
			v := lng.Float64
			a.Lng = &v
		}
		list = append(list, a)
	}
	if list == nil {
		list = []AddressResp{}
	}
	return c.JSON(list)
}

type AddressBody struct {
	Label        string   `json:"label"`
	Address      string   `json:"address"`
	District     string   `json:"district"`
	Lat          *float64 `json:"lat"`
	Lng          *float64 `json:"lng"`
	ContactPhone string   `json:"contact_phone"`
	ContactName  string   `json:"contact_name"`
	IsDefault    bool     `json:"is_default"`
}

func validateAddress(b *AddressBody) string {
	b.Address = strings.TrimSpace(b.Address)
	b.Label = strings.TrimSpace(b.Label)
	b.District = strings.TrimSpace(b.District)
	b.ContactPhone = strings.TrimSpace(b.ContactPhone)
	b.ContactName = strings.TrimSpace(b.ContactName)
	if len(b.Address) < 10 {
		return "Adresi detaylı yaz (min 10 karakter)"
	}
	if len(b.Address) > 1000 {
		return "Adres çok uzun"
	}
	if len(b.Label) > 50 {
		b.Label = b.Label[:50]
	}
	if len(b.District) > 100 {
		b.District = b.District[:100]
	}
	if len(b.ContactPhone) > 20 {
		b.ContactPhone = b.ContactPhone[:20]
	}
	if len(b.ContactName) > 100 {
		b.ContactName = b.ContactName[:100]
	}
	if b.Lat != nil && (*b.Lat < -90 || *b.Lat > 90) {
		return "Geçersiz koordinat"
	}
	if b.Lng != nil && (*b.Lng < -180 || *b.Lng > 180) {
		return "Geçersiz koordinat"
	}
	return ""
}

func CreateAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	var body AddressBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if msg := validateAddress(&body); msg != "" {
		return c.Status(400).JSON(fiber.Map{"error": msg})
	}

	// Eğer default ise diğerlerini false yap
	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Hata"})
	}
	defer tx.Rollback()

	if body.IsDefault {
		_, err := tx.Exec(`UPDATE user_addresses SET is_default = false WHERE user_id = $1`, userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Hata"})
		}
	}

	var id string
	err = tx.QueryRow(`
		INSERT INTO user_addresses (user_id, label, address, district, lat, lng,
		                            contact_phone, contact_name, is_default)
		VALUES ($1, NULLIF($2,''), $3, NULLIF($4,''), $5, $6,
		        NULLIF($7,''), NULLIF($8,''), $9)
		RETURNING id
	`, userID, body.Label, body.Address, body.District, body.Lat, body.Lng,
		body.ContactPhone, body.ContactName, body.IsDefault).Scan(&id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Adres kaydedilemedi"})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Adres kaydedilemedi"})
	}
	return c.Status(201).JSON(fiber.Map{"id": id})
}

func UpdateAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	var body AddressBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Geçersiz istek"})
	}
	if msg := validateAddress(&body); msg != "" {
		return c.Status(400).JSON(fiber.Map{"error": msg})
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Hata"})
	}
	defer tx.Rollback()

	if body.IsDefault {
		_, err := tx.Exec(`UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND id != $2`, userID, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Hata"})
		}
	}

	res, err := tx.Exec(`
		UPDATE user_addresses
		SET label = NULLIF($1,''), address = $2, district = NULLIF($3,''),
		    lat = $4, lng = $5,
		    contact_phone = NULLIF($6,''), contact_name = NULLIF($7,''),
		    is_default = $8
		WHERE id = $9 AND user_id = $10
	`, body.Label, body.Address, body.District, body.Lat, body.Lng,
		body.ContactPhone, body.ContactName, body.IsDefault, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Adres bulunamadı"})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Güncellenemedi"})
	}
	return c.JSON(fiber.Map{"message": "Güncellendi"})
}

func DeleteAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")
	res, err := config.DB.Exec(`DELETE FROM user_addresses WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Silinemedi"})
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Adres bulunamadı"})
	}
	return c.JSON(fiber.Map{"message": "Silindi"})
}
