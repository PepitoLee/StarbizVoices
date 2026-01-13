'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center gap-3 px-4 py-3',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        className
      )}
    >
      <Link href="/home" className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            src="/logo.png"
            alt={APP_NAME}
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="font-display text-lg font-bold tracking-tight">
          {APP_NAME}
        </span>
      </Link>
    </header>
  );
}
