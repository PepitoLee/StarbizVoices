'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  Sparkles,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const mainNavItems = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/search', label: 'Explorar', icon: Search },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
];

const libraryNavItems = [
  { href: '/library/favorites', label: 'Favoritos', icon: Heart },
  { href: '/library/history', label: 'Escuchados', icon: Clock },
  { href: '/profile', label: 'Mi perfil', icon: User },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, isAdmin, isPremium, signOut } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        'flex w-72 flex-col bg-sidebar border-r border-sidebar-border',
        className
      )}
    >
      {/* Logo */}
      <div className="flex flex-col gap-1 px-6 pt-7 pb-5">
        <Link href="/home" className="group flex items-center gap-3">
          <div className="relative h-14 w-14 transition-all duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {APP_TAGLINE}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-12 px-4 font-semibold rounded-xl',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                  style={isActive ? {
                    boxShadow: '0 4px 12px oklch(0.65 0.18 25 / 0.25)',
                  } : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {user && (
          <>
            {/* Divider with label */}
            <div className="my-5 flex items-center gap-3 px-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Tu espacio
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <nav className="space-y-1">
              {libraryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-12 px-4 font-semibold rounded-xl',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      )}
                      style={isActive ? {
                        boxShadow: '0 4px 12px oklch(0.65 0.18 25 / 0.25)',
                      } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {/* Premium upgrade card */}
        {user && !isPremium && (
          <div className="mt-6 mx-1">
            <div
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.08) 0%, oklch(0.70 0.12 185 / 0.08) 100%)',
                border: '1px solid oklch(0.65 0.18 25 / 0.15)',
              }}
            >
              {/* Decorative blobs */}
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
                style={{ background: 'oklch(0.65 0.18 25 / 0.15)' }}
              />
              <div
                className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full blur-2xl"
                style={{ background: 'oklch(0.70 0.12 185 / 0.12)' }}
              />

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: 'oklch(0.70 0.12 185 / 0.15)' }}
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Acceso completo</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Escucha todo el contenido exclusivo sin límites
                </p>
                <Link href="/premium">
                  <Button
                    size="sm"
                    className="w-full font-semibold rounded-xl h-10 btn-secondary"
                  >
                    Actualizar plan
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Admin link */}
        {isAdmin && (
          <div className="mt-4 px-1">
            <Link href="/admin">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 border-dashed rounded-xl font-semibold"
              >
                <Shield className="h-4 w-4" />
                Panel Admin
              </Button>
            </Link>
          </div>
        )}
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-muted/60 rounded-xl"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback
                    className="text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.65 0.18 25 / 0.15) 0%, oklch(0.70 0.12 185 / 0.15) 100%)',
                      color: 'oklch(0.55 0.16 25)',
                    }}
                  >
                    {getInitials(profile?.full_name || profile?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs truncate">
                    {isPremium ? (
                      <span className="text-secondary font-semibold">Acceso completo</span>
                    ) : (
                      <span className="text-muted-foreground">Plan gratuito</span>
                    )}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuracion
                </Link>
              </DropdownMenuItem>
              {!isPremium && (
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/premium" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Acceso completo
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-2">
            <Link href="/login">
              <Button variant="outline" className="w-full h-11 rounded-xl font-semibold">
                Iniciar sesion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full h-11 rounded-xl font-semibold btn-gradient">
                Crear cuenta
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
