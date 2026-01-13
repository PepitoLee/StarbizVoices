'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { ContentCard } from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  Play,
  Shuffle,
  MoreVertical,
  Pencil,
  Trash2,
  ListMusic,
} from 'lucide-react';
import Link from 'next/link';
import type { Playlist, Content } from '@/types';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { playPlaylist, toggleShuffle } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const supabase = getSupabaseClient();

  const playlistId = params.id as string;

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId, user]);

  async function fetchPlaylist() {
    if (!user) return;

    const { data: playlistData } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (playlistData) {
      setPlaylist(playlistData);
      setEditName(playlistData.name);

      const { data: itemsData } = await supabase
        .from('playlist_items')
        .select('*, content:content_id(*, category:categories(*))')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      setItems(itemsData?.map((i) => i.content).filter(Boolean) || []);
    }

    setIsLoading(false);
  }

  const handlePlayAll = () => {
    const playableItems = items.filter((i) => i.content_type !== 'pdf');
    if (playableItems.length > 0) {
      playPlaylist(playableItems);
    }
  };

  const handleShufflePlay = () => {
    const playableItems = items.filter((i) => i.content_type !== 'pdf');
    if (playableItems.length > 0) {
      toggleShuffle();
      playPlaylist(playableItems);
    }
  };

  const handleRename = async () => {
    if (!playlist || !editName.trim()) return;

    await supabase
      .from('playlists')
      .update({ name: editName.trim() })
      .eq('id', playlist.id);

    setPlaylist({ ...playlist, name: editName.trim() });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!playlist || !confirm('¿Estás seguro de eliminar esta playlist?')) return;

    await supabase.from('playlists').delete().eq('id', playlist.id);
    router.push('/library/playlists');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <h2 className="text-xl font-semibold mb-2">Playlist no encontrada</h2>
        <Link href="/library/playlists">
          <Button>Volver a playlists</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/library/playlists">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
                <Button size="sm" onClick={handleRename}>
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold">{playlist.name}</h1>
            )}
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'elemento' : 'elementos'}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Play controls */}
      {items.length > 0 && (
        <div className="flex gap-3">
          <Button onClick={handlePlayAll} className="gap-2">
            <Play className="h-4 w-4" />
            Reproducir
          </Button>
          <Button variant="outline" onClick={handleShufflePlay} className="gap-2">
            <Shuffle className="h-4 w-4" />
            Aleatorio
          </Button>
        </div>
      )}

      {/* Content */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Playlist vacía</h2>
          <p className="text-muted-foreground mb-4">
            Añade contenido a esta playlist desde la página de detalle.
          </p>
          <Link href="/search">
            <Button>Explorar contenido</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
