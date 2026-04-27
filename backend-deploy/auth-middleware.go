package middleware

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// parseToken — güvenli JWT parse: signing method ZORUNLU HS256, exp ZORUNLU geçerli
//
// jwt.Parse default'ı "alg: none" saldırısına karşı savunmasız değil mi?
// Aslında v5 default güvenli, ama explicit kontrol önemli — derinlemesine savunma.
func parseToken(tokenStr string) (jwt.MapClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, fmt.Errorf("server misconfigured")
	}
	token, err := jwt.Parse(
		tokenStr,
		func(t *jwt.Token) (interface{}, error) {
			// Signing method allowlist — yalnızca HS256 kabul
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(secret), nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithIssuedAt(),
		jwt.WithExpirationRequired(), // exp claim ZORUNLU
	)
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}
	return claims, nil
}

func getRole(c *fiber.Ctx) string {
	header := c.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	tokenStr := strings.TrimPrefix(header, "Bearer ")
	claims, err := parseToken(tokenStr)
	if err != nil {
		return ""
	}
	role, _ := claims["role"].(string)
	userID, _ := claims["id"].(string)
	if userID == "" {
		return ""
	}
	c.Locals("user_id", userID)
	c.Locals("role", role)
	return role
}

func AuthRequired(c *fiber.Ctx) error {
	if getRole(c) == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Yetkisiz erişim"})
	}
	return c.Next()
}

func BusinessRequired(c *fiber.Ctx) error {
	if getRole(c) != "business" {
		return c.Status(403).JSON(fiber.Map{"error": "İşletme hesabı gerekli"})
	}
	return c.Next()
}

func AdminRequired(c *fiber.Ctx) error {
	if getRole(c) != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Admin hesabı gerekli"})
	}
	return c.Next()
}

// WSAuth — WebSocket için query param'dan token oku
// NOT: Token URL'de ama HTTPS olduğu için TLS'in altında. Yine de logger token'ı maskeler.
func WSAuth(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Token gerekli"})
	}
	claims, err := parseToken(token)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Geçersiz token"})
	}
	role, _ := claims["role"].(string)
	userID, _ := claims["id"].(string)
	if userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Geçersiz token"})
	}
	c.Locals("user_id", userID)
	c.Locals("role", role)
	return c.Next()
}
