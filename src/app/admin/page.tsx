import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, FolderOpen, Users, Crown, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
};

async function getStats() {
  const supabase = await createClient();

  const [content, categories, users, premiumUsers, recentContent] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact' }),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'premium'),
    supabase
      .from('content')
      .select('id, title, content_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    contentCount: content.count || 0,
    categoriesCount: categories.count || 0,
    usersCount: users.count || 0,
    premiumCount: premiumUsers.count || 0,
    recentContent: recentContent.data || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Total Contenido',
      value: stats.contentCount,
      icon: FileAudio,
      href: '/admin/content',
      color: 'text-blue-500',
    },
    {
      title: 'Categorías',
      value: stats.categoriesCount,
      icon: FolderOpen,
      href: '/admin/categories',
      color: 'text-green-500',
    },
    {
      title: 'Usuarios',
      value: stats.usersCount,
      icon: Users,
      href: '/admin/users',
      color: 'text-purple-500',
    },
    {
      title: 'Premium',
      value: stats.premiumCount,
      icon: Crown,
      href: '/admin/users?filter=premium',
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Contenido Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentContent.length > 0 ? (
            <div className="space-y-3">
              {stats.recentContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/content/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.content_type}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay contenido aún. ¡Crea el primero!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
