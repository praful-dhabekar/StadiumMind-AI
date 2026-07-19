import React, { useState } from 'react';
import { DoorOpen, Users, Filter, Languages } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';
import { GateStatus } from '../types';

/**
 * Gates Management page for live crowd-aware gate telemetry from Firestore.
 */
export const Gates: React.FC = () => {
  const { gates, isLoading, isError, error } = useStadiumRealtimeData();
  const [filter, setFilter] = useState<GateStatus | 'all'>('all');

  if (isLoading) {
    return <Loading label="Connecting to Firestore Gates Stream..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gate Telemetry Offline"
        message={error?.message || 'Unable to fetch active gate flow data from Firestore.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const filteredGates =
    filter === 'all' ? gates : gates.filter((g) => g.status === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stadium-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stadium-100 tracking-tight font-sans flex items-center gap-2.5">
            <DoorOpen className="w-7 h-7 text-brand-teal" />
            <span>Stadium Gates & Crowd Flow</span>
          </h1>
          <p className="text-xs text-stadium-400 mt-1">
            Real-time Firestore gate telemetry, queue wait times, and crowd density controls.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stadium-400" />
          <div className="inline-flex p-1 rounded-xl bg-stadium-900 border border-stadium-800 text-xs">
            {(['all', 'OPEN', 'CONGESTED', 'CLOSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                    : 'text-stadium-400 hover:text-stadium-100'
                }`}
                aria-label={`Filter by ${status} status`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gates Grid */}
      {filteredGates && filteredGates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredGates.map((gate) => {
            const occupancyPct = Math.round((gate.currentOccupancy / gate.capacity) * 100);
            return (
              <Card
                key={gate.id}
                title={gate.name}
                subtitle={`Capacity: ${gate.capacity} • Wait Time: ${gate.waitTime}m`}
                hoverEffect
                action={
                  <Badge
                    variant={
                      gate.status === 'CONGESTED'
                        ? 'error'
                        : gate.status === 'CLOSED'
                        ? 'default'
                        : 'success'
                    }
                    pulse={gate.status === 'CONGESTED'}
                  >
                    {gate.status}
                  </Badge>
                }
                footer={
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stadium-400">
                      Firestore Doc ID: <span className="font-mono text-stadium-300">{gate.id}</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-stadium-300">
                      <Languages className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{gate.languages.join(', ')}</span>
                    </div>
                  </div>
                }
              >
                <div className="space-y-4 py-2">
                  {/* Occupancy progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-stadium-300 mb-1.5">
                      <span>Occupancy ({gate.currentOccupancy}/{gate.capacity})</span>
                      <span className="font-semibold text-stadium-100">
                        {occupancyPct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-stadium-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          occupancyPct > 90
                            ? 'bg-rose-500 shadow-glow'
                            : occupancyPct > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics detail */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stadium-950/40 border border-stadium-800/60 text-xs">
                    <div>
                      <div className="text-[11px] text-stadium-400">Queue Length</div>
                      <div className="text-base font-bold text-stadium-100 font-mono mt-0.5">
                        {gate.queueLength}{' '}
                        <span className="text-[10px] text-stadium-400 font-normal">
                          people
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-stadium-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-brand-teal" />
                        <span>Crowd Density</span>
                      </div>
                      <div className="text-base font-bold text-stadium-100 font-mono mt-0.5">
                        {gate.crowdLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Gates Match Filter"
          description="There are currently no gate documents matching the selected filter in Firestore."
          action={{
            label: 'Reset Filters',
            onClick: () => setFilter('all'),
          }}
        />
      )}
    </div>
  );
};
