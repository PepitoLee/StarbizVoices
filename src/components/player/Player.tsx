'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn, formatTime } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Mic,
  Gauge,
} from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function PlayerComponent() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    duration,
    volume,
    isMuted,
    repeat,
    toggle,
    prev,
    next,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
  } = usePlayer();

  const [playbackRate, setPlaybackRate] = useState(1);

  const progressText = useMemo(() => formatTime(progress), [progress]);
  const durationText = useMemo(() => formatTime(duration), [duration]);

  const handleSeek = useCallback(
    ([value]: number[]) => {
      seek(value);
    },
    [seek]
  );

  const handleVolumeChange = useCallback(
    ([value]: number[]) => {
      setVolume(value / 100);
    },
    [setVolume]
  );

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    // Note: actual playback rate change would need to be implemented in PlayerContext
  }, []);

  const repeatLabel = useMemo(() => {
    switch (repeat) {
      case 'one':
        return 'Repetir una';
      case 'all':
        return 'Repetir todas';
      default:
        return 'Repetir desactivado';
    }
  }, [repeat]);

  if (!currentTrack) {
    return (
      <div
        className="player-glass fixed bottom-[60px] md:bottom-0 left-0 right-0 z-50 h-24"
        role="region"
        aria-label="Reproductor de audio"
      >
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
              }}
            >
              <Mic className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">Selecciona una voz para escuchar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="player-glass fixed bottom-[60px] md:bottom-0 left-0 right-0 z-50 h-24"
      role="region"
      aria-label="Reproductor de audio"
    >
      <div className="flex h-full items-center gap-4 px-6">
        {/* Track info */}
        <div className="flex items-center gap-4 min-w-0 w-[280px]">
          <div
            className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted"
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {currentTrack.thumbnail_url ? (
              <Image
                src={currentTrack.thumbnail_url}
                alt={`Portada de ${currentTrack.title}`}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.2) 0%, oklch(0.70 0.12 185 / 0.15) 100%)',
                }}
              >
                <Mic className="h-6 w-6 text-primary/60" aria-hidden="true" />
              </div>
            )}

            {/* Playing indicator on thumbnail */}
            {isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '60%', animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-snug">{currentTrack.title}</p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {currentTrack.author || 'Experto'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div
          className="flex flex-1 flex-col items-center gap-2"
          role="group"
          aria-label="Controles de reproducción"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              onClick={prev}
              aria-label="Pista anterior"
            >
              <SkipBack className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* Main play button with gradient */}
            <button
              className="btn-play h-14 w-14 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              onClick={toggle}
              disabled={isLoading}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isLoading ? (
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-label="Cargando"
                />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" aria-hidden="true" />
              )}
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              onClick={next}
              aria-label="Siguiente pista"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="flex w-full max-w-lg items-center gap-3">
            <span
              className="w-10 text-right text-xs text-muted-foreground tabular-nums font-medium"
              aria-hidden="true"
            >
              {progressText}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
                aria-label="Progreso de reproducción"
                aria-valuetext={`${progressText} de ${durationText}`}
              />
            </div>
            <span className="w-10 text-xs text-muted-foreground tabular-nums font-medium" aria-hidden="true">
              {durationText}
            </span>
          </div>
        </div>

        {/* Volume & extras */}
        <div
          className="hidden md:flex items-center gap-2 w-[280px] justify-end"
          role="group"
          aria-label="Control de volumen y opciones"
        >
          {/* Playback speed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60"
                aria-label="Velocidad de reproducción"
              >
                <Gauge className="h-3.5 w-3.5 mr-1.5" />
                {playbackRate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-24 rounded-xl">
              {playbackRates.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={cn(
                    'justify-center font-semibold rounded-lg',
                    rate === playbackRate && 'bg-primary/10 text-primary'
                  )}
                >
                  {rate}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Repeat */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg transition-all',
              repeat !== 'none'
                ? 'text-primary hover:text-primary bg-primary/10 hover:bg-primary/15'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
            onClick={toggleRepeat}
            aria-label={repeatLabel}
            aria-pressed={repeat !== 'none'}
          >
            {repeat === 'one' ? (
              <Repeat1 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Repeat className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? 'Activar sonido' : 'Silenciar'}
              aria-pressed={isMuted}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
              aria-label="Volumen"
              aria-valuetext={`${Math.round(isMuted ? 0 : volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Player = memo(PlayerComponent);
