
import React from 'react';

/**
 * RevCounterGauge - Accurate, stable circular gauge for category scores
 * Props:
 *   value: number (score, 0-100)
 *   max: number (default 100)
 *   label: string (category name)
 */
export default function RevCounterGauge({ value = 0, max = 100, label = '' }) {
  const safeValue = Math.max(0, Math.min(value, max));
  
  // Fixed dimensions for consistency
  const GAUGE_SIZE = 180;
  const GAUGE_RADIUS = 75;
  const CENTER_X = GAUGE_SIZE / 2;
  const CENTER_Y = GAUGE_SIZE / 2;
  const STROKE_WIDTH = 12;
  const NEEDLE_LENGTH = GAUGE_RADIUS - 8;
  
  // 270-degree gauge: start at bottom-left, sweep clockwise  
  const START_ANGLE = 225; // degrees (bottom-left)
  const END_ANGLE = 315;   // degrees (bottom-right) 
  const TOTAL_RANGE = 270; // degrees
  
  // Calculate current value angle (clockwise from start)
  const valueAngle = START_ANGLE + ((safeValue / max) * TOTAL_RANGE);
  
  // Convert angles to radians for calculations
  const startRad = (START_ANGLE * Math.PI) / 180;
  const endRad = (END_ANGLE * Math.PI) / 180;
  const valueRad = (valueAngle * Math.PI) / 180;
  
  // Calculate arc endpoints
  const startX = CENTER_X + GAUGE_RADIUS * Math.cos(startRad);
  const startY = CENTER_Y + GAUGE_RADIUS * Math.sin(startRad);
  const endX = CENTER_X + GAUGE_RADIUS * Math.cos(endRad);
  const endY = CENTER_Y + GAUGE_RADIUS * Math.sin(endRad);
  const valueX = CENTER_X + GAUGE_RADIUS * Math.cos(valueRad);
  const valueY = CENTER_Y + GAUGE_RADIUS * Math.sin(valueRad);
  
  // Calculate needle endpoint
  const needleX = CENTER_X + NEEDLE_LENGTH * Math.cos(valueRad);
  const needleY = CENTER_Y + NEEDLE_LENGTH * Math.sin(valueRad);
  
  // Determine arc flags for SVG paths
  const backgroundLargeArc = 1;
  const valueLargeArc = (safeValue / max) > 0.5 ? 1 : 0;
  
  // Color based on value ranges
  const getValueColor = (val) => {
    if (val >= 80) return '#4caf50'; // Green
    if (val >= 60) return '#ff9800'; // Orange
    if (val >= 40) return '#ffc107'; // Yellow
    return '#f44336'; // Red
  };

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: GAUGE_SIZE + 40,
      height: GAUGE_SIZE + 80,
      margin: '10px',
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      {/* Gauge SVG Container */}
      <div style={{
        position: 'relative',
        width: GAUGE_SIZE,
        height: GAUGE_SIZE,
        marginBottom: '15px'
      }}>
        <svg 
          width={GAUGE_SIZE} 
          height={GAUGE_SIZE} 
          viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
          style={{ overflow: 'visible' }}
        >
          {/* Background arc (gray) */}
          <path
            d={`M ${startX} ${startY} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 ${backgroundLargeArc} 1 ${endX} ${endY}`}
            stroke="#e0e0e0"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Value arc (colored) */}
          {safeValue > 0 && (
            <path
              d={`M ${startX} ${startY} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 ${valueLargeArc} 1 ${valueX} ${valueY}`}
              stroke={getValueColor(safeValue)}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
            />
          )}
          
          {/* Needle */}
          <line
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={needleX}
            y2={needleY}
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Center circle */}
          <circle 
            cx={CENTER_X} 
            cy={CENTER_Y} 
            r="8" 
            fill="#333"
            stroke="#fff"
            strokeWidth="2"
          />
        </svg>
        
        {/* Score display */}
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 8px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          {safeValue}
        </div>
      </div>
      
      {/* Label */}
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#555',
        textAlign: 'center',
        maxWidth: '120px',
        lineHeight: '1.2',
        wordWrap: 'break-word'
      }}>
        {label}
      </div>
    </div>
  );
}
