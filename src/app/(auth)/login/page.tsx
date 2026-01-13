'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import Image from 'next/image';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Error al iniciar sesion', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success('Bienvenido de vuelta');
    router.push(redirectTo);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error('Error con Google', {
        description: error.message,
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-mesh">
      {/* Decorative blobs */}
      <div
        className="fixed top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-float"
        style={{ background: 'oklch(0.65 0.18 25 / 0.3)' }}
      />
      <div
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'oklch(0.70 0.12 185 / 0.25)', animationDelay: '1s' }}
      />
      <div
        className="fixed top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: 'oklch(0.65 0.18 25 / 0.2)', animationDelay: '2s' }}
      />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 relative z-10">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="relative h-14 w-14">
              <Image
                src="/logo.png"
                alt={APP_NAME}
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{APP_NAME}</h1>
              <p className="text-sm text-muted-foreground font-medium">{APP_TAGLINE}</p>
            </div>
          </div>

          <h2 className="font-display text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-[1.1] text-balance">
            <span className="text-gradient">Escucha a expertos</span>
            <br />
            que entienden lo que es ser padre
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Pediatras, psicologos y especialistas comparten su conocimiento en conversaciones
            intimas diseñadas para acompañarte en cada etapa.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            <span className="badge-pill">
              <Sparkles className="h-3 w-3" />
              Contenido exclusivo
            </span>
            <span className="badge-turquoise">
              +50 expertos
            </span>
            <span className="badge-pill">
              Nuevos episodios cada semana
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8 animate-fade-up">
            <div className="relative h-16 w-16 mb-4">
              <Image
                src="/logo.png"
                alt={APP_NAME}
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="font-display text-2xl font-bold">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>

          <div
            className="card-glass p-8 animate-fade-up"
            style={{
              animationDelay: '0.1s',
              boxShadow: '0 24px 48px oklch(0.15 0.02 260 / 0.12)',
            }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold mb-2">Bienvenido de vuelta</h2>
              <p className="text-muted-foreground text-sm">
                Ingresa para continuar escuchando
              </p>
            </div>

            <div className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-xl border-border hover:bg-muted/60 transition-all duration-200"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground tracking-wider font-semibold">
                    o con email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-muted/40 border-border/50 focus:bg-background focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Contraseña
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary font-medium hover:text-primary/80 underline-animated"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-muted/40 border-border/50 focus:bg-background focus:border-primary transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl btn-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesion...
                    </>
                  ) : (
                    <>
                      Iniciar sesion
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:text-primary/80 underline-animated">
              Crea una gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <Image
                src="/logo.png"
                alt={APP_NAME}
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
