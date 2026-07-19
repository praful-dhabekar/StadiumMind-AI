import React from 'react';
import { Menu, Bell, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { Badge } from './Badge';
import { useLiveClock } from '../hooks/useAnimations';

interface TopbarProps {
  onToggleSidebar: () => void;
}

/**
 * Top navigation bar with live clock, FIFA match status, notification badge, and volunteer info.
 * The live clock updates every second to reinforce the real-time operational feel.
 */
export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const time = useLiveClock();

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav px-4 lg:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-stadium-400 hover:text-stadium-100 hover:bg-stadium-800/60 focus:outline-none focus:ring-2 focus:ring-brand-teal transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stadium-400 border-l border-stadium-800/80 pl-3 ml-1">
          <MapPin className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
          <span className="font-medium text-stadium-200">MetLife Stadium</span>
          <span className="text-stadium-600">•</span>
          <span>East Rutherford, NJ</span>
        </div>
      </div>

      {/* Live Clock — center */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stadium-900/60 border border-stadium-800/60">
        <Clock className="w-3.5 h-3.5 text-brand-teal animate-pulse" aria-hidden="true" />
        <span
          className="text-xs font-mono font-bold text-stadium-100 tabular-nums tracking-wider"
          aria-live="off"
          aria-label="Current time"
        >
          {time}
        </span>
        <span className="hidden md:inline text-[10px] text-stadium-500 font-medium border-l border-stadium-700 pl-2 ml-1">
          USA vs BRA · KO 18:00
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="brand" pulse icon={<ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />}>
          Copilot Active
        </Badge>

        <button
          className="relative p-2 rounded-xl text-stadium-400 hover:text-stadium-100 hover:bg-stadium-800/60 focus:outline-none focus:ring-2 focus:ring-brand-teal transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-gold ring-2 ring-stadium-950"
            aria-hidden="true"
          />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-stadium-800/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-teal to-brand-violet text-stadium-950 font-bold text-xs flex items-center justify-center shadow-glow">
            V1
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-stadium-100 leading-tight">
              Alex Rivera
            </div>
            <div className="text-[10px] text-stadium-400">Gate Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
