import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Player } from './Player';
import type { Content } from '@/types';

// Mock the PlayerContext
const mockToggle = vi.fn();
const mockPrev = vi.fn();
const mockNext = vi.fn();
const mockSeek = vi.fn();
const mockSetVolume = vi.fn();
const mockToggleMute = vi.fn();
const mockToggleRepeat = vi.fn();
const mockToggleShuffle = vi.fn();

const mockPlayerContext = {
  currentTrack: null as Content | null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 100,
  volume: 1,
  isMuted: false,
  repeat: 'none' as 'none' | 'one' | 'all',
  shuffle: false,
  toggle: mockToggle,
  prev: mockPrev,
  next: mockNext,
  seek: mockSeek,
  setVolume: mockSetVolume,
  toggleMute: mockToggleMute,
  toggleRepeat: mockToggleRepeat,
  toggleShuffle: mockToggleShuffle,
};

vi.mock('@/contexts/PlayerContext', () => ({
  usePlayer: () => mockPlayerContext,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  formatTime: (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
}));

const mockTrack: Content = {
  id: 'track-1',
  title: 'Test Song',
  description: 'A test song',
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
  slug: 'test-song',
};

describe('Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default values
    mockPlayerContext.currentTrack = null;
    mockPlayerContext.isPlaying = false;
    mockPlayerContext.isLoading = false;
    mockPlayerContext.progress = 0;
    mockPlayerContext.duration = 100;
    mockPlayerContext.volume = 1;
    mockPlayerContext.isMuted = false;
    mockPlayerContext.repeat = 'none';
    mockPlayerContext.shuffle = false;
  });

  describe('Empty state', () => {
    it('should display empty message when no track is selected', () => {
      render(<Player />);

      expect(screen.getByText('Selecciona una voz para escuchar')).toBeInTheDocument();
    });

    it('should have correct aria-label on empty state', () => {
      render(<Player />);

      const player = screen.getByRole('region', { name: 'Reproductor de audio' });
      expect(player).toBeInTheDocument();
    });
  });

  describe('With track loaded', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
    });

    it('should display track title', () => {
      render(<Player />);

      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    it('should display artist name', () => {
      render(<Player />);

      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('should display thumbnail image', () => {
      render(<Player />);

      const img = screen.getByAltText('Portada de Test Song');
      expect(img).toBeInTheDocument();
    });

    it('should display default author when no author', () => {
      mockPlayerContext.currentTrack = { ...mockTrack, author: null };
      render(<Player />);

      expect(screen.getByText('Experto')).toBeInTheDocument();
    });
  });

  describe('Playback controls', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
    });

    it('should call toggle when play button is clicked', () => {
      render(<Player />);

      const playButton = screen.getByRole('button', { name: 'Reproducir' });
      fireEvent.click(playButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should show pause button when playing', () => {
      mockPlayerContext.isPlaying = true;
      render(<Player />);

      const pauseButton = screen.getByRole('button', { name: 'Pausar' });
      expect(pauseButton).toBeInTheDocument();
    });

    it('should call prev when previous button is clicked', () => {
      render(<Player />);

      const prevButton = screen.getByRole('button', { name: 'Pista anterior' });
      fireEvent.click(prevButton);

      expect(mockPrev).toHaveBeenCalledTimes(1);
    });

    it('should call next when next button is clicked', () => {
      render(<Player />);

      const nextButton = screen.getByRole('button', { name: 'Siguiente pista' });
      fireEvent.click(nextButton);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  // Note: Shuffle control was removed in the editorial redesign
  // The new design focuses on a cleaner, more focused playback experience

  describe('Repeat control', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
    });

    it('should call toggleRepeat when repeat button is clicked', () => {
      render(<Player />);

      const repeatButton = screen.getByRole('button', { name: 'Repetir desactivado' });
      fireEvent.click(repeatButton);

      expect(mockToggleRepeat).toHaveBeenCalledTimes(1);
    });

    it('should show correct aria-label for repeat one', () => {
      mockPlayerContext.repeat = 'one';
      render(<Player />);

      const repeatButton = screen.getByRole('button', { name: 'Repetir una' });
      expect(repeatButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show correct aria-label for repeat all', () => {
      mockPlayerContext.repeat = 'all';
      render(<Player />);

      const repeatButton = screen.getByRole('button', { name: 'Repetir todas' });
      expect(repeatButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Volume control', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
    });

    it('should call toggleMute when mute button is clicked', () => {
      render(<Player />);

      const muteButton = screen.getByRole('button', { name: 'Silenciar' });
      fireEvent.click(muteButton);

      expect(mockToggleMute).toHaveBeenCalledTimes(1);
    });

    it('should show unmute label when muted', () => {
      mockPlayerContext.isMuted = true;
      render(<Player />);

      const unmuteButton = screen.getByRole('button', { name: 'Activar sonido' });
      expect(unmuteButton).toBeInTheDocument();
    });

    it('should show unmute label when volume is 0', () => {
      mockPlayerContext.volume = 0;
      render(<Player />);

      const unmuteButton = screen.getByRole('button', { name: 'Activar sonido' });
      expect(unmuteButton).toBeInTheDocument();
    });
  });

  describe('Progress display', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
      mockPlayerContext.progress = 65;
      mockPlayerContext.duration = 180;
    });

    it('should display formatted progress time', () => {
      render(<Player />);

      expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    it('should display formatted duration', () => {
      render(<Player />);

      expect(screen.getByText('3:00')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
      mockPlayerContext.isLoading = true;
    });

    it('should show loading spinner when loading', () => {
      render(<Player />);

      const loadingSpinner = screen.getByLabelText('Cargando');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should disable play button when loading', () => {
      render(<Player />);

      const playButton = screen.getByRole('button', { name: 'Reproducir' });
      expect(playButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPlayerContext.currentTrack = mockTrack;
    });

    it('should have sliders in the document', () => {
      render(<Player />);
      // Radix sliders are rendered
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
    });

    it('should have controls group role', () => {
      render(<Player />);
      const controlsGroup = screen.getByRole('group', { name: /Controles de reproducci/i });
      expect(controlsGroup).toBeInTheDocument();
    });

    it('should have volume group role', () => {
      render(<Player />);
      const volumeGroup = screen.getByRole('group', { name: 'Control de volumen y opciones' });
      expect(volumeGroup).toBeInTheDocument();
    });

    it('should have region role for player', () => {
      render(<Player />);
      const region = screen.getByRole('region', { name: 'Reproductor de audio' });
      expect(region).toBeInTheDocument();
    });
  });
});
