import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  AlertTriangle,
  Users,
  Settings,
  X,
  Trophy,
  Cpu,
  Activity,
  Sparkles,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/copilot', label: 'AI Copilot', icon: Sparkles },
  { path: '/gates', label: 'Gates & Crowd', icon: DoorOpen },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/volunteers', label: 'Volunteers', icon: Users },
  { path: '/simulator', label: 'Admin Simulator', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Responsive Sidebar navigation menu for StadiumMind AI dashboard.
 *
 * @param props Sidebar state and close handler
 * @returns React sidebar element
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stadium-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 glass-sidebar flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header Branding */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-stadium-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-blue-600 flex items-center justify-center text-stadium-950 font-extrabold shadow-glow">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-stadium-100 via-brand-teal to-sky-400 bg-clip-text text-transparent font-sans">
                StadiumMind
              </div>
              <div className="text-[10px] text-stadium-400 font-medium flex items-center gap-1">
                <Trophy className="w-3 h-3 text-brand-gold" />
                FIFA 2026 Copilot
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-stadium-400 hover:text-stadium-100 hover:bg-stadium-800/60 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            aria-label="Close sidebar navigation"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation items */}
        <nav aria-label="Main navigation" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stadium-500">
            Operations Command
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/50',
                    isActive
                      ? 'bg-gradient-to-r from-brand-teal/20 to-blue-500/10 text-brand-teal border border-brand-teal/30 shadow-glass-sm'
                      : 'text-stadium-400 hover:text-stadium-100 hover:bg-stadium-800/40'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-brand-teal' : 'text-stadium-400'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 border-t border-stadium-800/80">
          <div className="rounded-xl p-3 bg-stadium-900/50 border border-stadium-800/60 text-xs">
            <div className="flex items-center justify-between text-stadium-300 font-semibold mb-1">
              <span>Match 14 Feed</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-stadium-400">USA vs. Brazil • Kickoff 18:00</p>
          </div>
        </div>
      </aside>
    </>
  );
};
