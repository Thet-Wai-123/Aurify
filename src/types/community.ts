export type UserSummary = {
  id: string;
  display_name: string;
  avatar_url?: string;
  streak?: number;
  confidence?: number;
};

export type Post = {
  id: string;
  user_id: string;
  username: string;
  message: string;
  streak?: number;
  confidence?: number;
  created_at: string;
};

export type Badge = {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon?: string;
};

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  target_count: number;
};
