'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Content } from '@/types';

const PAGE_SIZE = 12;

type ContentType = 'audio' | 'podcast' | 'pdf';

interface UseInfiniteContentReturn {
  items: Content[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  error: Error | null;
}

export function useInfiniteContent(contentType: ContentType): UseInfiniteContentReturn {
  const [pages, setPages] = useState<Content[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(async (offset: number): Promise<Content[]> => {
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from('content')
      .select('*, category:categories(*)')
      .eq('content_type', contentType)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    return (data as Content[]) || [];
  }, [contentType]);

  // Carga inicial - se ejecuta cuando cambia el tipo de contenido
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setIsLoading(true);
      setPages([]);
      setError(null);

      try {
        const items = await fetchPage(0);
        if (!cancelled) {
          setPages([items]);
          setHasNextPage(items.length === PAGE_SIZE);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const fetchNextPage = async () => {
    if (isFetchingNextPage || !hasNextPage) return;

    setIsFetchingNextPage(true);
    setError(null);

    try {
      const offset = pages.flat().length;
      const items = await fetchPage(offset);
      setPages((prev) => [...prev, items]);
      setHasNextPage(items.length === PAGE_SIZE);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  return {
    items: pages.flat(),
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  };
}
