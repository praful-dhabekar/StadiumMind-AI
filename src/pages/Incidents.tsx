import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';
import { IncidentSeverity } from '../types';
import { simulateCreateIncident } from '../services/simulatorService';

/**
 * Incidents management page reading live Firestore incidents stream.
 */
export const Incidents: React.FC = () => {
  const { incidents, isLoading, isError, error } = useStadiumRealtimeData();
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');

  if (isLoading) {
    return <Loading label="Connecting to Firestore Incidents Stream..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Incident Feed Error"
        message={error?.message || 'Could not retrieve real-time incident reports from Firestore.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const filteredIncidents =
    severityFilter === 'all'
      ? incidents
      : incidents.filter((i) => i.severity === severityFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stadium-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stadium-100 tracking-tight font-sans flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
            <span>Incident Command Log</span>
          </h1>
          <p className="text-xs text-stadium-400 mt-1">
            Realtime Firestore incident telemetry, severity classification, and dispatch tracking.
          </p>
        </div>

        <button
          onClick={() => simulateCreateIncident()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs hover:bg-rose-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
          aria-label="Report new incident to Firestore"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-stadium-400 font-medium mr-1">Severity:</span>
        {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              severityFilter === sev
                ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                : 'bg-stadium-900 text-stadium-400 hover:text-stadium-200'
            }`}
            aria-label={`Filter incidents by ${sev} severity`}
          >
            {sev.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Incidents Feed */}
      {filteredIncidents && filteredIncidents.length > 0 ? (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              title={`${incident.type} Incident`}
              subtitle={`Location: ${incident.location}`}
              action={
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      incident.severity === 'Critical' || incident.severity === 'High'
                        ? 'error'
                        : incident.severity === 'Medium'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {incident.severity.toUpperCase()}
                  </Badge>
                  <Badge
                    variant={
                      incident.status === 'Resolved'
                        ? 'success'
                        : incident.status === 'In Progress'
                        ? 'brand'
                        : 'error'
                    }
                    pulse={incident.status === 'Open'}
                  >
                    {incident.status.toUpperCase()}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pt-3 border-t border-stadium-800/60 text-stadium-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-teal" />
                      <span className="font-mono">
                        {incident.timestamp ? new Date(incident.timestamp).toLocaleString() : 'Just now'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{incident.location}</span>
                    </span>
                  </div>

                  <span className="font-mono text-[11px]">Doc ID: {incident.id}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Incidents Reported"
          description="There are currently no active stadium incident documents matching this filter in Firestore."
          action={{
            label: 'Clear Severity Filter',
            onClick: () => setSeverityFilter('all'),
          }}
        />
      )}
    </div>
  );
};
