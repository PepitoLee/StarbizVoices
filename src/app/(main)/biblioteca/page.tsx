import { createClient } from '@/lib/supabase/server';
import { Library } from 'lucide-react';
import { BibliotecaTabs } from './_components/BibliotecaTabs';
import type { CategoryWithCount } from './_components/CategoriesTab';

export const metadata = {
  title: 'Biblioteca',
  description: 'Explora todo el contenido por categoria y tipo',
};

async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  // Get all active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!categories) return [];

  // Get content count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_published', true);

      return {
        ...category,
        content_count: count || 0,
      };
    })
  );

  return categoriesWithCount;
}

async function getContentCounts() {
  const supabase = await createClient();

  // Get current user for favorites count
  const { data: { user } } = await supabase.auth.getUser();

  const [audioResult, podcastResult, pdfResult, favoritesResult, historyResult] = await Promise.all([
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'audio')
      .eq('is_published', true),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'podcast')
      .eq('is_published', true),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'pdf')
      .eq('is_published', true),
    user
      ? supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      : Promise.resolve({ count: 0 }),
    user
      ? supabase
          .from('listening_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    audio: audioResult.count || 0,
    podcast: podcastResult.count || 0,
    pdf: pdfResult.count || 0,
    favorites: favoritesResult.count || 0,
    history: historyResult.count || 0,
  };
}

async function getTotalContent() {
  const supabase = await createClient();
  const { count } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);
  return count || 0;
}

export default async function BibliotecaPage() {
  const [categories, counts, totalContent] = await Promise.all([
    getCategoriesWithCount(),
    getContentCounts(),
    getTotalContent(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <section className="relative px-6 lg:px-10 pt-10 pb-8">
        {/* Decorative background */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'oklch(0.70 0.12 185 / 0.15)' }}
        />
        <div
          className="absolute bottom-0 left-10 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'oklch(0.65 0.18 25 / 0.12)' }}
        />

        <div className="relative flex items-center gap-4 mb-5">
          <div className="icon-box">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              Biblioteca
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalContent} contenidos en {categories.length} categorias
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="px-6 lg:px-10 pb-10">
        <BibliotecaTabs categories={categories} counts={counts} />
      </section>
    </div>
  );
}
