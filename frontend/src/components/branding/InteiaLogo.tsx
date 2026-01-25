'use client';

import { cn } from '@/lib/utils';

interface InteiaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  xs: { logo: 'text-sm', icon: 'w-4 h-4', tagline: 'text-[8px]' },
  sm: { logo: 'text-lg', icon: 'w-5 h-5', tagline: 'text-[9px]' },
  md: { logo: 'text-xl', icon: 'w-6 h-6', tagline: 'text-[10px]' },
  lg: { logo: 'text-2xl', icon: 'w-8 h-8', tagline: 'text-xs' },
  xl: { logo: 'text-3xl', icon: 'w-10 h-10', tagline: 'text-sm' },
};

export function InteiaLogo({
  size = 'md',
  variant = 'full',
  className,
  showTagline = false,
}: InteiaLogoProps) {
  const sizes = sizeMap[size];

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center',
          sizes.icon,
          className
        )}
      >
        <span className="font-bold text-white" style={{ fontSize: '60%' }}>
          IA
        </span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={cn('font-bold tracking-tight', sizes.logo, className)}>
        <span className="text-foreground">INTE</span>
        <span className="text-amber-500">IA</span>
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25',
          sizes.icon
        )}
      >
        <span className="font-bold text-white" style={{ fontSize: '55%' }}>
          IA
        </span>
      </div>
      <div className="flex flex-col">
        <span className={cn('font-bold tracking-tight leading-none', sizes.logo)}>
          <span className="text-foreground">INTE</span>
          <span className="text-amber-500">IA</span>
        </span>
        {showTagline && (
          <span className={cn('text-muted-foreground leading-tight mt-0.5', sizes.tagline)}>
            Instituto de Inteligencia Artificial
          </span>
        )}
      </div>
    </div>
  );
}
