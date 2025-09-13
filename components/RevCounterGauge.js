import React from 'react';

/**
 * RevCounterGauge - A simple gauge/rev counter for category scores
 * Props:
 *   value: number (score, 0-100)
 *   max: number (default 100)
 *   label: string (category name)
 */
export default function RevCounterGauge({ value = 0, max = 100, label = '' }) {
  // Clamp value between 0 and max
  const safeValue = Math.max(0, Math.min(value, max));
  // Calculate rotation (e.g., -120deg to +120deg for 0-100)
  const minAngle = -120;
  const maxAngle = 120;
  const angle = minAngle + ((safeValue / max) * (maxAngle - minAngle));

  return (
    <div className="rev-counter-gauge" style={{ display: 'inline-block', textAlign: 'center', margin: '8px' }}>
      <div style={{ position: 'relative', width: 80, height: 50 }}>
        {/* Gauge background */}
        <svg width="80" height="50" viewBox="0 0 80 50">
          <path d="M10,40 Q40,0 70,40" stroke="#ccc" strokeWidth="6" fill="none" />
        </svg>
        {/* Needle */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 40,
            width: 0,
            height: 0,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          <svg width="4" height="32" style={{ position: 'absolute', left: -2, top: -32 }}>
            <rect x="1" y="0" width="2" height="28" fill="#e53935" />
            <circle cx="2" cy="28" r="4" fill="#333" />
          </svg>
        </div>
        {/* Score value */}
        <div style={{ position: 'absolute', left: 0, top: 44, width: '100%', fontWeight: 'bold', fontSize: 14 }}>
          {safeValue} / {max}
        </div>
      </div>
      <div style={{ fontSize: 13, marginTop: 2 }}>{label}</div>
    </div>
  );
}
