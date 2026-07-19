import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Animated skeleton placeholder loader for card and metrics loading states.
 */
export const SkeletonCard: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 border border-stadium-800 bg-stadium-900/50 animate-pulse space-y-3',
        className
      )}
    >
      <div className="h-4 w-1/3 bg-stadium-800 rounded-lg" />
      <div className="h-8 w-2/3 bg-stadium-800 rounded-lg" />
      <div className="h-3 w-1/2 bg-stadium-800/60 rounded-lg" />
    </div>
  );
};

/**
 * Grid of skeleton cards for page loading state.
 */
export const SkeletonGrid: React.FC<SkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};
