import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingProps } from '../types';
import { cn } from '../utils/cn';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * Reusable Loading spinner component with accessible ARIA live states.
 *
 * @param props Loading options
 * @returns React loading element
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  fullScreen = false,
  label = 'Loading stadium data...',
  className,
}) => {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 p-6 text-stadium-400', className)}
    >
      <Loader2
        className={cn('animate-spin text-brand-teal', sizeMap[size])}
        aria-hidden="true"
      />
      {label && <span className="text-sm font-medium tracking-wide">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stadium-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
