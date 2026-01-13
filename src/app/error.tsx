'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>

        <h2 className="text-2xl font-bold">Algo sali&oacute; mal</h2>

        <p className="text-muted-foreground">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo o vuelve al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="w-full rounded-lg bg-muted p-4 text-left text-sm">
            <summary className="cursor-pointer font-medium">
              Detalles del error
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </Button>

          <Button asChild variant="outline" className="gap-2">
            <Link href="/home">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
