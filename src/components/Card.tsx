import React from 'react';
import { CardProps } from '../types';
import { cn } from '../utils/cn';

/**
 * Reusable Card component featuring Google Antigravity glassmorphism design, optional headers, and hover animations.
 *
 * @param props Card container options and children
 * @returns React card container element
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  footer,
  glassmorphism = true,
  hoverEffect = false,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 border transition-all duration-300',
        glassmorphism ? 'glass-card' : 'bg-stadium-900 border-stadium-800',
        hoverEffect && 'glass-card-hover cursor-pointer',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-stadium-800/60">
          <div>
            {title && (
              <h3 className="font-semibold text-lg text-stadium-100 tracking-wide font-sans">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-stadium-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="text-stadium-100">{children}</div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-stadium-800/60 text-xs text-stadium-400">
          {footer}
        </div>
      )}
    </div>
  );
};
