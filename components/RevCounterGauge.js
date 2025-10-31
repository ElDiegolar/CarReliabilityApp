
import React from 'react';

/**
 * RevCounterGauge - Clean horizontal progress bar for category scores
 * Props:
 *   value: number (score, 0-100)
 *   max: number (default 100)
 *   label: string (category name)
 */
export default function RevCounterGauge({ value = 0, max = 100, label = '' }) {
  const safeValue = Math.max(0, Math.min(value || 0, max));
  const percentage = (safeValue / max) * 100;
  
  // Color based on value ranges
  const getValueColor = (val) => {
    if (val >= 80) return '#22c55e'; // Green
    if (val >= 60) return '#f59e0b'; // Orange
    if (val >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };
  
  const getScoreLabel = (val) => {
    if (val >= 80) return 'Excellent';
    if (val >= 60) return 'Good';
    if (val >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span className="category-name">{label}</span>
        <div className="score-info">
          <span className="score-label">{getScoreLabel(safeValue)}</span>
          <span className="score-value">{Math.round(safeValue)}</span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getValueColor(safeValue)
            }}
          />
        </div>
        
        <div className="progress-markers">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      <style jsx>{`
        .progress-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin: 10px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 2px solid ${getValueColor(safeValue)};
          transition: all 0.3s ease;
        }

        .progress-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .category-name {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          text-transform: capitalize;
        }

        .score-info {
          text-align: right;
        }

        .score-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${getValueColor(safeValue)};
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .score-value {
          display: block;
          font-size: 24px;
          font-weight: 800;
          color: ${getValueColor(safeValue)};
        }

        .progress-container {
          margin-bottom: 8px;
        }

        .progress-track {
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .progress-markers {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .progress-card {
            margin: 8px;
            padding: 16px;
          }
          
          .category-name {
            font-size: 14px;
          }
          
          .score-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
