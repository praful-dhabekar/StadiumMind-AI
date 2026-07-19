import React from 'react';
import { BadgeProps, BadgeVariant } from '../types';
import { cn } from '../utils/cn';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-stadium-700/60 text-stadium-100 border-stadium-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  error: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  brand: 'bg-brand-teal/15 text-brand-teal border-brand-teal/40',
};

const pulseStyles: Record<BadgeVariant, string> = {
  default: 'bg-stadium-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  info: 'bg-sky-400',
  brand: 'bg-brand-teal',
};

/**
 * Reusable Badge UI component supporting multiple status variants, optional pulse indicator, and accessibility.
 *
 * @param props Badge component parameters
 * @returns React badge JSX element
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  icon,
  pulse = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors duration-200',
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseStyles[variant]
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              pulseStyles[variant]
            )}
          />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
