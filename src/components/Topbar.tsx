import React from 'react';
import { Menu, Search, Bell, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from './Badge';

interface TopbarProps {
  onToggleSidebar: () => void;
}

/**
 * Top navigation bar containing FIFA World Cup status, search input, notification badge, and volunteer info.
 *
 * @param props Navigation bar toggle handlers
 * @returns React topbar element
 */
export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
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

      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stadium-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search gates, incidents, or volunteer roster..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-stadium-900/60 border border-stadium-800 text-xs text-stadium-100 placeholder-stadium-500 focus:outline-none focus:border-brand-teal/50 focus:ring-1 focus:ring-brand-teal/50 transition-all"
            aria-label="Search stadium system"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="brand" pulse icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Copilot Active
        </Badge>

        <button
          className="relative p-2 rounded-xl text-stadium-400 hover:text-stadium-100 hover:bg-stadium-800/60 focus:outline-none focus:ring-2 focus:ring-brand-teal transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-gold ring-2 ring-stadium-950" />
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
