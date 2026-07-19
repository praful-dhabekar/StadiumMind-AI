import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Car,
  Bath,
  Shuffle,
  Flame,
  Terminal,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import {
  simulateIncreaseGateCrowd,
  simulateDecreaseGateCrowd,
  simulateCreateIncident,
  simulateResolveIncident,
  simulateIncreaseParkingUsage,
  simulateDecreaseParkingUsage,
  simulateIncreaseRestroomOccupancy,
  simulateRandomizeStadiumState,
} from '../services/simulatorService';
import { useStadiumRealtimeData } from '../hooks/useStadiumRealtimeData';

/**
 * Admin Simulator page for live hackathon demo triggering Firestore mutations.
 */
export const Simulator: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { gates, parking, incidents, restrooms } = useStadiumRealtimeData();

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleAction = async (actionName: string, fn: () => Promise<any>) => {
    setIsProcessing(true);
    try {
      await fn();
      addLog(`FIRESTORE WRITE: Successfully executed ${actionName}`);
    } catch (e) {
      addLog(`ERROR: Failed to write ${actionName} to Firestore`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-stadium-900 via-stadium-900 to-amber-950/40 border border-brand-gold/40 shadow-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" pulse icon={<Flame className="w-3.5 h-3.5" />}>
                Hackathon Demo Mode
              </Badge>
              <span className="text-xs text-stadium-400 font-mono">REALTIME FIRESTORE WRITER</span>
            </div>
            <h1 className="text-2xl font-extrabold text-stadium-100 font-sans tracking-tight">
              Admin Stadium State Simulator
            </h1>
            <p className="text-xs text-stadium-300 mt-1 max-w-2xl leading-relaxed">
              Trigger real-time mutations directly into Firestore collections. Open the Dashboard in a separate tab or window to watch instant zero-delay updates!
            </p>
          </div>
          <Badge variant="brand">Firestore v12+ Modular API</Badge>
        </div>
      </div>

      {/* Simulator Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gate Controls */}
        <Card title="Gate Crowd Control" subtitle="Mutates 'gates' collection in Firestore">
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAction('Increase Gate Crowd', simulateIncreaseGateCrowd)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
              aria-label="Increase Gate Crowd"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Increase Gate Crowd (+150)</span>
              </span>
              <Badge variant="error">+Crowd</Badge>
            </button>

            <button
              onClick={() => handleAction('Decrease Gate Crowd', simulateDecreaseGateCrowd)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Decrease Gate Crowd"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Decrease Gate Crowd (-120)</span>
              </span>
              <Badge variant="success">-Crowd</Badge>
            </button>
          </div>
        </Card>

        {/* Incident Controls */}
        <Card title="Incident Dispatcher" subtitle="Mutates 'incidents' collection in Firestore">
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAction('Create Incident', simulateCreateIncident)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Create Incident"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Create Incident</span>
              </span>
              <Badge variant="warning">New Incident</Badge>
            </button>

            <button
              onClick={() => handleAction('Resolve Incident', simulateResolveIncident)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Resolve Incident"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Resolve Incident</span>
              </span>
              <Badge variant="success">Resolve</Badge>
            </button>
          </div>
        </Card>

        {/* Parking Controls */}
        <Card title="Parking Telemetry" subtitle="Mutates 'parking' collection in Firestore">
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAction('Increase Parking Usage', simulateIncreaseParkingUsage)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Increase Parking Usage"
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Increase Parking Usage</span>
              </span>
              <Badge variant="warning">-Available</Badge>
            </button>

            <button
              onClick={() => handleAction('Decrease Parking Usage', simulateDecreaseParkingUsage)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Decrease Parking Usage"
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                <span>Decrease Parking Usage</span>
              </span>
              <Badge variant="success">+Available</Badge>
            </button>
          </div>
        </Card>

        {/* Restroom Controls */}
        <Card title="Restroom Sensors" subtitle="Mutates 'restrooms' collection in Firestore">
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAction('Increase Restroom Occupancy', simulateIncreaseRestroomOccupancy)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stadium-800/80 hover:bg-brand-violet/20 text-purple-300 border border-brand-violet/30 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet"
              aria-label="Increase Restroom Occupancy"
            >
              <span className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-brand-violet" />
                <span>Increase Occupancy (+20%)</span>
              </span>
              <Badge variant="brand">+Occupancy</Badge>
            </button>
          </div>
        </Card>

        {/* Randomize State */}
        <Card title="Global Randomizer" subtitle="Randomizes state across all Firestore collections">
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleAction('Randomize Stadium State', simulateRandomizeStadiumState)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-brand-teal/30 to-blue-600/30 hover:from-brand-teal/40 hover:to-blue-600/40 text-brand-teal border border-brand-teal/50 font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal"
              aria-label="Randomize Stadium State"
            >
              <span className="flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                <span>Randomize Stadium State</span>
              </span>
              <Badge variant="brand" pulse>Randomize</Badge>
            </button>
          </div>
        </Card>
      </div>

      {/* Live Firestore Snapshot Telemetry Summary */}
      <Card title="Live Firestore Document Counts" subtitle="Current Firestore state in memory listener">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-2">
          <div className="p-3 rounded-xl bg-stadium-950/40 border border-stadium-800">
            <div className="text-xs text-stadium-400">Gates</div>
            <div className="text-xl font-bold text-stadium-100 font-mono mt-1">{gates.length} docs</div>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/40 border border-stadium-800">
            <div className="text-xs text-stadium-400">Parking Lots</div>
            <div className="text-xl font-bold text-stadium-100 font-mono mt-1">{parking.length} docs</div>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/40 border border-stadium-800">
            <div className="text-xs text-stadium-400">Incidents</div>
            <div className="text-xl font-bold text-stadium-100 font-mono mt-1">{incidents.length} docs</div>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/40 border border-stadium-800">
            <div className="text-xs text-stadium-400">Restrooms</div>
            <div className="text-xl font-bold text-stadium-100 font-mono mt-1">{restrooms.length} docs</div>
          </div>
        </div>
      </Card>

      {/* Audit Log Box */}
      <Card
        title="Realtime Firestore Audit Log"
        subtitle="Live feed of Firestore write operations executed"
        action={<Terminal className="w-4 h-4 text-brand-teal" />}
      >
        <div className="font-mono text-[11px] p-3 rounded-xl bg-stadium-950 border border-stadium-800 max-h-48 overflow-y-auto space-y-1.5 text-emerald-400">
          {logs.length > 0 ? (
            logs.map((log, i) => <div key={i}>{log}</div>)
          ) : (
            <div className="text-stadium-500 italic">No Firestore mutations triggered yet. Click a simulator button above!</div>
          )}
        </div>
      </Card>
    </div>
  );
};
