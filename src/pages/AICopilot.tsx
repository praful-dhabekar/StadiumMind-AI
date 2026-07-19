import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Languages,
  Users,
  Compass,
  DoorOpen,
  FileText,
  Clock,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Cpu,
  History,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import {
  CopilotRequest,
  CopilotRecommendation,
  ObservabilityMetrics,
  FanLanguage,
  FanType,
  DestinationType,
} from '../../backend/models/copilotTypes';
import { requestCopilotRecommendation, fetchRecommendationLogs } from '../services/copilotApiService';

/** Shape of a single recommendation log entry from Firestore */
interface RecommendationLog {
  id?: string;
  timestamp: string;
  request?: {
    fanType?: string;
    fanLanguage?: string;
  };
  response?: {
    recommendedGate?: string;
    translatedMessage?: string;
  };
  duration?: number;
  engine?: string;
}

export const AICopilot: React.FC = () => {
  // Form State
  const [fanLanguage, setFanLanguage] = useState<FanLanguage>('English');
  const [fanType, setFanType] = useState<FanType>('Family');
  const [destination, setDestination] = useState<DestinationType>('Gate');
  const [currentGate, setCurrentGate] = useState<string>('Gate A');
  const [notes, setNotes] = useState<string>('Family has two young children. Looking stressed.');

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<CopilotRecommendation | null>(null);
  const [observability, setObservability] = useState<ObservabilityMetrics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // History State
  const [historyLogs, setHistoryLogs] = useState<RecommendationLog[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const logs = await fetchRecommendationLogs();
      setHistoryLogs(logs);
    } catch (_e) {
      // History is non-critical; silently skip
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setRecommendation(null);
    setObservability(null);

    const payload: CopilotRequest = {
      fanLanguage,
      fanType,
      destination,
      currentGate,
      notes: notes.trim(),
    };

    try {
      const response = await requestCopilotRecommendation(payload);
      if (response.success && response.data) {
        setRecommendation(response.data);
        if (response.observability) {
          setObservability(response.observability);
        }
        loadHistory();
      } else {
        setErrorMessage(response.error || 'Failed to generate copilot recommendation.');
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'An error occurred during AI reasoning.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (recommendation?.translatedMessage) {
      navigator.clipboard.writeText(recommendation.translatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stadium-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-violet flex items-center justify-center text-stadium-950 shadow-glow">
              <Sparkles className="w-5 h-5 fill-stadium-950" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-stadium-100 tracking-tight font-sans flex items-center gap-2">
                <span>AI Volunteer Copilot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-violet/20 text-brand-violet border border-brand-violet/30 font-mono font-bold">
                  Gemini 2.5 Flash
                </span>
              </h1>
              <p className="text-xs text-stadium-400 mt-0.5">
                Real-time generative AI reasoning over live Firestore stadium telemetry for FIFA World Cup 2026.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Mode Toggle */}
        <div className="flex items-center gap-3 bg-stadium-900/80 border border-stadium-800 p-2.5 rounded-2xl self-start md:self-auto">
          <Code2 className="w-4 h-4 text-brand-teal" />
          <span className="text-xs font-semibold text-stadium-200">Developer Mode</span>
          <button
            onClick={() => setDevMode(!devMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              devMode ? 'bg-brand-teal' : 'bg-stadium-800'
            }`}
            aria-label="Toggle Developer Mode Observability"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-stadium-950 transition-transform ${
                devMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Situation Input Form (Left) & AI Output Display (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Situation Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Situation Input" subtitle="Configure fan situation and destination parameters">
            <form onSubmit={handleGenerate} className="space-y-4 pt-1">
              {/* Fan Language Dropdown */}
              <div>
                <label
                  htmlFor="fan-language"
                  className="flex items-center gap-1.5 text-xs font-medium text-stadium-300 mb-1.5"
                >
                  <Languages className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
                  <span>Fan Spoken Language</span>
                </label>
                <select
                  id="fan-language"
                  value={fanLanguage}
                  onChange={(e) => setFanLanguage(e.target.value as FanLanguage)}
                  className="w-full bg-stadium-950 border border-stadium-800 rounded-xl px-3.5 py-2.5 text-xs text-stadium-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                </select>
              </div>

              {/* Fan Type Dropdown */}
              <div>
                <label
                  htmlFor="fan-type"
                  className="flex items-center gap-1.5 text-xs font-medium text-stadium-300 mb-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
                  <span>Fan Category / Demographic</span>
                </label>
                <select
                  id="fan-type"
                  value={fanType}
                  onChange={(e) => setFanType(e.target.value as FanType)}
                  className="w-full bg-stadium-950 border border-stadium-800 rounded-xl px-3.5 py-2.5 text-xs text-stadium-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Wheelchair User">Wheelchair User</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* Destination Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="destination"
                    className="flex items-center gap-1.5 text-xs font-medium text-stadium-300 mb-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
                    <span>Target Destination</span>
                  </label>
                  <select
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as DestinationType)}
                    className="w-full bg-stadium-950 border border-stadium-800 rounded-xl px-3.5 py-2.5 text-xs text-stadium-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    <option value="Gate">Gate Entry</option>
                    <option value="Section">Seat Section</option>
                    <option value="Restroom">Restroom</option>
                    <option value="Parking">Parking Lot</option>
                  </select>
                </div>

                {/* Current Gate Dropdown */}
                <div>
                  <label
                    htmlFor="current-gate"
                    className="flex items-center gap-1.5 text-xs font-medium text-stadium-300 mb-1.5"
                  >
                    <DoorOpen className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
                    <span>Current Gate</span>
                  </label>
                  <select
                    id="current-gate"
                    value={currentGate}
                    onChange={(e) => setCurrentGate(e.target.value)}
                    className="w-full bg-stadium-950 border border-stadium-800 rounded-xl px-3.5 py-2.5 text-xs text-stadium-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    <option value="Gate A">Gate A</option>
                    <option value="Gate B">Gate B</option>
                    <option value="Gate C">Gate C</option>
                    <option value="Gate D">Gate D</option>
                  </select>
                </div>
              </div>

              {/* Optional Notes Textbox */}
              <div>
                <label
                  htmlFor="volunteer-notes"
                  className="flex items-center gap-1.5 text-xs font-medium text-stadium-300 mb-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
                  <span>Optional Notes & Observations</span>
                </label>
                <textarea
                  id="volunteer-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g., Family has two children. Looking stressed."
                  aria-describedby="notes-hint"
                  className="w-full bg-stadium-950 border border-stadium-800 rounded-xl p-3 text-xs text-stadium-100 placeholder-stadium-500 focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                />
                <p id="notes-hint" className="sr-only">Optional context about the fan situation for better AI recommendations</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-emerald-500 text-stadium-950 font-extrabold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Bot className="w-4 h-4 animate-spin" />
                    <span>Gemini Reasoning Over Live Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-stadium-950" />
                    <span>Generate Recommendation</span>
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: AI Output & Observability (7 cols) */}
        {/* aria-live: screen readers announce new recommendations automatically */}
        <div className="lg:col-span-7 space-y-6" aria-live="polite" aria-atomic="false">
          {isLoading && (
            <Card className="min-h-[400px] flex items-center justify-center">
              <Loading label="Gemini 2.5 Flash analyzing Firestore gate telemetry, queue wait times & accessibility paths..." />
            </Card>
          )}

          {errorMessage && (
            <ErrorState
              title="Copilot Engine Exception"
              message={errorMessage}
              onRetry={() => handleGenerate()}
            />
          )}

          {!isLoading && !errorMessage && recommendation && (
            <div className="space-y-6">
              {/* Main Recommendation Card */}
              <Card
                title={`Recommended Action: ${recommendation.recommendedGate}`}
                subtitle="Calculated live from Firestore telemetry"
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        recommendation.priority === 'HIGH'
                          ? 'error'
                          : recommendation.priority === 'MEDIUM'
                          ? 'warning'
                          : 'success'
                      }
                      pulse={recommendation.priority === 'HIGH'}
                    >
                      {recommendation.priority} PRIORITY
                    </Badge>
                    <Badge variant="brand">
                      {Math.round(recommendation.confidence * 100)}% CONFIDENCE
                    </Badge>
                  </div>
                }
              >
                <div className="space-y-5 pt-2">
                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stadium-950/60 border border-stadium-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-stadium-400">Expected Wait Saved</div>
                        <div className="text-sm font-extrabold text-stadium-100 font-mono">
                          {recommendation.waitTimeSaved}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-stadium-400">Walking Route Delta</div>
                        <div className="text-sm font-extrabold text-stadium-100 font-mono">
                          {recommendation.walkingDifference}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning Section */}
                  <div>
                    <h4 className="text-xs font-bold text-stadium-200 mb-2.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-brand-teal" />
                      <span>AI Reasoning & Telemetry Analysis</span>
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.reasoning.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-stadium-300 p-2.5 rounded-xl bg-stadium-900/50 border border-stadium-800/40"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Translated Fan Message */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-stadium-900 to-stadium-950 border border-stadium-800 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Direct Fan Communication ({fanLanguage})</span>
                      </span>
                      <button
                        onClick={handleCopyMessage}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stadium-800 hover:bg-stadium-700 text-[11px] font-medium text-stadium-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        aria-label={copied ? 'Message copied to clipboard' : 'Copy fan message to clipboard'}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stadium-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-stadium-100 italic leading-relaxed">
                      "{recommendation.translatedMessage}"
                    </p>
                  </div>
                </div>
              </Card>

              {/* Developer Mode Observability Panel */}
              {devMode && observability && (
                <Card
                  title="Developer Mode Observability"
                  subtitle="Execution telemetry, active engine & token statistics"
                  glassmorphism
                >
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stadium-950/80 border border-stadium-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-brand-teal" />
                        <span className="font-bold text-stadium-200">Active Engine:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={observability.engine === 'Gemini' ? 'success' : 'warning'}>
                          {observability.engine === 'Gemini' ? '⚡ Gemini 2.5 Flash API' : '🛡️ Dynamic Fallback Engine'}
                        </Badge>
                        <span className="text-[11px] font-mono text-stadium-400">({observability.model})</span>
                      </div>
                    </div>

                    {observability.errorDetails && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
                        ⚠️ Engine Warning: {observability.errorDetails}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800/80">
                        <div className="text-[10px] text-stadium-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Latency</span>
                        </div>
                        <div className="text-base font-extrabold text-stadium-100 font-mono mt-1">
                          {observability.latencyMs} ms
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800/80">
                        <div className="text-[10px] text-stadium-400">Prompt Size</div>
                        <div className="text-base font-extrabold text-stadium-100 font-mono mt-1">
                          {observability.promptSizeBytes} B
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800/80">
                        <div className="text-[10px] text-stadium-400">Completion Size</div>
                        <div className="text-base font-extrabold text-stadium-100 font-mono mt-1">
                          {observability.completionSizeBytes} B
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800/80">
                        <div className="text-[10px] text-stadium-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-brand-teal" />
                          <span>Est. Tokens</span>
                        </div>
                        <div className="text-base font-extrabold text-stadium-100 font-mono mt-1">
                          ~{observability.estimatedTokens}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {!isLoading && !errorMessage && !recommendation && (
            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-stadium-900 border border-stadium-800 flex items-center justify-center text-brand-teal mb-4 shadow-glow">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stadium-100">Ready for Volunteer Copilot Inquiry</h3>
              <p className="text-xs text-stadium-400 max-w-md mt-1.5 leading-relaxed">
                Select the fan language, demographic type, target destination, and notes on the left, then click <strong>Generate Recommendation</strong> to run Gemini 2.5 Flash reasoning over live Firestore stadium state.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Firestore Recommendation Audit Logs Feed */}
      {historyLogs.length > 0 && (
        <Card title="Firestore Recommendation Logs" subtitle="Recent copilot prompts and AI decisions saved in recommendations collection">
          <div className="space-y-3 pt-1">
            {historyLogs.slice(0, 5).map((log: any, i: number) => (
              <div
                key={log.id || i}
                className="p-3.5 rounded-xl bg-stadium-950/50 border border-stadium-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stadium-100">
                      {log.request?.fanType || 'Fan'} → {log.response?.recommendedGate || 'Gate'}
                    </span>
                    <Badge variant="info">
                      {log.request?.fanLanguage || 'English'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stadium-400 italic">
                    "{log.response?.translatedMessage}"
                  </p>
                </div>

                <div className="flex items-center gap-4 text-stadium-400 text-[11px] font-mono shrink-0">
                  <span className="flex items-center gap-1">
                    <History className="w-3 h-3 text-brand-teal" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">{log.duration || 120}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
