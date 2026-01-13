'use client';

import { memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import type { Content } from '@/types';
import { Play, Pause, FileText, Mic, Clock, Sparkles } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

interface ContentCardProps {
  content: Content;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}

const contentTypeIcons = {
  audio: Mic,
  podcast: Mic,
  pdf: FileText,
};

function ContentCardComponent({ content, className, variant = 'default' }: ContentCardProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayer();
  const isCurrentTrack = currentTrack?.id === content.id;
  const Icon = useMemo(() => contentTypeIcons[content.content_type], [content.content_type]);
  const durationText = useMemo(() => formatDuration(content.duration), [content.duration]);

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (content.content_type === 'pdf') {
        return;
      }

      if (isCurrentTrack && isPlaying) {
        pause();
      } else if (isCurrentTrack) {
        play();
      } else {
        play(content);
      }
    },
    [content, isCurrentTrack, isPlaying, pause, play]
  );

  if (variant === 'featured') {
    return (
      <Link href={`/content/${content.id}`} className={cn('group block', className)}>
        <div
          className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
          style={{
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Category icon */}
          <div className="icon-box mb-4">
            <Icon className="h-5 w-5" />
          </div>

          {/* Content info */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {content.title}
            </h3>

            {content.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {content.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {content.author && (
                  <span className="badge-pill text-xs">
                    {content.author}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {durationText && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {durationText}
                  </span>
                )}

                {content.content_type !== 'pdf' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'h-10 w-10 rounded-xl',
                      'transition-all duration-200',
                      isCurrentTrack && isPlaying
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary'
                    )}
                    style={isCurrentTrack && isPlaying ? {
                      boxShadow: '0 4px 12px oklch(0.65 0.18 25 / 0.3)',
                    } : undefined}
                    onClick={handlePlayClick}
                  >
                    {isCurrentTrack && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Premium indicator - now turquoise */}
          {content.access_level === 'premium' && (
            <div
              className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: 'oklch(0.70 0.12 185 / 0.15)',
                color: 'oklch(0.55 0.12 185)',
              }}
            >
              <Sparkles className="h-3 w-3" />
              Premium
            </div>
          )}

          {/* Hover gradient accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
            style={{
              background: 'linear-gradient(90deg, oklch(0.65 0.18 25) 0%, oklch(0.70 0.12 185) 100%)',
              transformOrigin: 'left',
            }}
          />
        </div>
      </Link>
    );
  }

  // Default and compact variants
  return (
    <Link href={`/content/${content.id}`} className={cn('group block', className)}>
      <div
        className={cn(
          'relative rounded-2xl bg-card border border-border/50 overflow-hidden',
          'transition-all duration-300',
          'hover:border-primary/30 hover:shadow-xl hover:-translate-y-1'
        )}
        style={{
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Thumbnail area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {content.thumbnail_url ? (
            <Image
              src={content.thumbnail_url}
              alt={content.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
              }}
            >
              <div className="icon-box">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )}

          {/* Play button overlay */}
          {content.content_type !== 'pdf' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-white text-primary shadow-2xl hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
                onClick={handlePlayClick}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
            </div>
          )}

          {/* Premium badge - turquoise style */}
          {content.access_level === 'premium' && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md"
              style={{
                background: 'oklch(0.70 0.12 185 / 0.9)',
                color: 'white',
                boxShadow: '0 2px 8px oklch(0.70 0.12 185 / 0.3)',
              }}
            >
              <Sparkles className="h-3 w-3" />
              Premium
            </div>
          )}

          {/* Duration badge */}
          {durationText && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-md">
              <Clock className="h-3 w-3" />
              {durationText}
            </div>
          )}

          {/* Playing indicator */}
          {isCurrentTrack && isPlaying && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md"
              style={{
                background: 'oklch(0.65 0.18 25 / 0.9)',
                color: 'white',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: 'white' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: 'white' }}
                />
              </span>
              Reproduciendo
            </div>
          )}
        </div>

        {/* Content info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {content.title}
          </h3>

          <div className="flex items-center gap-2">
            {content.author && (
              <span className="text-xs text-muted-foreground truncate">
                {content.author}
              </span>
            )}
            {content.category && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: 'oklch(0.55 0.12 185)' }}
                >
                  {content.category.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hover gradient accent - bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{
            background: 'linear-gradient(90deg, oklch(0.65 0.18 25) 0%, oklch(0.70 0.12 185) 100%)',
            transformOrigin: 'left',
          }}
        />
      </div>
    </Link>
  );
}

export const ContentCard = memo(ContentCardComponent);
