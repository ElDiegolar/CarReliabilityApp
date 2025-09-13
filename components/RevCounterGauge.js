
import React from 'react';

/**
 * RevCounterGauge - Circular, large gauge for category scores
 * Props:
 *   value: number (score, 0-100)
 *   max: number (default 100)
 *   label: string (category name)
 */
export default function RevCounterGauge({ value = 0, max = 100, label = '' }) {
  const safeValue = Math.max(0, Math.min(value, max));
  // 270-degree gauge: -225deg to +45deg
  const minAngle = -225;
  const maxAngle = 45;
  const angle = minAngle + ((safeValue / max) * (maxAngle - minAngle));

  // Gauge size
  const size = 200;
  const radius = 90;
  const centerX = size / 2;
  const centerY = size / 2;
  const needleLength = radius - 12;

  // Arc start/end for 270deg
  const startAngleRad = (Math.PI / 180) * minAngle;
  const endAngleRad = (Math.PI / 180) * maxAngle;
  const startX = centerX + radius * Math.cos(startAngleRad);
  const startY = centerY + radius * Math.sin(startAngleRad);
  const endX = centerX + radius * Math.cos(endAngleRad);
  const endY = centerY + radius * Math.sin(endAngleRad);

  // Needle endpoint
  const needleRad = (Math.PI / 180) * angle;
  const needleX = centerX + needleLength * Math.cos(needleRad);
  const needleY = centerY + needleLength * Math.sin(needleRad);

  // Large arc flag for SVG
  const largeArcFlag = 1; // Always 270deg for background arc
  // For value arc, sweep-flag should be 1 if value > 50%
  const valueArcSweepFlag = safeValue > max / 2 ? 1 : 0;

  return (
    <div className="rev-counter-gauge" style={{ display: 'inline-block', textAlign: 'center', margin: '24px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
          {/* Background arc */}
          <path
            d={`M${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`}
            stroke="#eee"
            strokeWidth="18"
            fill="none"
          />
          {/* Value arc */}
          <path
            d={`M${startX},${startY} A${radius},${radius} 0 0,${valueArcSweepFlag} ${needleX},${needleY}`}
            stroke="#ff9800"
            strokeWidth="18"
            fill="none"
          />
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#e53935"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="14" fill="#333" />
        </svg>
        {/* Score value */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: size / 2.1,
          width: '100%',
          fontWeight: 'bold',
          fontSize: 32,
          color: '#e53935',
          textShadow: '0 2px 8px #fff',
        }}>
          {safeValue} / {max}
        </div>
      </div>
      <div style={{ fontSize: 20, marginTop: 24, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
