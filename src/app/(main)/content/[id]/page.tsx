'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatDate } from '@/lib/utils';
import Image from 'next/image';
import {
  Play,
  Pause,
  Heart,
  Share2,
  ChevronLeft,
  Clock,
  Calendar,
  User,
  Folder,
  Music,
  Mic,
  FileText,
  Lock,
} from 'lucide-react';
import type { Content } from '@/types';

const contentTypeIcons = {
  audio: Music,
  podcast: Mic,
  pdf: FileText,
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { currentTrack, isPlaying, play, pause } = usePlayer();
  const [content, setContent] = useState<Content | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const contentId = params.id as string;
  const isCurrentTrack = currentTrack?.id === contentId;
  const isPremiumContent = content?.access_level === 'premium';
  const canAccessPremium = profile?.role === 'premium' || profile?.role === 'admin';
  const isLocked = isPremiumContent && !canAccessPremium;

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase
        .from('content')
        .select('*, category:categories(*)')
        .eq('id', contentId)
        .eq('is_published', true)
        .single();

      if (data) {
        setContent(data);
      }
      setIsLoading(false);
    }

    async function checkFavorite() {
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      setIsFavorite(!!data);
    }

    fetchContent();
    if (user) checkFavorite();
  }, [contentId, user, supabase]);

  const handlePlay = () => {
    if (!content || content.content_type === 'pdf') return;
    if (isLocked) return;

    if (isCurrentTrack && isPlaying) {
      pause();
    } else if (isCurrentTrack) {
      play();
    } else {
      play(content);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !content) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', content.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        content_id: content.id,
      });
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: content?.title,
        text: content?.description || undefined,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <h2 className="text-xl font-semibold mb-2">Contenido no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          Este contenido no existe o no está disponible.
        </p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  const Icon = contentTypeIcons[content.content_type];

  return (
    <div className="p-6">
      {/* Back button */}
      <Button variant="ghost" size="icon" className="mb-4" onClick={() => router.back()}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Content header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Thumbnail */}
        <div className="relative w-full md:w-64 aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {content.thumbnail_url ? (
            <Image
              src={content.thumbnail_url}
              alt={content.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Icon className="h-20 w-20 text-primary/50" />
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-2">
            <Badge variant="secondary">
              <Icon className="h-3 w-3 mr-1" />
              {content.content_type === 'pdf'
                ? 'PDF'
                : content.content_type.charAt(0).toUpperCase() +
                  content.content_type.slice(1)}
            </Badge>
            {isPremiumContent && (
              <Badge variant="secondary" className="bg-yellow-500/90 text-yellow-950">
                Premium
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold">{content.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {content.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {content.author}
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(content.duration)}
              </div>
            )}
            {content.category && (
              <div className="flex items-center gap-1">
                <Folder className="h-4 w-4" />
                {content.category.name}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(content.created_at)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {content.content_type !== 'pdf' && (
              <Button
                size="lg"
                onClick={handlePlay}
                disabled={isLocked}
                className="gap-2"
              >
                {isCurrentTrack && isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Reproducir
                  </>
                )}
              </Button>
            )}

            {content.content_type === 'pdf' && !isLocked && (
              <Button
                size="lg"
                onClick={() => window.open(content.file_url, '_blank')}
                className="gap-2"
              >
                <FileText className="h-5 w-5" />
                Ver PDF
              </Button>
            )}

            {isLocked && (
              <Button size="lg" onClick={() => router.push('/premium')} className="gap-2">
                <Lock className="h-5 w-5" />
                Desbloquear con Premium
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      {content.description && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Descripción</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{content.description}</p>
        </div>
      )}
    </div>
  );
}
