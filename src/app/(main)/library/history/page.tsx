import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ContentCard } from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Historial',
};

async function getHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('listening_history')
    .select('*, content:content_id(*, category:categories(*))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(100);

  return data?.map((h) => h.content).filter(Boolean) || [];
}

export default async function HistoryPage() {
  const history = await getHistory();

  if (history === null) {
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
          <h1 className="text-3xl font-bold">Historial</h1>
          <p className="text-muted-foreground">
            {history.length} {history.length === 1 ? 'elemento' : 'elementos'}
          </p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {history.map((content, index) => (
            <ContentCard key={`${content.id}-${index}`} content={content} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin historial</h2>
          <p className="text-muted-foreground mb-4">
            El contenido que reproduzcas aparecerá aquí.
          </p>
          <Link href="/search">
            <Button>Explorar contenido</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
