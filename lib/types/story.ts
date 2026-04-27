import type { SocialProfile } from "./social";

export interface SocialStory {
  id: string;
  author_id: string;
  author?: SocialProfile;
  media_url: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
  caption?: string;
  background_color?: string;
  duration_sec: number;
  views_count: number;
  created_at: string;
  expires_at: string;
  has_viewed?: boolean;
}

export interface StoryGroup {
  author_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
  stories: SocialStory[];
  all_seen: boolean;
}

export interface StoryViewer {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
  viewed_at: string;
}

export interface SocialNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
  // FAZ 2 batch fields
  actors?: Array<{
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  }>;
  count?: number;
  aggregation_key?: string;
  target_url?: string;
}
