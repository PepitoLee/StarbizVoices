import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Content } from '@/types';

interface AudioAppDB extends DBSchema {
  downloads: {
    key: string;
    value: {
      id: string;
      content: Content;
      blob: Blob;
      downloadedAt: number;
      size: number;
    };
    indexes: { 'by-date': number };
  };
  playbackProgress: {
    key: string;
    value: {
      contentId: string;
      progress: number;
      duration: number;
      updatedAt: number;
    };
  };
  offlineQueue: {
    key: string;
    value: {
      id: string;
      action: 'favorite' | 'unfavorite' | 'history';
      contentId: string;
      createdAt: number;
    };
  };
}

const DB_NAME = 'audioapp-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AudioAppDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AudioAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Downloads store
        if (!db.objectStoreNames.contains('downloads')) {
          const downloadsStore = db.createObjectStore('downloads', { keyPath: 'id' });
          downloadsStore.createIndex('by-date', 'downloadedAt');
        }

        // Playback progress store
        if (!db.objectStoreNames.contains('playbackProgress')) {
          db.createObjectStore('playbackProgress', { keyPath: 'contentId' });
        }

        // Offline queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Downloads
export async function saveDownload(content: Content, blob: Blob) {
  const db = await getDB();
  await db.put('downloads', {
    id: content.id,
    content,
    blob,
    downloadedAt: Date.now(),
    size: blob.size,
  });
}

export async function getDownload(contentId: string) {
  const db = await getDB();
  return db.get('downloads', contentId);
}

export async function getAllDownloads() {
  const db = await getDB();
  return db.getAllFromIndex('downloads', 'by-date');
}

export async function deleteDownload(contentId: string) {
  const db = await getDB();
  await db.delete('downloads', contentId);
}

export async function isDownloaded(contentId: string) {
  const db = await getDB();
  const download = await db.get('downloads', contentId);
  return !!download;
}

export async function getDownloadsStorageSize() {
  const db = await getDB();
  const downloads = await db.getAll('downloads');
  return downloads.reduce((total, download) => total + download.size, 0);
}

// Playback progress
export async function savePlaybackProgress(
  contentId: string,
  progress: number,
  duration: number
) {
  const db = await getDB();
  await db.put('playbackProgress', {
    contentId,
    progress,
    duration,
    updatedAt: Date.now(),
  });
}

export async function getPlaybackProgress(contentId: string) {
  const db = await getDB();
  return db.get('playbackProgress', contentId);
}

// Offline queue
export async function addToOfflineQueue(
  action: 'favorite' | 'unfavorite' | 'history',
  contentId: string
) {
  const db = await getDB();
  await db.put('offlineQueue', {
    id: `${action}-${contentId}-${Date.now()}`,
    action,
    contentId,
    createdAt: Date.now(),
  });
}

export async function getOfflineQueue() {
  const db = await getDB();
  return db.getAll('offlineQueue');
}

export async function clearOfflineQueue() {
  const db = await getDB();
  const tx = db.transaction('offlineQueue', 'readwrite');
  await tx.objectStore('offlineQueue').clear();
}

// Utility functions
export async function downloadContent(content: Content): Promise<boolean> {
  if (!content.file_url) return false;

  try {
    const response = await fetch(content.file_url);
    if (!response.ok) throw new Error('Failed to download');

    const blob = await response.blob();
    await saveDownload(content, blob);

    // Also notify service worker to cache the audio URL
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_AUDIO',
        url: content.file_url,
      });
    }

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

export async function getOfflineAudioUrl(contentId: string): Promise<string | null> {
  const download = await getDownload(contentId);
  if (!download) return null;

  return URL.createObjectURL(download.blob);
}

export async function syncOfflineActions(supabase: any, userId: string) {
  const queue = await getOfflineQueue();

  for (const item of queue) {
    try {
      switch (item.action) {
        case 'favorite':
          await supabase.from('favorites').insert({
            user_id: userId,
            content_id: item.contentId,
          });
          break;
        case 'unfavorite':
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('content_id', item.contentId);
          break;
        case 'history':
          await supabase.from('listening_history').upsert({
            user_id: userId,
            content_id: item.contentId,
            last_played_at: new Date(item.createdAt).toISOString(),
          });
          break;
      }
    } catch (error) {
      console.error('Failed to sync offline action:', error);
    }
  }

  await clearOfflineQueue();
}
