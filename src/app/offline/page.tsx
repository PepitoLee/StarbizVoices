'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <WifiOff className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Sin conexión</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          No tienes conexión a internet. Puedes acceder a tu contenido descargado
          mientras estés offline.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/library/downloads">
            <Button className="w-full">Ver descargas</Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Reintentar conexión
          </Button>
        </div>
      </div>
    </div>
  );
}
