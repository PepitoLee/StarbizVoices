import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Player } from '@/components/player/Player';
import { PWAInstallPrompt, OfflineIndicator } from '@/components/pwa';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Mobile header with logo - only visible on mobile */}
      <MobileHeader className="md:hidden" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <Sidebar className="hidden md:flex" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-[160px] md:pb-[90px]">
          {children}
        </main>
      </div>

      {/* Player - fixed at bottom */}
      <Player />

      {/* Mobile navigation - fixed at bottom, above player */}
      <MobileNav className="md:hidden" />

      {/* PWA install prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
