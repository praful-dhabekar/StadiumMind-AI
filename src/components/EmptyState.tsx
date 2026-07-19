import React from 'react';
import { Inbox } from 'lucide-react';
import { EmptyStateProps } from '../types';
import { cn } from '../utils/cn';

/**
 * Reusable EmptyState component for empty data feeds, search results, or incident lists.
 *
 * @param props Empty state options
 * @returns React empty state element
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[240px]',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-stadium-800/80 border border-stadium-700/50 flex items-center justify-center text-brand-teal mb-4 shadow-glass-sm">
        {icon || <Inbox className="w-7 h-7" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-stadium-100 tracking-wide font-sans mb-1">
        {title}
      </h3>
      <p className="text-sm text-stadium-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30 border border-brand-teal/30 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-stadium-950 transition-all duration-200"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
