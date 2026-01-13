'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Download, Shield, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, PRICING, type PricingPlan } from '@/lib/stripe';

export default function PremiumPage() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<PricingPlan | null>(null);

  const isPremium = profile?.role === 'premium' || profile?.role === 'admin';

  const features = [
    {
      icon: Crown,
      title: 'Acceso completo',
      description: 'Desbloquea todo el contenido premium exclusivo',
    },
    {
      icon: Download,
      title: 'Descargas offline',
      description: 'Descarga contenido para escuchar sin conexión',
    },
    {
      icon: Zap,
      title: 'Sin anuncios',
      description: 'Disfruta de una experiencia sin interrupciones',
    },
    {
      icon: Shield,
      title: 'Calidad HD',
      description: 'Audio en la máxima calidad disponible',
    },
  ];

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) {
      router.push('/login?redirect=/premium');
      return;
    }

    setIsLoading(plan);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo procesar el pago',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading('monthly');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al abrir el portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo abrir el portal',
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (isPremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">¡Eres Premium!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Tienes acceso completo a todo el contenido y funciones de la plataforma.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background"
                  >
                    <Icon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading !== null}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Gestionar suscripción
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Badge className="bg-yellow-500 text-yellow-950 mb-4">Premium</Badge>
        <h1 className="text-4xl font-bold mb-2">Desbloquea todo el potencial</h1>
        <p className="text-muted-foreground text-lg">
          Accede a contenido exclusivo y disfruta de la mejor experiencia
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Monthly Plan */}
        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-muted-foreground">Mensual</CardTitle>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">{formatPrice(PRICING.monthly.amount)}</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {[
                'Acceso a todo el contenido',
                'Descargas ilimitadas',
                'Sin anuncios',
                'Cancela cuando quieras',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => handleUpgrade('monthly')}
              disabled={isLoading !== null}
            >
              {isLoading === 'monthly' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Elegir plan mensual'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Annual Plan */}
        <Card className="bg-gradient-to-b from-yellow-500/5 to-orange-500/5 border-yellow-500/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-yellow-500 text-yellow-950">Ahorra 33%</Badge>
          </div>
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-lg text-muted-foreground">Anual</CardTitle>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">{formatPrice(PRICING.annual.amount)}</span>
              <span className="text-muted-foreground">/año</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(PRICING.annual.amount / 12)}/mes
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {[
                'Todo lo del plan mensual',
                'Ahorra 33% anualmente',
                'Acceso prioritario a novedades',
                'Soporte prioritario',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 gap-2"
              size="lg"
              onClick={() => handleUpgrade('annual')}
              disabled={isLoading !== null}
            >
              {isLoading === 'annual' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  Elegir plan anual
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
        Todos los planes incluyen 7 días de prueba gratis. Cancela en cualquier momento.
        Al suscribirte, aceptas nuestros términos de servicio y política de privacidad.
      </p>
    </div>
  );
}
