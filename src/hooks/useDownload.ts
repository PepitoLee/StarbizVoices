'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  downloadContent,
  deleteDownload,
  isDownloaded,
  getDownloadsStorageSize,
} from '@/lib/db/indexeddb';
import type { Content } from '@/types';

export function useDownload(content: Content | null) {
  const [isDownloadedState, setIsDownloadedState] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (content?.id) {
      isDownloaded(content.id).then(setIsDownloadedState);
    }
  }, [content?.id]);

  const download = useCallback(async () => {
    if (!content) return false;

    setIsDownloading(true);
    setProgress(0);

    try {
      // Simulate progress (actual progress tracking would require XHR)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const success = await downloadContent(content);

      clearInterval(progressInterval);
      setProgress(100);

      if (success) {
        setIsDownloadedState(true);
      }

      return success;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    } finally {
      setIsDownloading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [content]);

  const remove = useCallback(async () => {
    if (!content?.id) return;

    await deleteDownload(content.id);
    setIsDownloadedState(false);

    // Notify service worker to remove cached audio
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller && content.file_url) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REMOVE_CACHED_AUDIO',
        url: content.file_url,
      });
    }
  }, [content?.id, content?.file_url]);

  return {
    isDownloaded: isDownloadedState,
    isDownloading,
    progress,
    download,
    remove,
  };
}

export function useDownloadStats() {
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    getDownloadsStorageSize().then(setStorageUsed);
  }, []);

  const refresh = useCallback(async () => {
    const size = await getDownloadsStorageSize();
    setStorageUsed(size);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return {
    storageUsed,
    formattedSize: formatSize(storageUsed),
    refresh,
  };
}
