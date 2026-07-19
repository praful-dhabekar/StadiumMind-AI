import React from 'react';
import {
  DoorOpen,
  Clock,
  AlertTriangle,
  Users,
  Car,
  Bath,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';
import { Link } from 'react-router-dom';

/**
 * Realtime Firestore-backed Dashboard page for StadiumMind AI.
 */
export const Dashboard: React.FC = () => {
  const {
    gates,
    parking,
    volunteers,
    incidents,
    restrooms,
    isLoading,
    isError,
    error,
  } = useStadiumRealtimeData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl bg-stadium-900/50 animate-pulse" />
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Firestore Realtime Disconnected"
        message={error?.message || 'Failed to establish realtime listener with Firestore.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // 1. Open Gates
  const openGates = gates.filter((g) => g.status === 'OPEN');
  const openGatesCount = openGates.length;

  // 2. Average Wait Time (minutes)
  const avgWaitTime =
    gates.length > 0
      ? Math.round(
          gates.reduce((sum, g) => sum + g.waitTime, 0) / gates.length
        )
      : 0;

  // 3. Active Incidents
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const activeIncidentsCount = activeIncidents.length;

  // 4. Available Volunteers
  const availableVolunteersCount = volunteers.filter((v) => v.available).length;

  // 5. Parking Availability (Total available spaces across lots)
  const totalParkingAvailable = parking.reduce((sum, p) => sum + p.available, 0);
  const totalParkingCapacity = parking.reduce((sum, p) => sum + p.total, 0);

  // 6. Restroom Occupancy (Average occupancy percentage)
  const avgRestroomOccupancy =
    restrooms.length > 0
      ? Math.round(
          restrooms.reduce((sum, r) => sum + r.occupancy, 0) / restrooms.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-stadium-900 via-stadium-900/90 to-brand-teal/20 border border-brand-teal/30 shadow-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" pulse icon={<Sparkles className="w-3.5 h-3.5" />}>
                Firestore Realtime Active
              </Badge>
              <span className="text-xs text-stadium-400 font-mono">MATCHDAY CONTROL</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-stadium-100 tracking-tight font-sans">
              Stadium Operations Dashboard
            </h1>
            <p className="text-sm text-stadium-300 leading-relaxed max-w-2xl">
              Live telemetry reading directly from Firestore collections. All metrics update instantly on Firestore state mutations.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold text-stadium-950 font-bold text-sm hover:bg-amber-300 transition-all shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <Activity className="w-4 h-4" />
              <span>Admin Simulator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Required Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Open Gates */}
        <Card
          title="Open Gates"
          subtitle={`${openGatesCount} of ${gates.length} gates functional`}
          action={<DoorOpen className="w-5 h-5 text-brand-teal" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-stadium-100 font-sans">
              {openGatesCount} / {gates.length}
            </div>
            <Badge variant={openGatesCount > 0 ? 'success' : 'error'}>
              {openGatesCount > 0 ? 'Operational' : 'All Closed'}
            </Badge>
          </div>
        </Card>

        {/* Card 2: Average Wait Time */}
        <Card
          title="Average Wait Time"
          subtitle="Estimated queue time across entry points"
          action={<Clock className="w-5 h-5 text-sky-400" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-stadium-100 font-sans">
              {avgWaitTime} <span className="text-sm font-normal text-stadium-400">min</span>
            </div>
            <Badge variant={avgWaitTime > 20 ? 'warning' : 'info'}>
              {avgWaitTime > 20 ? 'High Delay' : 'Smooth Flow'}
            </Badge>
          </div>
        </Card>

        {/* Card 3: Active Incidents */}
        <Card
          title="Active Incidents"
          subtitle="Unresolved stadium incidents"
          action={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-rose-400 font-sans">
              {activeIncidentsCount}
            </div>
            <Badge variant={activeIncidentsCount > 0 ? 'error' : 'success'} pulse={activeIncidentsCount > 0}>
              {activeIncidentsCount > 0 ? 'Attention Required' : 'All Clear'}
            </Badge>
          </div>
        </Card>

        {/* Card 4: Available Volunteers */}
        <Card
          title="Available Volunteers"
          subtitle="On-call volunteers ready for dispatch"
          action={<Users className="w-5 h-5 text-emerald-400" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-emerald-400 font-sans">
              {availableVolunteersCount} <span className="text-sm font-normal text-stadium-400">/ {volunteers.length}</span>
            </div>
            <Badge variant="success">Roster Active</Badge>
          </div>
        </Card>

        {/* Card 5: Parking Availability */}
        <Card
          title="Parking Availability"
          subtitle={`Total capacity: ${totalParkingCapacity} spaces`}
          action={<Car className="w-5 h-5 text-amber-400" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-stadium-100 font-sans">
              {totalParkingAvailable} <span className="text-sm font-normal text-stadium-400">spaces</span>
            </div>
            <Badge variant={totalParkingAvailable < 50 ? 'warning' : 'success'}>
              {totalParkingAvailable < 50 ? 'Limited' : 'Available'}
            </Badge>
          </div>
        </Card>

        {/* Card 6: Restroom Occupancy */}
        <Card
          title="Restroom Occupancy"
          subtitle="Average occupancy level across wings"
          action={<Bath className="w-5 h-5 text-brand-violet" />}
        >
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-stadium-100 font-sans">
              {avgRestroomOccupancy}%
            </div>
            <Badge variant={avgRestroomOccupancy > 80 ? 'warning' : 'info'}>
              {avgRestroomOccupancy > 80 ? 'High Usage' : 'Normal'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Live Firestore Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gates Live Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stadium-100 flex items-center gap-2 font-sans">
              <DoorOpen className="w-5 h-5 text-brand-teal" />
              <span>Firestore Gates Stream</span>
            </h2>
            <Link to="/gates" className="text-xs font-semibold text-brand-teal hover:underline">
              View All →
            </Link>
          </div>

          {gates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gates.map((gate) => (
                <Card
                  key={gate.id}
                  title={gate.name}
                  subtitle={`Queue: ${gate.queueLength} • Wait: ${gate.waitTime}m`}
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
                    >
                      {gate.status}
                    </Badge>
                  }
                >
                  <div className="text-xs space-y-2 mt-1">
                    <div className="flex justify-between text-stadium-400">
                      <span>Occupancy: {gate.currentOccupancy}/{gate.capacity}</span>
                      <span className="font-semibold text-stadium-200">
                        {Math.round((gate.currentOccupancy / gate.capacity) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-stadium-800 overflow-hidden">
                      <div
                        className="h-full bg-brand-teal transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (gate.currentOccupancy / gate.capacity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Gate Documents"
              description="Firestore gates collection is empty."
            />
          )}
        </div>

        {/* Active Incidents Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stadium-100 flex items-center gap-2 font-sans">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Firestore Incidents Stream</span>
            </h2>
            <Link to="/incidents" className="text-xs font-semibold text-brand-teal hover:underline">
              View All →
            </Link>
          </div>

          {incidents.length > 0 ? (
            <Card className="divide-y divide-stadium-800/60">
              {incidents.map((incident) => (
                <div key={incident.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stadium-100 flex items-center gap-2">
                      <span>{incident.type} Incident</span>
                      <span className="text-[10px] text-stadium-400 font-mono">({incident.location})</span>
                    </div>
                    <div className="text-[11px] text-stadium-400 mt-0.5">
                      Severity: <span className="text-stadium-200">{incident.severity}</span> • Reported: {incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>

                  <Badge
                    variant={
                      incident.status === 'Resolved'
                        ? 'success'
                        : incident.status === 'In Progress'
                        ? 'brand'
                        : 'error'
                    }
                  >
                    {incident.status}
                  </Badge>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState
              title="No Incident Reports"
              description="No incidents recorded in Firestore."
            />
          )}
        </div>
      </div>
    </div>
  );
};
