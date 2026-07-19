import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorStateProps } from '../types';
import { cn } from '../utils/cn';

/**
 * Reusable ErrorState component for handling failed data queries and boundary exceptions.
 *
 * @param props Error display options
 * @returns React error state element
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Alert',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl p-6 bg-rose-950/30 border border-rose-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h4 className="text-base font-semibold text-rose-200 tracking-wide font-sans mb-1">
          {title}
        </h4>
        <p className="text-xs text-rose-300/80 leading-relaxed mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-stadium-950 transition-all duration-200"
            aria-label="Retry operation"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
};
