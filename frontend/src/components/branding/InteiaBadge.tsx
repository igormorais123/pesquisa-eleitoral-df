'use client';

import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface InteiaBadgeProps {
  variant?: 'default' | 'gradient' | 'subtle' | 'dark';
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function InteiaBadge({
  variant = 'default',
  size = 'sm',
  showIcon = true,
  className,
}: InteiaBadgeProps) {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const variantStyles = {
    default: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    gradient:
      'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
    subtle: 'bg-secondary border-border text-muted-foreground hover:text-amber-500',
    dark: 'bg-slate-900 border-amber-500/30 text-amber-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-tight transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <Building2 className={iconSizes[size]} />}
      <span>
        INTE<span className="text-amber-500">IA</span>
      </span>
    </div>
  );
}
