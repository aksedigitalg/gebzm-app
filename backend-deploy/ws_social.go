package handlers

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
)

// ─────────────────────────────────────────────────────────────────────────────
// GebzemSosyal WebSocket Hub — Multiplexed realtime
//
// Tek connection: wss://gebzem.app/ws/social?token=JWT
// Client subscribe: {"action":"sub","channel":"feed:<userID>"}
// Server push:    {"channel":"<name>","type":"<event>","payload":{...}}
//
// Kanallar:
//   notif:<userID>   — bell update, yeni bildirim
//   feed:<userID>    — "yeni post" badge
//   dm:<userID>      — tüm DM mesajları (cid filtre client'ta)
//   post:<postID>    — live counter (like/comment/repost)
//   story:<userID>   — story görüntüleme push (sahibine)
//
// Güvenlik:
//   - JWT auth WSAuth middleware'inde — userID c.Locals'da
//   - Subscribe edilen kanal user'a aitse OK; başkasının notif/feed/dm/story
//     kanalına subscribe denemesi reddedilir
//   - post:<postID> public kabul (post zaten public)
//   - Heartbeat: 30sn ping/pong, 60sn timeout
//   - Per-connection rate limit: 60 msg/dakika
//   - Broadcast yok — sadece açık subscribe edilen kanallara push
// ─────────────────────────────────────────────────────────────────────────────

type socialWSClient struct {
	id       string
	userID   string
	conn     *websocket.Conn
	send     chan []byte
	channels map[string]bool
	closed   bool
	closeMu  sync.Mutex
	rateBkt  *tokenBucket
}

type tokenBucket struct {
	mu        sync.Mutex
	capacity  int
	tokens    int
	refill    time.Duration
	lastFill  time.Time
}

func newTokenBucket(cap int, refill time.Duration) *tokenBucket {
	return &tokenBucket{capacity: cap, tokens: cap, refill: refill, lastFill: time.Now()}
}

func (tb *tokenBucket) take() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	now := time.Now()
	add := int(now.Sub(tb.lastFill) / tb.refill)
	if add > 0 {
		tb.tokens = min(tb.capacity, tb.tokens+add)
		tb.lastFill = now
	}
	if tb.tokens <= 0 {
		return false
	}
	tb.tokens--
	return true
}

// min built-in olarak Go 1.21+ ile geliyor — kendi tanımına gerek yok

type SocialHub struct {
	mu       sync.RWMutex
	clients  map[string]*socialWSClient            // clientID → client
	channels map[string]map[string]*socialWSClient // channel → clientID → client
}

var hub = &SocialHub{
	clients:  make(map[string]*socialWSClient),
	channels: make(map[string]map[string]*socialWSClient),
}

// HubInstance — diğer handler'lardan push için erişilebilir global
func HubInstance() *SocialHub { return hub }

func (h *SocialHub) register(c *socialWSClient) {
	h.mu.Lock()
	h.clients[c.id] = c
	h.mu.Unlock()
}

func (h *SocialHub) unregister(c *socialWSClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, c.id)
	for ch := range c.channels {
		if subs, ok := h.channels[ch]; ok {
			delete(subs, c.id)
			if len(subs) == 0 {
				delete(h.channels, ch)
			}
		}
	}
	c.closeMu.Lock()
	if !c.closed {
		c.closed = true
		close(c.send)
	}
	c.closeMu.Unlock()
}

func (h *SocialHub) subscribe(c *socialWSClient, channel string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.channels[channel] == nil {
		h.channels[channel] = make(map[string]*socialWSClient)
	}
	h.channels[channel][c.id] = c
	c.channels[channel] = true
}

func (h *SocialHub) unsubscribe(c *socialWSClient, channel string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if subs, ok := h.channels[channel]; ok {
		delete(subs, c.id)
		if len(subs) == 0 {
			delete(h.channels, channel)
		}
	}
	delete(c.channels, channel)
}

// PushToChannel — kanaldaki tüm subscriber'lara mesaj yolla.
// Kapalı/yavaş client'lar atlanır (drop, slow consumer'a takılma).
// senderID verilirse o ID'li client'lar exclude edilir (echo önlemi).
func (h *SocialHub) PushToChannel(channel string, payload map[string]interface{}, excludeUserID string) {
	h.mu.RLock()
	subs := h.channels[channel]
	clients := make([]*socialWSClient, 0, len(subs))
	for _, c := range subs {
		if excludeUserID != "" && c.userID == excludeUserID {
			continue
		}
		clients = append(clients, c)
	}
	h.mu.RUnlock()

	msg := map[string]interface{}{
		"channel": channel,
		"type":    payload["type"],
		"payload": payload,
	}
	data, _ := json.Marshal(msg)

	for _, c := range clients {
		c.closeMu.Lock()
		if c.closed {
			c.closeMu.Unlock()
			continue
		}
		select {
		case c.send <- data:
		default:
			// Buffer dolu → slow consumer, drop
		}
		c.closeMu.Unlock()
	}
}

// PushToUser — kullanıcının tüm aktif kanallarına push (notif:, feed:, dm:)
func (h *SocialHub) PushToUser(userID, channelPrefix string, payload map[string]interface{}) {
	h.PushToChannel(channelPrefix+":"+userID, payload, "")
}

// canSubscribe — yetki kontrolü. user_id olmayan kanal isimlerine herkes
// subscribe olabilir (örn. post:<id>); user_id olanlarda sadece sahibi.
func canSubscribe(userID, channel string) bool {
	// "<prefix>:<value>" formatı
	for i, ch := range channel {
		if ch == ':' && i > 0 {
			prefix := channel[:i]
			value := channel[i+1:]
			if value == "" {
				return false
			}
			switch prefix {
			case "notif", "feed", "dm", "story":
				// Bu kanallar sadece sahibinin
				return userID == value
			case "post":
				// Public — herkes subscribe olabilir
				return true
			default:
				return false
			}
		}
	}
	return false
}

// HandleSocialWS — Fiber WS handler
func HandleSocialWS(c *websocket.Conn) {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		_ = c.Close()
		return
	}

	// Client init
	clientID := uid + ":" + time.Now().Format("150405.000000")
	client := &socialWSClient{
		id:       clientID,
		userID:   uid,
		conn:     c,
		send:     make(chan []byte, 64),
		channels: make(map[string]bool),
		rateBkt:  newTokenBucket(60, time.Second), // 60 msg/dk
	}
	hub.register(client)

	// Otomatik default subscribe: notif + feed + dm + story (kullanıcının kendi kanalları)
	hub.subscribe(client, "notif:"+uid)
	hub.subscribe(client, "feed:"+uid)
	hub.subscribe(client, "dm:"+uid)
	hub.subscribe(client, "story:"+uid)

	// Welcome
	welcome, _ := json.Marshal(map[string]interface{}{
		"channel": "system", "type": "connected",
		"payload": map[string]interface{}{"user_id": uid},
	})
	_ = c.WriteMessage(websocket.TextMessage, welcome)

	// Writer goroutine — send channel'ı dinler
	done := make(chan struct{})
	go func() {
		defer close(done)
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case msg, ok := <-client.send:
				if !ok {
					return
				}
				_ = c.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
					return
				}
			case <-ticker.C:
				_ = c.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()

	// Reader (ana goroutine — inbound mesajları)
	c.SetReadLimit(4096)
	_ = c.SetReadDeadline(time.Now().Add(70 * time.Second))
	c.SetPongHandler(func(string) error {
		_ = c.SetReadDeadline(time.Now().Add(70 * time.Second))
		return nil
	})

	for {
		_, raw, err := c.ReadMessage()
		if err != nil {
			break
		}
		_ = c.SetReadDeadline(time.Now().Add(70 * time.Second))

		// Rate limit
		if !client.rateBkt.take() {
			continue
		}

		var msg struct {
			Action  string `json:"action"`
			Channel string `json:"channel"`
		}
		if err := json.Unmarshal(raw, &msg); err != nil {
			continue
		}

		switch msg.Action {
		case "ping":
			pong, _ := json.Marshal(map[string]interface{}{"type": "pong"})
			select {
			case client.send <- pong:
			default:
			}
		case "sub":
			if msg.Channel == "" || len(msg.Channel) > 200 {
				continue
			}
			if !canSubscribe(uid, msg.Channel) {
				deny, _ := json.Marshal(map[string]interface{}{
					"type": "error", "payload": map[string]interface{}{"error": "forbidden", "channel": msg.Channel},
				})
				select {
				case client.send <- deny:
				default:
				}
				continue
			}
			// Max 20 channel per client
			if len(client.channels) >= 20 {
				continue
			}
			hub.subscribe(client, msg.Channel)
			ack, _ := json.Marshal(map[string]interface{}{
				"type": "subscribed", "channel": msg.Channel,
			})
			select {
			case client.send <- ack:
			default:
			}
		case "unsub":
			if msg.Channel != "" {
				hub.unsubscribe(client, msg.Channel)
			}
		}
	}

	// Cleanup
	hub.unregister(client)
	<-done
	_ = c.Close()
	log.Printf("ws disconnect: user=%s", uid)
}
