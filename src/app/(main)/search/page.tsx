'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ContentCard } from '@/components/content/ContentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Content, Category } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);

    let queryBuilder = supabase
      .from('content')
      .select('*, category:categories(*)')
      .eq('is_published', true);

    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,author.ilike.%${query}%`
      );
    }

    if (selectedCategory) {
      queryBuilder = queryBuilder.eq('category_id', selectedCategory);
    }

    if (selectedType) {
      queryBuilder = queryBuilder.eq('content_type', selectedType);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setResults(data);
    }
    setIsLoading(false);
  }, [query, selectedCategory, selectedType, supabase]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim() || selectedCategory || selectedType) {
        search();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, selectedCategory, selectedType, search]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory(null);
    setSelectedType(null);
    setResults([]);
    setHasSearched(false);
  };

  const contentTypes = [
    { value: 'audio', label: 'Audio' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'pdf', label: 'PDF' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Buscar</h1>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título, autor o descripción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-lg"
          />
          {(query || selectedCategory || selectedType) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Content Type Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Tipo:</span>
            {contentTypes.map((type) => (
              <Badge
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedType(selectedType === type.value ? null : type.value)
                }
              >
                {type.label}
              </Badge>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center mr-2">
                Categoría:
              </span>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                  }
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sin resultados</h2>
            <p className="text-muted-foreground">
              No encontramos contenido que coincida con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Explora el contenido</h2>
            <p className="text-muted-foreground">
              Busca por título, autor o usa los filtros para encontrar contenido.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
