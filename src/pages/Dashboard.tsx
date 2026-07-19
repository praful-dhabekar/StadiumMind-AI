import React, { useMemo } from 'react';
import {
  DoorOpen,
  Clock,
  AlertTriangle,
  Users,
  Car,
  Bath,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';
import { useAnimatedCounter } from '../hooks/useAnimations';
import { Link } from 'react-router-dom';

/** Animated metric card sub-component to keep Dashboard DRY */
interface MetricCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  badge: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, subtitle, icon, value, suffix, badge, trend,
}) => {
  const animated = useAnimatedCounter(value, 900);
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-stadium-500';

  return (
    <Card title={title} subtitle={subtitle} action={icon} hoverEffect>
      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-1.5">
          <div className="text-3xl font-extrabold text-stadium-100 font-sans tabular-nums">
            {animated}
          </div>
          {suffix && (
            <span className="text-sm font-normal text-stadium-400">{suffix}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {badge}
          {trend && (
            <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} aria-hidden="true" />
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Realtime Firestore-backed Dashboard page for StadiumMind AI.
 * Features animated metric counters that respond to live Firestore state changes.
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

  const metrics = useMemo(() => {
    const openGatesCount = gates.filter((g) => g.status === 'OPEN').length;
    const avgWaitTime =
      gates.length > 0
        ? Math.round(gates.reduce((sum, g) => sum + g.waitTime, 0) / gates.length)
        : 0;
    const activeIncidentsCount = incidents.filter((i) => i.status !== 'Resolved').length;
    const availableVolunteersCount = volunteers.filter((v) => v.available).length;
    const totalParkingAvailable = parking.reduce((sum, p) => sum + p.available, 0);
    const totalParkingCapacity = parking.reduce((sum, p) => sum + p.total, 0);
    const avgRestroomOccupancy =
      restrooms.length > 0
        ? Math.round(restrooms.reduce((sum, r) => sum + r.occupancy, 0) / restrooms.length)
        : 0;

    return {
      openGatesCount,
      avgWaitTime,
      activeIncidentsCount,
      availableVolunteersCount,
      totalParkingAvailable,
      totalParkingCapacity,
      avgRestroomOccupancy,
    };
  }, [gates, parking, volunteers, incidents, restrooms]);

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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-stadium-900 via-stadium-900/90 to-brand-teal/20 border border-brand-teal/30 shadow-glow">
        {/* Decorative animated background orb */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00D2FF, #8B5CF6)' }}
          aria-hidden="true"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
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
              to="/copilot"
              id="dashboard-copilot-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold text-stadium-950 font-bold text-sm hover:bg-amber-300 transition-all shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>AI Copilot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Animated Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Open Gates"
          subtitle={`of ${gates.length} total gates`}
          icon={<DoorOpen className="w-5 h-5 text-brand-teal" aria-hidden="true" />}
          value={metrics.openGatesCount}
          badge={
            <Badge variant={metrics.openGatesCount > 0 ? 'success' : 'error'}>
              {metrics.openGatesCount > 0 ? 'Operational' : 'All Closed'}
            </Badge>
          }
          trend={metrics.openGatesCount > 3 ? 'up' : metrics.openGatesCount < 2 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Average Wait Time"
          subtitle="Estimated queue time across entry points"
          icon={<Clock className="w-5 h-5 text-sky-400" aria-hidden="true" />}
          value={metrics.avgWaitTime}
          suffix="min"
          badge={
            <Badge variant={metrics.avgWaitTime > 20 ? 'warning' : 'info'}>
              {metrics.avgWaitTime > 20 ? 'High Delay' : 'Smooth Flow'}
            </Badge>
          }
          trend={metrics.avgWaitTime > 20 ? 'down' : 'up'}
        />

        <MetricCard
          title="Active Incidents"
          subtitle="Unresolved stadium incidents"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" aria-hidden="true" />}
          value={metrics.activeIncidentsCount}
          badge={
            <Badge
              variant={metrics.activeIncidentsCount > 0 ? 'error' : 'success'}
              pulse={metrics.activeIncidentsCount > 0}
            >
              {metrics.activeIncidentsCount > 0 ? 'Attention Required' : 'All Clear'}
            </Badge>
          }
          trend={metrics.activeIncidentsCount > 0 ? 'down' : 'up'}
        />

        <MetricCard
          title="Available Volunteers"
          subtitle="On-call volunteers ready for dispatch"
          icon={<Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
          value={metrics.availableVolunteersCount}
          suffix={`/ ${volunteers.length}`}
          badge={<Badge variant="success">Roster Active</Badge>}
          trend="neutral"
        />

        <MetricCard
          title="Parking Availability"
          subtitle={`Total capacity: ${metrics.totalParkingCapacity} spaces`}
          icon={<Car className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          value={metrics.totalParkingAvailable}
          suffix="spaces"
          badge={
            <Badge variant={metrics.totalParkingAvailable < 50 ? 'warning' : 'success'}>
              {metrics.totalParkingAvailable < 50 ? 'Limited' : 'Available'}
            </Badge>
          }
          trend={metrics.totalParkingAvailable < 50 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Restroom Occupancy"
          subtitle="Average occupancy level across wings"
          icon={<Bath className="w-5 h-5 text-brand-violet" aria-hidden="true" />}
          value={metrics.avgRestroomOccupancy}
          suffix="%"
          badge={
            <Badge variant={metrics.avgRestroomOccupancy > 80 ? 'warning' : 'info'}>
              {metrics.avgRestroomOccupancy > 80 ? 'High Usage' : 'Normal'}
            </Badge>
          }
          trend={metrics.avgRestroomOccupancy > 80 ? 'down' : 'neutral'}
        />
      </div>

      {/* Live Firestore Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gates Live Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stadium-100 flex items-center gap-2 font-sans">
              <DoorOpen className="w-5 h-5 text-brand-teal" aria-hidden="true" />
              <span>Firestore Gates Stream</span>
            </h2>
            <Link to="/gates" className="text-xs font-semibold text-brand-teal hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal rounded">
              View All →
            </Link>
          </div>

          {gates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gates.map((gate) => {
                const pct = Math.min(100, Math.round((gate.currentOccupancy / gate.capacity) * 100));
                const barColor =
                  gate.status === 'CONGESTED'
                    ? 'bg-rose-500'
                    : gate.status === 'OPEN'
                    ? 'bg-brand-teal'
                    : 'bg-stadium-700';

                return (
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
                        <span className="font-semibold text-stadium-200">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-stadium-800 overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
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
              <AlertTriangle className="w-5 h-5 text-rose-400" aria-hidden="true" />
              <span>Firestore Incidents Stream</span>
            </h2>
            <Link to="/incidents" className="text-xs font-semibold text-brand-teal hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal rounded">
              View All →
            </Link>
          </div>

          {incidents.length > 0 ? (
            <Card className="divide-y divide-stadium-800/60">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between transition-colors hover:bg-stadium-800/20 px-1 rounded"
                >
                  <div>
                    <div className="text-xs font-bold text-stadium-100 flex items-center gap-2">
                      <span>{incident.type} Incident</span>
                      <span className="text-[10px] text-stadium-400 font-mono">({incident.location})</span>
                    </div>
                    <div className="text-[11px] text-stadium-400 mt-0.5">
                      Severity: <span className="text-stadium-200">{incident.severity}</span>
                      {' '}• Reported:{' '}
                      {incident.timestamp
                        ? new Date(incident.timestamp).toLocaleTimeString()
                        : 'Just now'}
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
