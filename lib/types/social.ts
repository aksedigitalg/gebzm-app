export interface SocialProfile {
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  is_private: boolean;
  is_verified: boolean;
  is_banned: boolean;
  posts_count: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  // Viewer-relative
  is_following?: boolean;
  follow_pending?: boolean;
  is_me?: boolean;
}

export interface SocialMedia {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
}

export interface SocialPost {
  id: string;
  author_id: string;
  author?: SocialProfile;
  text?: string;
  media: SocialMedia[];
  parent_id?: string;
  repost_of_id?: string;
  repost_of?: SocialPost;
  quote_text?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count: number;
  created_at: string;
  // Viewer-relative
  my_reaction?: "like" | "dislike" | "";
  is_bookmarked?: boolean;
  is_reposted?: boolean;
}

export interface DMConversation {
  id: string;
  other_user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_at?: string;
  unread: number;
  last_sender_id?: string;
}

export interface DMMessage {
  id: string;
  sender_id: string;
  text?: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface FollowRequest {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  requested_at: string;
}

export interface TrendingHashtag {
  tag: string;
  posts_count: number;
}

export interface SocialReport {
  id: string;
  reporter_id: string;
  target_type: "post" | "profile";
  target_id: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  action_taken?: string;
  created_at: string;
  reporter_username?: string;
  reporter_display_name?: string;
}

export const REPORT_REASON_LABEL: Record<string, string> = {
  spam: "Spam / İstenmeyen",
  hate: "Nefret söylemi",
  violence: "Şiddet / Tehdit",
  harassment: "Taciz",
  fake: "Sahte / Yanıltıcı",
  sexual: "Cinsel içerik",
  other: "Diğer",
};
