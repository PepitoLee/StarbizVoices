// User types
export type UserRole = 'user' | 'premium' | 'admin';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_end_date: string | null;
  total_listening_time: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

// Content types
export type ContentType = 'audio' | 'podcast' | 'pdf';
export type AccessLevel = 'free' | 'premium';

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content_type: ContentType;
  access_level: AccessLevel;
  file_url: string;
  file_size: number | null;
  duration: number | null;
  thumbnail_url: string | null;
  waveform_data: number[] | null;
  author: string | null;
  narrator: string | null;
  release_date: string | null;
  category_id: string | null;
  tags: string[];
  podcast_series_id: string | null;
  episode_number: number | null;
  season_number: number | null;
  page_count: number | null;
  play_count: number;
  download_count: number;
  favorite_count: number;
  is_featured: boolean;
  is_published: boolean;
  is_explicit: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PodcastSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  access_level: AccessLevel;
  is_active: boolean;
  episode_count: number;
  total_duration: number;
  created_at: string;
  updated_at: string;
}

// Playlist types
export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  is_collaborative: boolean;
  item_count: number;
  total_duration: number;
  created_at: string;
  updated_at: string;
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  content_id: string;
  position: number;
  added_by: string | null;
  added_at: string;
  content?: Content;
}

// Favorites & History
export interface Favorite {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
  content?: Content;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  content_id: string;
  progress_seconds: number;
  completed: boolean;
  completion_percentage: number;
  listened_at: string;
  duration_listened: number;
  device_type: string | null;
  content?: Content;
}

// Subscription types
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  stripe_product_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Player types
export interface QueueItem {
  id: string;
  content: Content;
  addedAt: number;
}

export interface PlayerState {
  currentTrack: Content | null;
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  isLoading: boolean;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Download/Offline types
export interface DownloadedContent {
  id: string;
  contentId: string;
  title: string;
  thumbnail: string;
  duration: number;
  fileSize: number;
  downloadedAt: number;
  blob?: Blob;
}

export interface SyncQueueItem {
  id?: number;
  action: 'favorite' | 'unfavorite' | 'history' | 'playlist-add' | 'playlist-remove';
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}
