'use client';

import { type LucideIcon, Music, Search, Library, Heart, Clock, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Music,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}

// Preset empty states for common use cases
export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title={query ? `Sin resultados para "${query}"` : 'Busca tu contenido favorito'}
      description={
        query
          ? 'Intenta con otros t\u00e9rminos de b\u00fasqueda'
          : 'Encuentra audios, podcasts y m\u00e1s'
      }
    />
  );
}

export function EmptyLibrary() {
  return (
    <EmptyState
      icon={Library}
      title="Tu biblioteca est\u00e1 vac\u00eda"
      description="A\u00fan no tienes contenido guardado. Explora y agrega tus favoritos."
      action={{ label: 'Explorar contenido', href: '/home' }}
    />
  );
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Heart}
      title="Sin favoritos a\u00fan"
      description="Marca contenido como favorito para encontrarlo f\u00e1cilmente aqu\u00ed."
      action={{ label: 'Descubrir contenido', href: '/home' }}
    />
  );
}

export function EmptyHistory() {
  return (
    <EmptyState
      icon={Clock}
      title="Sin historial"
      description="El contenido que escuches aparecer\u00e1 aqu\u00ed."
      action={{ label: 'Comenzar a escuchar', href: '/home' }}
    />
  );
}

export function EmptyPlaylist() {
  return (
    <EmptyState
      icon={Folder}
      title="Playlist vac\u00eda"
      description="Agrega contenido a esta playlist para empezar."
    />
  );
}

export function EmptyCategory() {
  return (
    <EmptyState
      icon={Music}
      title="Sin contenido disponible"
      description="A\u00fan no hay contenido en esta categor\u00eda."
      action={{ label: 'Ver todas las categor\u00edas', href: '/home' }}
    />
  );
}
