'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ListMusic, ChevronLeft, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Playlist } from '@/types';

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  async function fetchPlaylists() {
    if (!user) return;

    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setPlaylists(data || []);
    setIsLoading(false);
  }

  async function createPlaylist() {
    if (!user || !newPlaylistName.trim()) return;

    setIsCreating(true);

    const { error } = await supabase.from('playlists').insert({
      user_id: user.id,
      name: newPlaylistName.trim(),
    });

    if (!error) {
      setNewPlaylistName('');
      setDialogOpen(false);
      fetchPlaylists();
    }

    setIsCreating(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/library">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Playlists</h1>
            <p className="text-muted-foreground">
              {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Nombre de la playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createPlaylist} disabled={isCreating}>
                  {isCreating ? 'Creando...' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length > 0 ? (
        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/library/playlists/${playlist.id}`}
              className="flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent transition-colors group"
            >
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ListMusic className="h-8 w-8 text-primary/50" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {playlist.description || 'Sin descripción'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin playlists</h2>
          <p className="text-muted-foreground mb-4">
            Crea tu primera playlist para organizar tu contenido.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear playlist
          </Button>
        </div>
      )}
    </div>
  );
}
