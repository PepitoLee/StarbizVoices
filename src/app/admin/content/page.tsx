import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Music, Mic, FileText, Eye, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'Contenido',
};

const contentTypeIcons = {
  audio: Music,
  podcast: Mic,
  pdf: FileText,
};

async function getContent() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ContentListPage() {
  const content = await getContent();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contenido</h1>
          <p className="text-muted-foreground">
            Gestiona todo el contenido de la plataforma
          </p>
        </div>
        <Link href="/admin/content/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo contenido
          </Button>
        </Link>
      </div>

      {content.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acceso</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => {
                const Icon = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons];
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/content/${item.id}`}
                        className="font-medium hover:underline flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{item.content_type}</TableCell>
                    <TableCell>{item.category?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.access_level === 'premium' ? 'default' : 'secondary'}
                        className={
                          item.access_level === 'premium'
                            ? 'bg-yellow-500 text-yellow-950'
                            : ''
                        }
                      >
                        {item.access_level === 'premium' ? 'Premium' : 'Gratis'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.duration ? formatTime(item.duration) : '-'}</TableCell>
                    <TableCell>
                      {item.is_published ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Borrador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin contenido</h2>
          <p className="text-muted-foreground mb-4">
            Empieza subiendo tu primer contenido.
          </p>
          <Link href="/admin/content/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear contenido
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
