'use client';

import { useState, useEffect } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { canInstall, install, updateAvailable, update, isInstalled } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedAt = new Date(wasDismissed);
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      }
    }
  }, []);

  useEffect(() => {
    // Show install banner after 5 seconds if conditions are met
    if (canInstall && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, dismissed]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
    }
  }, [updateAvailable]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleUpdate = () => {
    update();
  };

  if (showUpdateBanner) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Nueva versión disponible</p>
              <p className="text-sm opacity-90 mt-1">
                Actualiza para obtener las últimas mejoras
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                className="mt-3"
              >
                Actualizar ahora
              </Button>
            </div>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-card border rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Instala AudioApp</p>
            <p className="text-muted-foreground text-sm mt-1">
              Accede más rápido y disfruta offline
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleInstall}>
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
