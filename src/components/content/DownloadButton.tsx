'use client';

import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDownload } from '@/hooks/useDownload';
import { toast } from 'sonner';
import type { Content } from '@/types';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  content: Content;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function DownloadButton({
  content,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className,
}: DownloadButtonProps) {
  const { isDownloaded, isDownloading, progress, download, remove } = useDownload(content);

  const handleDownload = async () => {
    const success = await download();
    if (success) {
      toast.success('Descargado', {
        description: `${content.title} disponible offline`,
      });
    } else {
      toast.error('Error al descargar', {
        description: 'No se pudo descargar el contenido',
      });
    }
  };

  const handleRemove = async () => {
    await remove();
    toast.success('Eliminado', {
      description: 'Contenido eliminado de descargas',
    });
  };

  if (isDownloaded) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn('text-primary', className)}
          >
            <Check className="h-5 w-5" />
            {showLabel && <span className="ml-2">Descargado</span>}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar descarga</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Quieres eliminar &ldquo;{content.title}&rdquo; de tus descargas?
              Podrás volver a descargarlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isDownloading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <div className="relative">
          <Loader2 className="h-5 w-5 animate-spin" />
          {progress > 0 && progress < 100 && (
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px]">
              {progress}%
            </span>
          )}
        </div>
        {showLabel && <span className="ml-2">Descargando...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={className}
    >
      <Download className="h-5 w-5" />
      {showLabel && <span className="ml-2">Descargar</span>}
    </Button>
  );
}
