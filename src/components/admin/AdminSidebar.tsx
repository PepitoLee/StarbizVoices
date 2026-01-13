'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileAudio,
  FolderOpen,
  Users,
  Settings,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Contenido', icon: FileAudio },
  { href: '/admin/categories', label: 'Categorías', icon: FolderOpen },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Link href="/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Volver a la app</span>
        </Link>
        <h1 className="text-xl font-bold mt-4">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <Link href="/admin/content/new">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nuevo contenido
          </Button>
        </Link>
      </div>
    </div>
  );
}
