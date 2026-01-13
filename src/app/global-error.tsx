'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="rounded-full bg-red-500/10 p-4">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold">Error Cr&iacute;tico</h1>

            <p className="text-gray-400">
              Ha ocurrido un error cr&iacute;tico en la aplicaci&oacute;n.
              Por favor, recarga la p&aacute;gina para continuar.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <details className="w-full rounded-lg bg-gray-800 p-4 text-left text-sm">
                <summary className="cursor-pointer font-medium text-white">
                  Detalles del error
                </summary>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-gray-400">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Recargar p&aacute;gina
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
