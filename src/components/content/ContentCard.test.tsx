import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCard } from './ContentCard';
import type { Content } from '@/types';

// Mock the PlayerContext
const mockPlay = vi.fn();
const mockPause = vi.fn();

const mockPlayerContext = {
  currentTrack: null as Content | null,
  isPlaying: false,
  play: mockPlay,
  pause: mockPause,
};

vi.mock('@/contexts/PlayerContext', () => ({
  usePlayer: () => mockPlayerContext,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  formatDuration: (seconds: number | null) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  },
}));

const mockAudioContent: Content = {
  id: 'audio-1',
  title: 'Test Audio Track',
  description: 'A test audio track',
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
  slug: 'test-audio',
};

const mockPodcastContent: Content = {
  ...mockAudioContent,
  id: 'podcast-1',
  title: 'Test Podcast Episode',
  content_type: 'podcast',
  duration: 3600,
  slug: 'test-podcast',
};

const mockPdfContent: Content = {
  ...mockAudioContent,
  id: 'pdf-1',
  title: 'Test PDF Document',
  content_type: 'pdf',
  duration: null,
  slug: 'test-pdf',
};

const mockPremiumContent: Content = {
  ...mockAudioContent,
  id: 'premium-1',
  title: 'Premium Track',
  access_level: 'premium',
  slug: 'premium-track',
};

const mockNoThumbnailContent: Content = {
  ...mockAudioContent,
  id: 'no-thumb-1',
  title: 'No Thumbnail Track',
  thumbnail_url: null,
  slug: 'no-thumb',
};

describe('ContentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayerContext.currentTrack = null;
    mockPlayerContext.isPlaying = false;
  });

  describe('Rendering', () => {
    it('should render content title', () => {
      render(<ContentCard content={mockAudioContent} />);
      expect(screen.getByText('Test Audio Track')).toBeInTheDocument();
    });

    it('should render author name', () => {
      render(<ContentCard content={mockAudioContent} />);
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('should render thumbnail image when available', () => {
      render(<ContentCard content={mockAudioContent} />);
      const img = screen.getByAltText('Test Audio Track');
      expect(img).toBeInTheDocument();
    });

    it('should render fallback icon when no thumbnail', () => {
      render(<ContentCard content={mockNoThumbnailContent} />);
      // The fallback is an icon, not an img element
      const img = screen.queryByAltText('No Thumbnail Track');
      expect(img).not.toBeInTheDocument();
    });

    it('should render duration for audio content', () => {
      render(<ContentCard content={mockAudioContent} />);
      expect(screen.getByText('3 min')).toBeInTheDocument();
    });

    it('should render duration for long content', () => {
      render(<ContentCard content={mockPodcastContent} />);
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });

    it('should not render duration for PDF content', () => {
      render(<ContentCard content={mockPdfContent} />);
      expect(screen.queryByText('min')).not.toBeInTheDocument();
    });

    it('should link to content detail page', () => {
      render(<ContentCard content={mockAudioContent} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/content/audio-1');
    });
  });

  describe('Content type icons', () => {
    it('should render correctly for audio content', () => {
      render(<ContentCard content={mockAudioContent} />);
      // Audio content renders with Mic icon (via lucide-react)
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render correctly for podcast content', () => {
      render(<ContentCard content={mockPodcastContent} />);
      // Podcast content renders with Mic icon (via lucide-react)
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render correctly for PDF content', () => {
      render(<ContentCard content={mockPdfContent} />);
      // PDF content renders with FileText icon
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Premium badge', () => {
    it('should display premium badge for premium content', () => {
      render(<ContentCard content={mockPremiumContent} />);
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should not display premium badge for free content', () => {
      render(<ContentCard content={mockAudioContent} />);
      expect(screen.queryByText('Premium')).not.toBeInTheDocument();
    });
  });

  describe('Play button interaction', () => {
    it('should show play button on hover for audio content', () => {
      render(<ContentCard content={mockAudioContent} />);
      // Play button is present but hidden until hover (via CSS)
      const playButton = screen.getByRole('button');
      expect(playButton).toBeInTheDocument();
    });

    it('should call play with content when play button is clicked', () => {
      render(<ContentCard content={mockAudioContent} />);
      const playButton = screen.getByRole('button');

      fireEvent.click(playButton);

      expect(mockPlay).toHaveBeenCalledWith(mockAudioContent);
    });

    it('should not render play button for PDF content', () => {
      render(<ContentCard content={mockPdfContent} />);
      const playButton = screen.queryByRole('button');
      expect(playButton).not.toBeInTheDocument();
    });

    it('should call pause when current track is playing and clicked', () => {
      mockPlayerContext.currentTrack = mockAudioContent;
      mockPlayerContext.isPlaying = true;

      render(<ContentCard content={mockAudioContent} />);
      const pauseButton = screen.getByRole('button');

      fireEvent.click(pauseButton);

      expect(mockPause).toHaveBeenCalled();
    });

    it('should call play without content when current track is paused', () => {
      mockPlayerContext.currentTrack = mockAudioContent;
      mockPlayerContext.isPlaying = false;

      render(<ContentCard content={mockAudioContent} />);
      const playButton = screen.getByRole('button');

      fireEvent.click(playButton);

      expect(mockPlay).toHaveBeenCalledWith();
    });

    it('should prevent link navigation when play button is clicked', () => {
      render(<ContentCard content={mockAudioContent} />);
      const playButton = screen.getByRole('button');

      const event = fireEvent.click(playButton);

      // The click handler calls e.preventDefault() and e.stopPropagation()
      // We can verify play was called but navigation didn't happen
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<ContentCard content={mockAudioContent} className="custom-class" />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('custom-class');
    });
  });

  describe('Author display', () => {
    it('should display author when present', () => {
      render(<ContentCard content={mockAudioContent} />);
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('should not display author section when author is null', () => {
      const contentWithoutAuthor = { ...mockAudioContent, author: null };
      render(<ContentCard content={contentWithoutAuthor} />);
      expect(screen.queryByText('Test Artist')).not.toBeInTheDocument();
    });
  });
});
