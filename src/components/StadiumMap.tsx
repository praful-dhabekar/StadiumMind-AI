import React from 'react';

interface GatePoint {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface StadiumMapProps {
  /** Gate name currently recommended by Gemini */
  recommendedGate?: string | null;
  /** Current gate the fan is standing at */
  currentGate?: string;
  /** Called when user clicks a gate dot */
  onGateClick?: (gateName: string) => void;
}

const GATES: GatePoint[] = [
  { id: 'Gate A', label: 'A', x: 200, y: 60 },
  { id: 'Gate B', label: 'B', x: 310, y: 60 },
  { id: 'Gate C', label: 'C', x: 380, y: 140 },
  { id: 'Gate D', label: 'D', x: 380, y: 220 },
  { id: 'Gate E', label: 'E', x: 310, y: 300 },
  { id: 'Gate F', label: 'F', x: 200, y: 300 },
  { id: 'Gate G', label: 'G', x: 120, y: 220 },
  { id: 'Gate H', label: 'H', x: 120, y: 140 },
];

/**
 * SVG Stadium Map component for the AI Copilot page.
 * Shows a simplified top-down oval stadium layout with interactive gate markers.
 * Highlights the Gemini-recommended gate and the fan's current position.
 */
export const StadiumMap: React.FC<StadiumMapProps> = ({
  recommendedGate,
  currentGate,
  onGateClick,
}) => {
  return (
    <div className="relative w-full" role="img" aria-label="Stadium gate map">
      <svg
        viewBox="0 0 500 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* Outer stadium shell */}
        <ellipse
          cx="250" cy="180" rx="220" ry="155"
          fill="none"
          stroke="rgba(0,210,255,0.15)"
          strokeWidth="28"
        />
        {/* Outer stadium border */}
        <ellipse
          cx="250" cy="180" rx="220" ry="155"
          fill="none"
          stroke="rgba(0,210,255,0.35)"
          strokeWidth="2"
        />

        {/* Inner field */}
        <ellipse
          cx="250" cy="180" rx="140" ry="95"
          fill="rgba(16,185,129,0.08)"
          stroke="rgba(16,185,129,0.25)"
          strokeWidth="1.5"
        />

        {/* Pitch centre circle */}
        <ellipse
          cx="250" cy="180" rx="36" ry="28"
          fill="none"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth="1"
        />

        {/* Pitch centre line */}
        <line
          x1="250" y1="90" x2="250" y2="270"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Pitch label */}
        <text
          x="250" y="185"
          textAnchor="middle"
          fill="rgba(16,185,129,0.5)"
          fontSize="10"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          letterSpacing="2"
        >
          PITCH
        </text>

        {/* Gate markers */}
        {GATES.map((gate) => {
          const isRecommended = recommendedGate === gate.id;
          const isCurrent = currentGate === gate.id;
          const isNeither = !isRecommended && !isCurrent;

          return (
            <g
              key={gate.id}
              onClick={() => onGateClick?.(gate.id)}
              className={onGateClick ? 'cursor-pointer' : ''}
              role={onGateClick ? 'button' : undefined}
              aria-label={`${gate.id}${isRecommended ? ' (Recommended)' : ''}${isCurrent ? ' (Your location)' : ''}`}
            >
              {/* Pulse ring for recommended gate */}
              {isRecommended && (
                <circle
                  cx={gate.x} cy={gate.y} r="20"
                  fill="none"
                  stroke="rgba(0,210,255,0.4)"
                  strokeWidth="2"
                  className="animate-ping"
                  style={{ transformOrigin: `${gate.x}px ${gate.y}px` }}
                />
              )}

              {/* Gate dot */}
              <circle
                cx={gate.x} cy={gate.y} r="13"
                fill={
                  isRecommended
                    ? 'rgba(0,210,255,0.9)'
                    : isCurrent
                    ? 'rgba(251,191,36,0.9)'
                    : 'rgba(30,41,59,0.9)'
                }
                stroke={
                  isRecommended
                    ? '#00D2FF'
                    : isCurrent
                    ? '#FFB800'
                    : 'rgba(100,116,139,0.5)'
                }
                strokeWidth={isRecommended || isCurrent ? '2.5' : '1.5'}
                style={{ transition: 'all 0.4s ease' }}
              />

              {/* Gate letter */}
              <text
                x={gate.x} y={gate.y + 4}
                textAnchor="middle"
                fill={isNeither ? '#94A3B8' : '#030712'}
                fontSize="11"
                fontWeight="800"
                fontFamily="Inter, sans-serif"
              >
                {gate.label}
              </text>

              {/* Gate label tooltip below dot */}
              <text
                x={gate.x}
                y={gate.y + (gate.y < 180 ? -20 : 30)}
                textAnchor="middle"
                fill={
                  isRecommended ? '#00D2FF' : isCurrent ? '#FFB800' : 'rgba(148,163,184,0.7)'
                }
                fontSize="9"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.5"
              >
                {isRecommended ? '★ RECOMMENDED' : isCurrent ? '📍 YOU' : gate.id}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(85, 365)">
          <circle cx="8" cy="8" r="6" fill="rgba(0,210,255,0.9)" />
          <text x="18" y="12" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Recommended</text>
          <circle cx="105" cy="8" r="6" fill="rgba(251,191,36,0.9)" />
          <text x="115" y="12" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Your Location</text>
          <circle cx="210" cy="8" r="6" fill="rgba(30,41,59,0.9)" stroke="rgba(100,116,139,0.5)" strokeWidth="1.5"/>
          <text x="220" y="12" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Other Gates</text>
        </g>
      </svg>
    </div>
  );
};
