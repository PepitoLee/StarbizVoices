export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Starbiz Voices';
export const APP_TAGLINE = 'Voces de expertos para padres';
export const APP_DESCRIPTION = 'Escucha a profesionales de salud compartiendo su conocimiento en conversaciones íntimas diseñadas para padres.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const CONTENT_TYPES = {
  AUDIO: 'audio',
  PODCAST: 'podcast',
  PDF: 'pdf',
} as const;

export const USER_ROLES = {
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
} as const;

export const ACCESS_LEVELS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export const STORAGE_BUCKETS = {
  AUDIO: 'audio-files',
  PDF: 'pdf-files',
  THUMBNAILS: 'thumbnails',
  AVATARS: 'avatars',
} as const;

export const ROUTES = {
  HOME: '/home',
  SEARCH: '/search',
  LIBRARY: '/library',
  FAVORITES: '/library/favorites',
  HISTORY: '/library/history',
  DOWNLOADS: '/library/downloads',
  PLAYLISTS: '/library/playlists',
  PROFILE: '/profile',
  PREMIUM: '/premium',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
} as const;

export const PLAYER_SETTINGS = {
  DEFAULT_VOLUME: 0.8,
  SEEK_STEP: 10, // seconds
  SAVE_PROGRESS_INTERVAL: 5000, // ms
} as const;

export const CACHE_SETTINGS = {
  MAX_AUDIO_CACHE_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_CACHED_ITEMS: 50,
  CONTENT_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;
