import { createClient } from '@/lib/supabase/server';
import { ContentCard } from '@/components/content/ContentCard';
import { ForYouSection } from '@/components/content/ForYouSection';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Inicio',
};

// Category icons mapping
const categoryIcons: Record<string, string> = {
  sueno: '🌙',
  alimentacion: '🥗',
  conducta: '💭',
  desarrollo: '📈',
  salud: '🏥',
  educacion: '📚',
  emocional: '💜',
  crianza: '👨‍👩‍👧',
};

async function getFeaturedContent() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4);
  return data || [];
}

async function getRecentContent() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return data || [];
}

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const [featured, recent, categories] = await Promise.all([
    getFeaturedContent(),
    getRecentContent(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-10 pt-10 pb-14">
        {/* Decorative background */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'oklch(0.65 0.18 25 / 0.15)' }}
        />
        <div
          className="absolute bottom-0 left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'oklch(0.70 0.12 185 / 0.12)' }}
        />

        <div className="max-w-3xl relative">
          <div className="flex items-center gap-3 mb-5">
            <span className="badge-pill animate-fade-up">
              <Zap className="h-3 w-3" />
              Nuevo contenido disponible
            </span>
          </div>

          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-[1.1] animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Descubre voces que
            <br />
            <span className="text-gradient">transforman tu crianza</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Expertos en pediatria, psicologia y desarrollo infantil comparten su conocimiento
            en conversaciones intimas diseñadas para ti.
          </p>
        </div>
      </section>

      {/* For You Section - Personalized content */}
      <ForYouSection />

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="px-6 lg:px-10 py-10">
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.06) 0%, oklch(0.70 0.12 185 / 0.04) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="icon-box">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Destacados</h2>
                  <p className="text-sm text-muted-foreground">Voces recomendadas para ti</p>
                </div>
              </div>
              <Link href="/search?featured=true">
                <Button variant="ghost" size="sm" className="text-primary font-semibold hover:text-primary/80 rounded-xl">
                  Ver todo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((content, index) => (
                <div
                  key={content.id}
                  className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <ContentCard content={content} variant="featured" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="px-6 lg:px-10 py-10">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.15) 0%, oklch(0.70 0.12 185 / 0.08) 100%)',
              }}
            >
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Explora por tema</h2>
              <p className="text-sm text-muted-foreground">Encuentra lo que necesitas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Icon */}
                  <div className="text-3xl mb-3">
                    {categoryIcons[category.slug] || '📖'}
                  </div>

                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}

                  {/* Hover gradient accent */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{
                      background: 'linear-gradient(90deg, oklch(0.65 0.18 25) 0%, oklch(0.70 0.12 185) 100%)',
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Section */}
      {recent.length > 0 && (
        <section className="px-6 lg:px-10 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.15) 0%, oklch(0.65 0.18 25 / 0.08) 100%)',
                }}
              >
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Nuevas voces</h2>
                <p className="text-sm text-muted-foreground">Contenido añadido recientemente</p>
              </div>
            </div>
            <Link href="/search">
              <Button variant="ghost" size="sm" className="text-primary font-semibold hover:text-primary/80 rounded-xl">
                Ver todo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recent.map((content, index) => (
              <div
                key={content.id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <ContentCard content={content} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {featured.length === 0 && recent.length === 0 && (
        <section className="px-6 lg:px-10 py-20">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
              }}
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              Proximamente nuevas voces
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Estamos preparando contenido valioso de expertos para acompañarte en tu camino
              como padre. Vuelve pronto.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
