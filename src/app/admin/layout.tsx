import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin',
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario, mostrar login de admin
  if (!user) {
    return <AdminLoginForm />;
  }

  // Verificar que sea admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Si no es admin, mostrar login de admin
  if (profile?.role !== 'admin') {
    return <AdminLoginForm />;
  }

  // Usuario autenticado como admin - mostrar panel
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
