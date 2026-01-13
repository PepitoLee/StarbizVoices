import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ContentCard } from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Heart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Favoritos',
};

async function getFavorites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('favorites')
    .select('*, content:content_id(*, category:categories(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data?.map((f) => f.content).filter(Boolean) || [];
}

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  if (favorites === null) {
    redirect('/login');
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
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'elemento' : 'elementos'}
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {favorites.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin favoritos</h2>
          <p className="text-muted-foreground mb-4">
            Añade contenido a tus favoritos para verlo aquí.
          </p>
          <Link href="/search">
            <Button>Explorar contenido</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
