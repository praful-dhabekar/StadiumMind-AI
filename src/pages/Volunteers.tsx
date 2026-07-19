import React, { useState } from 'react';
import { Users, Globe, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';
import { toggleVolunteerAvailability } from '../services/volunteerService';

/**
 * Volunteers page displaying active FIFA World Cup volunteer copilot roster from Firestore.
 */
export const Volunteers: React.FC = () => {
  const { volunteers, isLoading, isError, error } = useStadiumRealtimeData();
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');

  if (isLoading) {
    return <Loading label="Connecting to Firestore Volunteers Stream..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Roster Telemetry Error"
        message={error?.message || 'Could not load active volunteer assignments from Firestore.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const filteredVolunteers =
    availabilityFilter === 'all'
      ? volunteers
      : availabilityFilter === 'available'
      ? volunteers.filter((v) => v.available)
      : volunteers.filter((v) => !v.available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stadium-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stadium-100 tracking-tight font-sans flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-teal" />
            <span>Volunteer Copilot Roster</span>
          </h1>
          <p className="text-xs text-stadium-400 mt-1">
            Multilingual support teams, gate leads, and accessibility assistance force in Firestore.
          </p>
        </div>

        {/* Availability Filters */}
        <div className="inline-flex p-1 rounded-xl bg-stadium-900 border border-stadium-800 text-xs">
          {(['all', 'available', 'busy'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setAvailabilityFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                availabilityFilter === filter
                  ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                  : 'text-stadium-400 hover:text-stadium-100'
              }`}
              aria-label={`Filter volunteers by ${filter}`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Grid */}
      {filteredVolunteers && filteredVolunteers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredVolunteers.map((vol) => (
            <Card key={vol.id} hoverEffect>
              <div className="flex items-start gap-4">
                {/* Avatar icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-violet text-stadium-950 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-glow">
                  {vol.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-stadium-100 text-base font-sans">
                        {vol.name}
                      </h3>
                      <p className="text-xs text-brand-teal font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Zone: {vol.zone}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => toggleVolunteerAvailability(vol.id)}
                      className="focus:outline-none"
                      title="Click to toggle availability in Firestore"
                    >
                      <Badge
                        variant={vol.available ? 'success' : 'default'}
                        pulse={vol.available}
                      >
                        {vol.available ? 'AVAILABLE' : 'BUSY'}
                      </Badge>
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stadium-800/60 text-xs">
                    <div className="flex items-center gap-1.5 text-stadium-300">
                      <Globe className="w-3.5 h-3.5 text-stadium-400" />
                      <div className="flex items-center gap-1 flex-wrap">
                        {vol.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-0.5 rounded bg-stadium-800 text-[10px] font-mono text-stadium-200"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-stadium-400 pt-2 border-t border-stadium-800/60">
                    <span>Firestore Collection: <strong className="text-stadium-200">volunteers</strong></span>
                    <span className="font-mono">Doc ID: {vol.id}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Volunteers Found"
          description="No volunteer personnel match the current selection in Firestore."
          action={{
            label: 'Show All Volunteers',
            onClick: () => setAvailabilityFilter('all'),
          }}
        />
      )}
    </div>
  );
};
