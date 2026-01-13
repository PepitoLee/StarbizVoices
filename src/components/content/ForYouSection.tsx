'use client';

import { useEffect, useState } from 'react';
import { ContentCard } from './ContentCard';
import { ContentCardSkeleton } from './ContentCardSkeleton';
import { useUserPreferences, interestToCategorySlug, durationMap } from '@/hooks/useUserPreferences';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, UserCircle } from 'lucide-react';
import Link from 'next/link';
import type { Content } from '@/types';

export function ForYouSection() {
  const { preferences, hasCompletedOnboarding, isLoading: prefsLoading } = useUserPreferences();
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPersonalizedContent() {
      if (!preferences || !hasCompletedOnboarding) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Get category slugs from interests
        const categorySlugs = preferences.interests
          ?.map((interest) => interestToCategorySlug[interest])
          .filter(Boolean) || [];

        // Get max duration
        const maxDuration = preferences.listening_time
          ? durationMap[preferences.listening_time]
          : null;

        // Build query
        let query = supabase
          .from('content')
          .select('*, category:categories(*)')
          .eq('is_published', true);

        // Filter by categories if user has interests
        if (categorySlugs.length > 0) {
          // First get category IDs for the slugs
          const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .in('slug', categorySlugs);

          if (categories && categories.length > 0) {
            const categoryIds = categories.map((c) => c.id);
            query = query.in('category_id', categoryIds);
          }
        }

        // Filter by duration if set
        if (maxDuration) {
          query = query.lte('duration', maxDuration);
        }

        const { data } = await query
          .order('created_at', { ascending: false })
          .limit(8);

        setContent(data || []);
      } catch (error) {
        console.error('Error fetching personalized content:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!prefsLoading) {
      fetchPersonalizedContent();
    }
  }, [preferences, hasCompletedOnboarding, prefsLoading]);

  // Don't show section if user hasn't completed onboarding
  if (!prefsLoading && !hasCompletedOnboarding) {
    return (
      <section className="px-6 lg:px-10 py-10">
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.06) 0%, oklch(0.65 0.18 25 / 0.04) 100%)',
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.15) 0%, oklch(0.70 0.12 185 / 0.08) 100%)',
              }}
            >
              <UserCircle className="h-8 w-8 text-secondary" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold mb-2">
                Personaliza tu experiencia
              </h2>
              <p className="text-muted-foreground mb-4">
                Cuentanos sobre ti para recomendarte contenido adaptado a tus necesidades
                y las edades de tus hijos.
              </p>
              <Link href="/onboarding">
                <Button className="btn-secondary rounded-xl">
                  Comenzar <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading || prefsLoading) {
    return (
      <section className="px-6 lg:px-10 py-10">
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.06) 0%, oklch(0.65 0.18 25 / 0.04) 100%)',
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No personalized content found
  if (content.length === 0) {
    return null;
  }

  // Show personalized content
  return (
    <section className="px-6 lg:px-10 py-10">
      <div
        className="rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.06) 0%, oklch(0.65 0.18 25 / 0.04) 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.70 0.12 185 / 0.15) 0%, oklch(0.70 0.12 185 / 0.08) 100%)',
              }}
            >
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Para ti</h2>
              <p className="text-sm text-muted-foreground">
                Basado en tus preferencias
              </p>
            </div>
          </div>
          <Link href="/onboarding">
            <Button
              variant="ghost"
              size="sm"
              className="text-secondary font-semibold hover:text-secondary/80 rounded-xl"
            >
              Editar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${0.1 + index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <ContentCard content={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
