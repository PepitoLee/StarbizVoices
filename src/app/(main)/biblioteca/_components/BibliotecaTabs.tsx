'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderOpen, Mic, Radio, FileText, Heart, Clock } from 'lucide-react';
import { CategoriesTab, type CategoryWithCount } from './CategoriesTab';
import { ContentTab } from './ContentTab';
import { FavoritesTab } from './FavoritesTab';
import { HistoryTab } from './HistoryTab';

interface ContentCounts {
  audio: number;
  podcast: number;
  pdf: number;
  favorites: number;
  history: number;
}

interface BibliotecaTabsProps {
  categories: CategoryWithCount[];
  counts: ContentCounts;
}

export function BibliotecaTabs({ categories, counts }: BibliotecaTabsProps) {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="inline-flex h-auto gap-1 rounded-2xl bg-muted/50 p-1.5 mb-8 flex-wrap">
        <TabsTrigger
          value="favorites"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <Heart className="h-4 w-4 mr-2" />
          Me gusta
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.65 0.18 25 / 0.15)',
              color: 'oklch(0.50 0.18 25)',
            }}
          >
            {counts.favorites}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="history"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <Clock className="h-4 w-4 mr-2" />
          Escuchados
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.70 0.12 185 / 0.15)',
              color: 'oklch(0.50 0.12 185)',
            }}
          >
            {counts.history}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="categories"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Categorias
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.70 0.12 185 / 0.15)',
              color: 'oklch(0.50 0.12 185)',
            }}
          >
            {categories.length}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="audios"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <Mic className="h-4 w-4 mr-2" />
          Audios
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.65 0.18 25 / 0.15)',
              color: 'oklch(0.50 0.18 25)',
            }}
          >
            {counts.audio}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="podcasts"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <Radio className="h-4 w-4 mr-2" />
          Podcasts
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.65 0.18 25 / 0.15)',
              color: 'oklch(0.50 0.18 25)',
            }}
          >
            {counts.podcast}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="pdfs"
          className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDFs
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'oklch(0.65 0.18 25 / 0.15)',
              color: 'oklch(0.50 0.18 25)',
            }}
          >
            {counts.pdf}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="favorites" className="mt-0">
        <FavoritesTab totalCount={counts.favorites} />
      </TabsContent>

      <TabsContent value="history" className="mt-0">
        <HistoryTab totalCount={counts.history} />
      </TabsContent>

      <TabsContent value="categories" className="mt-0">
        <CategoriesTab categories={categories} />
      </TabsContent>

      <TabsContent value="audios" className="mt-0">
        <ContentTab contentType="audio" totalCount={counts.audio} />
      </TabsContent>

      <TabsContent value="podcasts" className="mt-0">
        <ContentTab contentType="podcast" totalCount={counts.podcast} />
      </TabsContent>

      <TabsContent value="pdfs" className="mt-0">
        <ContentTab contentType="pdf" totalCount={counts.pdf} />
      </TabsContent>
    </Tabs>
  );
}
