// components/CarTimeline.js - Timeline component for car design history
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';
  const {  getToken } = useAuth();

export default function CarTimeline({ year, make, model, isPremium }) {
  const { t } = useTranslation('common');
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!isPremium) return;
      
      try {
        const response = await fetch(`/api/car-timeline?year=${year}&make=${make}&model=${model}`, {
            method: 'GET',
            headers: {
              ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
            }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch timeline data');
        }
        
        const data = await response.json();
        setTimelineData(data.timeline || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeline();
  }, [year, make, model, isPremium]);

  if (!isPremium) {
    return (
      <div className="premium-prompt">
        <p>{t('timeline.upgradePrompt')}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">{t('timeline.loading')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (timelineData.length === 0) {
    return <div className="no-data">{t('timeline.noData')}</div>;
  }

  return (
    <div className="car-timeline">
      <h3>{t('timeline.title')}</h3>
      <div className="timeline-container">
        {timelineData.map((event, index) => (
          <div key={index} className="timeline-event">
            <div className="timeline-year">{event.year}</div>
            <div className="timeline-content">
              <h4>{event.title}</h4>
              <p>{event.description}</p>
              {event.imageUrl && (
                <div className="timeline-image">
                  <img src={event.imageUrl} alt={event.title} />
                </div>
              )}
              {event.engineeringChanges && event.engineeringChanges.length > 0 && (
                <div className="engineering-changes">
                  <h5>{t('timeline.engineeringChanges')}</h5>
                  <ul>
                    {event.engineeringChanges.map((change, idx) => (
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
        .car-timeline {
          margin: 2rem 0;
        }
        
        .timeline-container {
          position: relative;
          padding-left: 2rem;
          margin-left: 1rem;
          border-left: 2px solid #0070f3;
        }
        
        .timeline-event {
          position: relative;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
        }
        
        .timeline-event:last-child {
          margin-bottom: 0;
        }
        
        .timeline-year {
          position: absolute;
          left: -3.5rem;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          font-weight: bold;
        }
        
        .timeline-content {
          background-color: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-left: 1rem;
        }
        
        .timeline-content h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #0070f3;
        }
        
        .timeline-image {
          margin: 1rem 0;
          text-align: center;
        }
        
        .timeline-image img {
          max-width: 100%;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .engineering-changes {
          margin-top: 1rem;
          background-color: #e5f1ff;
          padding: 1rem;
          border-radius: 4px;
        }
        
        .engineering-changes h5 {
          margin-top: 0;
          margin-bottom: 0.75rem;
        }
        
        .engineering-changes ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .loading, .error, .no-data, .premium-prompt {
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          background-color: #f5f5f5;
        }
        
        .error {
          background-color: #fff5f5;
          color: #e53e3e;
        }
        
        .premium-prompt {
          background-color: #fffbea;
        }
      `}</style>
    </div>
  );
}