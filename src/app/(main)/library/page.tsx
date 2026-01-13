import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, Clock, Download, ListMusic, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Mi Biblioteca',
};

async function getLibraryStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [favorites, history, downloads, playlists] = await Promise.all([
    supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase
      .from('listening_history')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id),
    supabase.from('downloads').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('playlists').select('id', { count: 'exact' }).eq('user_id', user.id),
  ]);

  return {
    favorites: favorites.count || 0,
    history: history.count || 0,
    downloads: downloads.count || 0,
    playlists: playlists.count || 0,
  };
}

export default async function LibraryPage() {
  const stats = await getLibraryStats();

  if (!stats) {
    redirect('/login');
  }

  const sections = [
    {
      href: '/library/favorites',
      icon: Heart,
      title: 'Favoritos',
      count: stats.favorites,
      color: 'bg-red-500/10 text-red-500',
    },
    {
      href: '/library/history',
      icon: Clock,
      title: 'Historial',
      count: stats.history,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      href: '/library/downloads',
      icon: Download,
      title: 'Descargas',
      count: stats.downloads,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      href: '/library/playlists',
      icon: ListMusic,
      title: 'Playlists',
      count: stats.playlists,
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Mi Biblioteca</h1>

      <div className="grid gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent transition-colors group"
            >
              <div className={`p-3 rounded-lg ${section.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.count} {section.count === 1 ? 'elemento' : 'elementos'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
