import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PlayerProvider, usePlayer } from './PlayerContext';
import type { Content, QueueItem } from '@/types';
import type { ReactNode } from 'react';

// Mock the constants
vi.mock('@/lib/constants', () => ({
  PLAYER_SETTINGS: {
    DEFAULT_VOLUME: 1,
    SEEK_STEP: 10,
  },
}));

// Mock nanoid to return predictable values
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9)),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockContent: Content = {
  id: 'content-1',
  title: 'Test Track',
  description: 'Test description',
  content_type: 'audio',
  file_url: 'https://example.com/audio.mp3',
  thumbnail_url: 'https://example.com/thumb.jpg',
  author: 'Test Artist',
  duration: 180,
  access_level: 'free',
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  category_id: 'cat-1',
  slug: 'test-track',
};

const mockContent2: Content = {
  ...mockContent,
  id: 'content-2',
  title: 'Test Track 2',
  slug: 'test-track-2',
};

const mockContent3: Content = {
  ...mockContent,
  id: 'content-3',
  title: 'Test Track 3',
  slug: 'test-track-3',
};

function wrapper({ children }: { children: ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}

describe('PlayerContext', () => {
  describe('usePlayer hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePlayer());
      }).toThrow('usePlayer must be used within a PlayerProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.currentTrack).toBeNull();
      expect(result.current.queue).toEqual([]);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.volume).toBe(1);
      expect(result.current.isMuted).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.duration).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.repeat).toBe('none');
      expect(result.current.shuffle).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Volume controls', () => {
    it('should update volume', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it('should toggle mute', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
    });
  });

  describe('Queue operations', () => {
    it('should add content to queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockContent);
      });

      expect(result.current.queue.length).toBe(1);
      expect(result.current.queue[0].content).toEqual(mockContent);
    });

    it('should remove content from queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockContent);
      });

      const queueItemId = result.current.queue[0].id;

      act(() => {
        result.current.removeFromQueue(queueItemId);
      });

      expect(result.current.queue.length).toBe(0);
    });

    it('should clear queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockContent);
        result.current.addToQueue(mockContent2);
      });

      expect(result.current.queue.length).toBe(2);

      act(() => {
        result.current.clearQueue();
      });

      expect(result.current.queue.length).toBe(0);
      expect(result.current.currentIndex).toBe(-1);
    });
  });

  describe('Playback controls', () => {
    it('should have play function defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.play).toBe('function');
    });

    it('should have playPlaylist function defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.playPlaylist).toBe('function');
    });

    it('should have pause and toggle functions defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
    });
  });

  describe('Repeat mode', () => {
    it('should cycle through repeat modes', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.repeat).toBe('none');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('one');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('all');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('none');
    });
  });

  describe('Shuffle mode', () => {
    it('should toggle shuffle', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.shuffle).toBe(false);

      act(() => {
        result.current.toggleShuffle();
      });
      expect(result.current.shuffle).toBe(true);

      act(() => {
        result.current.toggleShuffle();
      });
      expect(result.current.shuffle).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      // Error would be set by audio errors in real usage
      // We can test clearError functionality
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should have next function defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.next).toBe('function');
    });

    it('should have prev function defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.prev).toBe('function');
    });

    it('should have seek functions defined', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });
      expect(typeof result.current.seek).toBe('function');
      expect(typeof result.current.seekForward).toBe('function');
      expect(typeof result.current.seekBackward).toBe('function');
    });
  });
});
