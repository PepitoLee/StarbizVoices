import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ContentCard } from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .single();

  return {
    title: category?.name || 'Categoría',
  };
}

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

async function getCategoryContent(categoryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('*, category:categories(*)')
    .eq('category_id', categoryId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const content = await getCategoryContent(category.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/home">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {content.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {content.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Sin contenido</h2>
          <p className="text-muted-foreground">
            No hay contenido disponible en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
