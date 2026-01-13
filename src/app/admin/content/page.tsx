'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Music, Mic, FileText, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import type { Content } from '@/types';

const contentTypeIcons = {
  audio: Music,
  podcast: Mic,
  pdf: FileText,
};

export default function ContentListPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const { data } = await supabase
      .from('content')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    setContent(data || []);
    setIsLoading(false);
  }

  async function deleteContent(item: Content) {
    if (!confirm(`¿Estás seguro de eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingId(item.id);

    try {
      // 1. Delete file from Storage
      if (item.file_url) {
        const bucket = item.content_type === 'pdf' ? 'pdf-files' : 'audio-files';
        // Extract path from URL (format: .../storage/v1/object/public/bucket/path)
        const urlParts = item.file_url.split(`/storage/v1/object/public/${bucket}/`);
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from(bucket).remove([filePath]);
        }
      }

      // 2. Delete thumbnail from Storage if exists
      if (item.thumbnail_url) {
        const urlParts = item.thumbnail_url.split('/storage/v1/object/public/thumbnails/');
        if (urlParts.length > 1) {
          const thumbPath = urlParts[1];
          await supabase.storage.from('thumbnails').remove([thumbPath]);
        }
      }

      // 3. Delete record from database
      const { error } = await supabase.from('content').delete().eq('id', item.id);

      if (error) {
        throw error;
      }

      // 4. Refresh list
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error al eliminar el contenido. Por favor intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contenido</h1>
          <p className="text-muted-foreground">
            Gestiona todo el contenido de la plataforma
          </p>
        </div>
        <Link href="/admin/content/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo contenido
          </Button>
        </Link>
      </div>

      {content.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acceso</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => {
                const Icon = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons];
                const isDeleting = deletingId === item.id;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/content/${item.id}`}
                        className="font-medium hover:underline flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{item.content_type}</TableCell>
                    <TableCell>{item.category?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.access_level === 'premium' ? 'default' : 'secondary'}
                        className={
                          item.access_level === 'premium'
                            ? 'bg-yellow-500 text-yellow-950'
                            : ''
                        }
                      >
                        {item.access_level === 'premium' ? 'Premium' : 'Gratis'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.duration ? formatTime(item.duration) : '-'}</TableCell>
                    <TableCell>
                      {item.is_published ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Borrador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteContent(item)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin contenido</h2>
          <p className="text-muted-foreground mb-4">
            Empieza subiendo tu primer contenido.
          </p>
          <Link href="/admin/content/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear contenido
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
