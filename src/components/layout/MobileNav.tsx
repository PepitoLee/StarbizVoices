'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, Library, User } from 'lucide-react';

const navItems = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/search', label: 'Buscar', icon: Search },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
  { href: '/profile', label: 'Perfil', icon: User },
];

interface MobileNavProps {
  className?: string;
}

function MobileNavComponent({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
      aria-label="Navegaci&oacute;n principal"
      role="navigation"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const MobileNav = memo(MobileNavComponent);
