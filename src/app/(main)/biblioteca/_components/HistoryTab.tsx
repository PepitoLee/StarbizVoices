'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentCardSkeleton } from '@/components/content/ContentCardSkeleton';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import type { Content } from '@/types';

interface HistoryTabProps {
  totalCount: number;
}

export function HistoryTab({ totalCount }: HistoryTabProps) {
  const [history, setHistory] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setHistory([]);
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('listening_history')
          .select('*, content:content_id(*, category:categories(*))')
          .eq('user_id', user.id)
          .order('last_played_at', { ascending: false })
          .limit(50);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        const contents = data?.map((h) => h.content).filter(Boolean) || [];
        // Remove duplicates (keep first occurrence - most recent)
        const unique = contents.filter((content, index, self) =>
          index === self.findIndex((c) => c.id === content.id)
        );
        setHistory(unique as Content[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

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
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Error al cargar</h3>
        <p className="text-muted-foreground mb-4">
          No pudimos cargar tu historial. Intenta de nuevo.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
          }}
        >
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Sin historial</h3>
        <p className="text-muted-foreground mb-4">
          Aun no has escuchado ningun contenido.
        </p>
        <Link href="/search">
          <Button className="rounded-xl btn-gradient">
            Explorar contenido
          </Button>
        </Link>
      </div>
    );
  }

  // Content grid
  return (
    <div className="space-y-6">
      {/* Counter */}
      <p className="text-sm text-muted-foreground">
        {history.length} {history.length === 1 ? 'escuchado' : 'escuchados'} recientemente
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {history.map((content, i) => (
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
    </div>
  );
}
