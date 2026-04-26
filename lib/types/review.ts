export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  order_id?: string;
  rating: number;
  comment: string;
  business_reply?: string;
  business_replied_at?: string;
  created_at: string;
}

export interface ReviewStats {
  count: number;
  average_rating: number;
  distribution: Record<string, number>;
}
