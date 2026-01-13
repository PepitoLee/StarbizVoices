'use client';

import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-center py-1 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>Sin conexión - Modo offline</span>
    </div>
  );
}
