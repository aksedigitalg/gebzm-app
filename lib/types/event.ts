// Etkinlik (Event) tipleri.

export type EventStatus = "taslak" | "yayinda" | "iptal" | "bitti";

export type EventUserStatus = "katiliyor" | "ilgileniyor" | "";

export interface EventCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  category_key?: string;
  category_label?: string;
  category_color?: string;
  description?: string;
  photo_url?: string;
  cover_url?: string;
  start_at: string; // ISO
  end_at?: string;
  location_name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  organizer?: string;
  contact_phone?: string;
  contact_url?: string;
  ticket_url?: string;
  price: number;
  status: EventStatus;
  interested_count: number;
  attending_count: number;
  user_status?: EventUserStatus;
  created_at: string;
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  taslak: "Taslak",
  yayinda: "Yayında",
  iptal: "İptal",
  bitti: "Bitti",
};

export const EVENT_STATUS_COLOR: Record<EventStatus, string> = {
  taslak: "#94a3b8",
  yayinda: "#22c55e",
  iptal: "#dc2626",
  bitti: "#64748b",
};
