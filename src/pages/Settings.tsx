import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Globe, Database, Shield, Save } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

/**
 * Settings page for configuring volunteer copilot preferences, audio alerts, and telemetry parameters.
 *
 * @returns React Settings page element
 */
export const Settings: React.FC = () => {
  const [language, setLanguage] = useState<string>('English');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [crowdThreshold, setCrowdThreshold] = useState<number>(85);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-stadium-800/80 pb-4">
        <h1 className="text-2xl font-extrabold text-stadium-100 tracking-tight font-sans flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-brand-teal" />
          <span>Copilot System Settings</span>
        </h1>
        <p className="text-xs text-stadium-400 mt-1">
          Configure real-time crowd alerts, language defaults, and telemetry backend feeds.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>Settings saved successfully.</span>
          <Badge variant="success">Updated</Badge>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language & Accessibility */}
        <Card title="Multilingual Assistance" subtitle="Select default translation persona">
          <div className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="language-select"
                className="block text-xs font-semibold text-stadium-200 mb-2 flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4 text-brand-teal" />
                <span>Primary Interface Language</span>
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full sm:w-64 p-2.5 rounded-xl bg-stadium-900 border border-stadium-800 text-xs text-stadium-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="English">English (US)</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="German">Deutsch (German)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Telemetry & Crowd Thresholds */}
        <Card title="Crowd Telemetry Alerts" subtitle="Automated Gate Congestion Warning Thresholds">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-stadium-200 mb-2">
                <label htmlFor="threshold-slider" className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-brand-gold" />
                  <span>Congestion Trigger Percentage</span>
                </label>
                <span className="font-mono text-brand-gold">{crowdThreshold}%</span>
              </div>
              <input
                id="threshold-slider"
                type="range"
                min="50"
                max="98"
                value={crowdThreshold}
                onChange={(e) => setCrowdThreshold(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-stadium-800 accent-brand-teal cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stadium-800/60">
              <div>
                <span className="text-xs font-semibold text-stadium-200 block">
                  Audio Alert Signals
                </span>
                <span className="text-[11px] text-stadium-400">
                  Play tone when gate enters critical capacity.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAudioAlerts(!audioAlerts)}
                className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                  audioAlerts ? 'bg-brand-teal justify-end' : 'bg-stadium-800 justify-start'
                }`}
                aria-label="Toggle audio alerts"
              >
                <span className="w-4 h-4 rounded-full bg-stadium-950 shadow" />
              </button>
            </div>
          </div>
        </Card>

        {/* Integration Stubs */}
        <Card title="Infrastructure Readiness" subtitle="Prepared system connections">
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stadium-950/40 border border-stadium-800/60">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-brand-teal" />
                <div>
                  <span className="font-semibold text-stadium-200 block">Firebase SDK</span>
                  <span className="text-[11px] text-stadium-400">
                    Prepared stub (src/firebase/config.ts)
                  </span>
                </div>
              </div>
              <Badge variant="info">Ready for Config</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stadium-950/40 border border-stadium-800/60">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-brand-violet" />
                <div>
                  <span className="font-semibold text-stadium-200 block">Gemini AI Engine</span>
                  <span className="text-[11px] text-stadium-400">
                    Multilingual & recommendation pipeline
                  </span>
                </div>
              </div>
              <Badge variant="default">Phase 2 Target</Badge>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-teal text-stadium-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-teal"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
