'use client';

import { useInfiniteContent } from '@/hooks/useInfiniteContent';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentCardSkeleton } from '@/components/content/ContentCardSkeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Radio, FileText } from 'lucide-react';

type ContentType = 'audio' | 'podcast' | 'pdf';

const icons: Record<ContentType, typeof Mic> = {
  audio: Mic,
  podcast: Radio,
  pdf: FileText,
};

const labels: Record<ContentType, string> = {
  audio: 'audios',
  podcast: 'podcasts',
  pdf: 'PDFs',
};

interface ContentTabProps {
  contentType: ContentType;
  totalCount: number;
}

export function ContentTab({ contentType, totalCount }: ContentTabProps) {
  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useInfiniteContent(contentType);

  const Icon = icons[contentType];

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
          }}
        >
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Error al cargar</h3>
        <p className="text-muted-foreground mb-4">
          No pudimos cargar los {labels[contentType]}. Intenta de nuevo.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
          }}
        >
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Sin {labels[contentType]}</h3>
        <p className="text-muted-foreground">
          Aun no hay {labels[contentType]} disponibles.
        </p>
      </div>
    );
  }

  // Content grid
  return (
    <div className="space-y-6">
      {/* Counter */}
      <p className="text-sm text-muted-foreground">
        Mostrando {items.length} de {totalCount} {labels[contentType]}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((content, i) => (
          <div
            key={content.id}
            className="animate-fade-up opacity-0"
            style={{
              animationDelay: `${(i % 12) * 0.05}s`,
              animationFillMode: 'forwards',
            }}
          >
            <ContentCard content={content} />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            className="rounded-xl px-8"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar mas'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
