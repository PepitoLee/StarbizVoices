'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ContentCard } from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Content } from '@/types';

export default function DownloadsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    async function fetchDownloads() {
      if (!user) return;

      const { data } = await supabase
        .from('downloads')
        .select('*, content:content_id(*, category:categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setDownloads(data?.map((d) => d.content).filter(Boolean) || []);
      setIsLoading(false);
    }

    fetchDownloads();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/library">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Descargas</h1>
          <p className="text-muted-foreground">
            {downloads.length} {downloads.length === 1 ? 'elemento' : 'elementos'}
          </p>
        </div>
      </div>

      {downloads.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {downloads.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Download className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin descargas</h2>
          <p className="text-muted-foreground mb-4">
            Descarga contenido para escucharlo sin conexión.
          </p>
          <Link href="/search">
            <Button>Explorar contenido</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
