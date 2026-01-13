'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Crown, Music, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show confetti effect
    const showConfetti = () => {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    };

    // Short delay to let the page load, then show confetti
    const timer = setTimeout(() => {
      setIsLoading(false);
      showConfetti();
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Procesando tu suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Card className="bg-gradient-to-b from-yellow-500/10 to-background border-yellow-500/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-3xl">¡Bienvenido a Premium!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground text-lg">
            Tu suscripción se ha activado correctamente. Ahora tienes acceso completo
            a todo el contenido y funciones exclusivas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <span className="text-sm font-medium">Contenido Premium</span>
              <span className="text-xs text-muted-foreground">Desbloqueado</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Descargas</span>
              <span className="text-xs text-muted-foreground">Ilimitadas</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-sm font-medium">Audio HD</span>
              <span className="text-xs text-muted-foreground">Activado</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/home">
              <Button size="lg" className="gap-2">
                <Music className="h-4 w-4" />
                Explorar contenido
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="lg">
                Ver mi perfil
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Recibirás un email de confirmación con los detalles de tu suscripción.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
