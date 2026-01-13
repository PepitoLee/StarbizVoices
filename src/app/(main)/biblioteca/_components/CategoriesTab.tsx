import { ChevronRight, Mic, Library } from 'lucide-react';
import Link from 'next/link';

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

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  content_count: number;
}

interface CategoriesTabProps {
  categories: CategoryWithCount[];
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
          }}
        >
          <Library className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3">
          Proximamente
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Estamos organizando el contenido en categorias para que puedas encontrar
          lo que necesitas facilmente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group animate-fade-up opacity-0"
          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
        >
          <div
            className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 h-full transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1"
            style={{
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.1) 0%, oklch(0.70 0.12 185 / 0.1) 100%)',
                }}
              >
                {categoryIcons[category.slug] || '📖'}
              </div>

              {/* Arrow */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>

            <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>

            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                {category.description}
              </p>
            )}

            {/* Content count */}
            <div className="flex items-center gap-2 text-sm">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {category.content_count} {category.content_count === 1 ? 'audio' : 'audios'}
              </span>
            </div>

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
  );
}
