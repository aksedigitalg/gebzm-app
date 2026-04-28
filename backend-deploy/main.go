package main

import (
	"log"
	"os"
	"strings"
	"time"

	"gebzem-api/config"
	"gebzem-api/handlers"
	"gebzem-api/middleware"
	"gebzem-api/routes"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConnectDB()

	// JWT_SECRET zorunlu — eksikse başlatma
	if strings.TrimSpace(os.Getenv("JWT_SECRET")) == "" {
		log.Fatal("FATAL: JWT_SECRET environment variable not set")
	}

	app := fiber.New(fiber.Config{
		AppName:               "Gebzem API v1.0",
		BodyLimit:             100 * 1024 * 1024, // 100 MB (video upload için)
		ReadTimeout:           30 * time.Second,
		WriteTimeout:          30 * time.Second,
		IdleTimeout:           60 * time.Second,
		DisableStartupMessage: false,
		// Hata yakalama: panic yerine 500 dönsün
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			// Production'da iç hatayı sızdırma
			msg := "Sunucu hatası"
			if code >= 400 && code < 500 {
				msg = err.Error()
			}
			return c.Status(code).JSON(fiber.Map{"error": msg})
		},
	})

	// Recover: panic'leri yakala, sunucu çökmesin
	app.Use(recover.New(recover.Config{EnableStackTrace: false}))

	// Request ID: her isteğe X-Request-Id header (debug + log için)
	app.Use(requestid.New())

	// Helmet: güvenlik header'ları
	// CSP'yi gevşek tutuyoruz — çünkü API restoran/admin sayfalarını render etmiyor (sadece JSON)
	app.Use(helmet.New(helmet.Config{
		XSSProtection:             "1; mode=block",
		ContentTypeNosniff:        "nosniff",
		XFrameOptions:             "DENY",
		ReferrerPolicy:            "strict-origin-when-cross-origin",
		HSTSMaxAge:                63072000, // 2 yıl
		HSTSPreloadEnabled:        true,
		HSTSExcludeSubdomains:     false,
		ContentSecurityPolicy:     "default-src 'self'", // API yalnızca kendine
		PermissionPolicy:          "geolocation=(), microphone=(), camera=()",
		CrossOriginEmbedderPolicy: "credentialless",
		CrossOriginOpenerPolicy:   "same-origin",
		CrossOriginResourcePolicy: "cross-origin",
	}))

	// CORS: sadece izinli origin'ler
	allowedOrigins := os.Getenv("CORS_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "https://gebzem.app,https://www.gebzem.app,http://localhost:3000"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowCredentials: false, // Bearer token kullandığımız için cookie gereksiz
		MaxAge:           86400, // 24sa preflight cache
	}))

	// Logger — token query param'ı maskele (info disclosure)
	app.Use(logger.New(logger.Config{
		Format:     "${time} | ${status} | ${latency} | ${ip} | ${method} | ${path} | ${locals:requestid}\n",
		TimeFormat: "15:04:05",
	}))

	// Genel rate limit: IP başına dakikada 200 istek
	app.Use(limiter.New(limiter.Config{
		Max:        200,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Çok fazla istek. Lütfen bir dakika bekleyin.",
			})
		},
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "message": "Gebzem API çalışıyor"})
	})

	// Health check (uptime monitoring için)
	app.Get("/health", func(c *fiber.Ctx) error {
		if err := config.DB.Ping(); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "db_down"})
		}
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// ─── GebzemSosyal WebSocket (multiplexed) ───
	// /ws/social?token=JWT — tüm sosyal realtime bu kanaldan gider
	// (notif:, feed:, dm:, story:, post:)
	app.Get("/ws/social",
		// 1. Origin allowlist + handshake limit
		func(c *fiber.Ctx) error {
			if !websocket.IsWebSocketUpgrade(c) {
				return c.Status(426).JSON(fiber.Map{"error": "WebSocket upgrade gerekli"})
			}
			// CSWSH koruma: Origin whitelist
			origin := c.Get("Origin")
			if origin != "" {
				ok := false
				for _, allowed := range strings.Split(allowedOrigins, ",") {
					if strings.TrimSpace(allowed) == origin {
						ok = true
						break
					}
				}
				if !ok {
					return c.Status(403).JSON(fiber.Map{"error": "Origin reddedildi"})
				}
			}
			return c.Next()
		},
		// 2. JWT auth (token query param'dan)
		middleware.WSAuth,
		// 3. WS upgrade handler
		websocket.New(
			handlers.HandleSocialWS,
			websocket.Config{
				HandshakeTimeout: 10 * time.Second,
				ReadBufferSize:   4096,
				WriteBufferSize:  4096,
				EnableCompression: false, // CRIME saldırı tedbirine gerek yok ama kapalı tutalım
			},
		),
	)

	// ─── Story cleanup cron (saatte bir expired stories soft-delete) ───
	handlers.StartStoryCleanupCron()

	routes.Setup(app)

	// ─── GebzemSosyal FAZ 2 — Stories + ek bildirim endpoint'leri ───
	// Mevcut routes.Setup(app)'i bozmadan ek route'lar
	api := app.Group("/api/v1")

	// Public — sadece username ile aktif story kontrolü (avatar ring için)
	api.Get("/social/profile/:username/stories", middleware.AuthRequired, handlers.GetUserStories)

	// Stories — auth + rate limit
	storyCreateLimit := limiter.New(limiter.Config{
		Max:        10,
		Expiration: 1 * time.Hour,
		KeyGenerator: func(c *fiber.Ctx) string {
			if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
				return "story:" + uid
			}
			return "story:" + c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{"error": "Saatte 10 story limitini aştın"})
		},
	})
	storyReplyLimit := limiter.New(limiter.Config{
		Max:        30,
		Expiration: 5 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
				return "sreply:" + uid
			}
			return "sreply:" + c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{"error": "Çok hızlı story cevabı yazıyorsun"})
		},
	})

	api.Get("/social/stories", middleware.AuthRequired, handlers.GetActiveStories)
	api.Post("/social/stories", middleware.AuthRequired, storyCreateLimit, handlers.CreateStory)
	api.Get("/social/stories/:id", middleware.AuthRequired, handlers.GetStory)
	api.Delete("/social/stories/:id", middleware.AuthRequired, handlers.DeleteStory)
	api.Get("/social/stories/:id/viewers", middleware.AuthRequired, handlers.GetStoryViewers)
	api.Post("/social/stories/:id/reply", middleware.AuthRequired, storyReplyLimit, handlers.ReplyToStory)

	// DM mark-read — WS event sonrası mesaj listesini re-fetch etmeden okundu işareti
	api.Post("/social/dm/:conversationId/read", middleware.AuthRequired, handlers.MarkDMRead)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
