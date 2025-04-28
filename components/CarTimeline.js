// components/CarTimeline.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function CarTimeline({ 
  year, 
  make, 
  model, 
  isPremium, 
  timelineData = [],
  onTimelineLoaded = null
}) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    // If we already have timeline data passed from the parent, use it
    if (timelineData && timelineData.length > 0) {
      setTimeline(timelineData);
      if (onTimelineLoaded) onTimelineLoaded(timelineData);
      return;
    }

    // Otherwise, load the timeline data
    const loadTimelineData = async () => {
      if (!year || !make || !model || !isPremium) return;
      
      setLoading(true);
      setError('');
      
      try {
        const token = getToken();
        
        // This endpoint is now just a fallback in case we need it separately
        const response = await fetch('/api/car-timeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ year, make, model })
        });
        
        if (!response.ok) {
          throw new Error('Failed to load timeline data');
        }
        
        const data = await response.json();
        
        if (data.timeline && Array.isArray(data.timeline)) {
          setTimeline(data.timeline);
          if (onTimelineLoaded) onTimelineLoaded(data.timeline);
        }
      } catch (err) {
        console.error('Error loading timeline:', err);
        setError(err.message || 'Failed to load vehicle timeline');
      } finally {
        setLoading(false);
      }
    };
    
    // Only load if we don't already have data and the user is premium
    if (isPremium && (!timelineData || timelineData.length === 0)) {
      loadTimelineData();
    }
  }, [year, make, model, isPremium, timelineData, getToken, onTimelineLoaded]);

  // If not premium or there's no data to show yet, show upgrade prompt
  if (!isPremium) {
    return (
      <div className="upgrade-container">
        <h3>Vehicle Timeline</h3>
        <p>Upgrade to premium to see the complete design and engineering history of this vehicle.</p>
        <Link href="/pricing" className="upgrade-button">
          Go Premium
        </Link>
        <style jsx>{`
          .upgrade-container {
            background-color: #f0f7ff;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 2rem;
          }
          
          h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: #333;
          }
          
          p {
            color: #555;
            margin-bottom: 1.5rem;
          }
          
          .upgrade-button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #0070f3;
            color: white;
            border-radius: 6px;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .upgrade-button:hover {
            background-color: #0060df;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="timeline-spinner"></div>
        <p>Loading vehicle timeline...</p>
        <style jsx>{`
          .timeline-loading {
            padding: 2rem;
            text-align: center;
          }
          
          .timeline-spinner {
            margin: 0 auto 1rem;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0070f3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          p {
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-error">
        <p>Unable to load timeline data. Please try again later.</p>
        <style jsx>{`
          .timeline-error {
            background-color: #fff5f5;
            color: #e53e3e;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No timeline data available for this vehicle.</p>
        <style jsx>{`
          .timeline-empty {
            background-color: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline">
        {timeline.map((item, index) => (
          <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="timeline-content">
              <div className="timeline-year">{item.year}</div>
              <h4 className="timeline-title">{item.title}</h4>
              <p className="timeline-description">{item.description}</p>
              
              {item.engineeringChanges && item.engineeringChanges.length > 0 && (
                <div className="engineering-changes">
                  <h5>Engineering Changes:</h5>
                  <ul>
                    {item.engineeringChanges.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .timeline-container {
          padding: 1rem 0;
        }
        
        .timeline {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .timeline::after {
          content: '';
          position: absolute;
          width: 4px;
          background-color: #e0e0e0;
          top: 0;
          bottom: 0;
          left: 50%;
          margin-left: -2px;
        }
        
        .timeline-item {
          padding: 10px 40px;
          position: relative;
          width: 50%;
          box-sizing: border-box;
        }
        
        .timeline-item::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: white;
          border: 4px solid #0070f3;
          top: 20px;
          border-radius: 50%;
          z-index: 1;
        }
        
        .left {
          left: 0;
        }
        
        .right {
          left: 50%;
        }
        
        .left::after {
          right: -10px;
        }
        
        .right::after {
          left: -10px;
        }
        
        .timeline-content {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: relative;
          border-left: 4px solid #0070f3;
        }
        
        .timeline-year {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 16px;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }
        
        .timeline-title {
          margin: 0.5rem 0;
          color: #333;
          font-size: 1.2rem;
        }
        
        .timeline-description {
          color: #555;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        
        .engineering-changes {
          background-color: #f5f9ff;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }
        
        .engineering-changes h5 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #0070f3;
          font-size: 1rem;
        }
        
        .engineering-changes ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .engineering-changes li {
          margin-bottom: 0.5rem;
          color: #444;
        }
        
        /* Mobile view */
        @media screen and (max-width: 768px) {
          .timeline::after {
            left: 31px;
          }
          
          .timeline-item {
            width: 100%;
            padding-left: 70px;
            padding-right: 25px;
          }
          
          .timeline-item::after {
            left: 22px;
          }
          
          .left::after, .right::after {
            left: 22px;
          }
          
          .right {
            left: 0;
          }
        }
      `}</style>
    </div>
  );
}