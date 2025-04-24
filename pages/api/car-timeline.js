import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

const CarTimeline = ({ timelineData, onLoad, isPremium }) => {
  const { t } = useTranslation('common');
  const [localTimelineData, setLocalTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // If timeline data is already provided, use it
    if (timelineData && timelineData.length > 0) {
      setLocalTimelineData(timelineData);
      if (onLoad) onLoad(timelineData);
      return;
    }
    
    // Only attempt to load timeline data if user is premium
    if (isPremium) {
      setLoading(true);
      // Mock API call to fetch timeline data
      const fetchTimelineData = async () => {
        try {
          // This would typically be an API call
          // For demonstration, create mock data after a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockTimelineData = [
            {
              year: 2010,
              title: "Initial Model Release",
              description: "First generation model introduced to the market.",
              engineeringChanges: [
                "Base engine offered with 180hp",
                "5-speed automatic transmission"
              ]
            },
            {
              year: 2013,
              title: "Mid-cycle Refresh",
              description: "Updated styling and interior features.",
              engineeringChanges: [
                "Improved fuel efficiency",
                "Enhanced safety features"
              ]
            },
            {
              year: 2016,
              title: "Major Redesign",
              description: "Complete platform overhaul with new technologies.",
              engineeringChanges: [
                "New 210hp turbocharged engine option",
                "8-speed automatic transmission",
                "Advanced driver assistance systems"
              ]
            }
          ];
          
          setLocalTimelineData(mockTimelineData);
          if (onLoad) onLoad(mockTimelineData);
        } catch (error) {
          console.error("Error fetching timeline data:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTimelineData();
    }
  }, [timelineData, onLoad, isPremium]);
  
  // If not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <div className="timeline-section">
        <h2>{t('timeline.title') || 'Design History & Engineering Timeline'}</h2>
        <div className="premium-prompt">
          <p>{t('timeline.premiumRequired') || 'Upgrade to premium to see this vehicle\'s design and engineering timeline.'}</p>
          <Link href="/pricing" className="upgrade-button">
            {t('search.goPremium') || 'Go Premium'}
          </Link>
        </div>
        
        <style jsx>{`
          .timeline-section {
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            padding: 2rem;
            margin-bottom: 2rem;
          }
          
          .timeline-section h2 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.75rem;
          }
          
          .premium-prompt {
            background-color: #fffbea;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-top: 1rem;
          }
          
          .upgrade-button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #0070f3;
            color: white;
            border-radius: 6px;
            font-weight: 500;
            margin-top: 0.5rem;
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
  
  // If no timeline data available
  if (!loading && (!localTimelineData || localTimelineData.length === 0)) {
    return (
      <div className="timeline-section">
        <h2>{t('timeline.title') || 'Design History & Engineering Timeline'}</h2>
        <p className="no-data">{t('timeline.noData') || 'No timeline data available for this vehicle model.'}</p>
        
        <style jsx>{`
          .timeline-section {
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            padding: 2rem;
            margin-bottom: 2rem;
          }
          
          .timeline-section h2 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.75rem;
          }
          
          .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className="timeline-section">
      <h2>{t('timeline.title') || 'Design History & Engineering Timeline'}</h2>
      
      {loading ? (
        <div className="loading">
          <div className="timeline-spinner" />
          <p>{t('timeline.loading') || 'Loading timeline data...'}</p>
        </div>
      ) : (
        <div className="timeline">
          {localTimelineData.map((event, index) => (
            <div className="timeline-event" key={index}>
              <div className="timeline-year">
                <span>{event.year}</span>
              </div>
              <div className="timeline-content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                
                {event.engineeringChanges && event.engineeringChanges.length > 0 && (
                  <div className="engineering-changes">
                    <h4>{t('timeline.engineeringChanges') || 'Engineering Changes'}</h4>
                    <ul>
                      {event.engineeringChanges.map((change, changeIndex) => (
                        <li key={changeIndex}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .timeline-section {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .timeline-section h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }
        
        .loading {
          text-align: center;
          padding: 2rem 0;
        }
        
        .timeline-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #eee;
          border-top: 4px solid #0070f3;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background-color: #e5e5e5;
          border-radius: 4px;
        }
        
        .timeline-event {
          position: relative;
          margin-bottom: 2.5rem;
        }
        
        .timeline-event:last-child {
          margin-bottom: 0;
        }
        
        .timeline-year {
          position: absolute;
          left: -2.5rem;
          top: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #0070f3;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        
        .timeline-content {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-left: 1rem;
        }
        
        .timeline-content h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #333;
        }
        
        .timeline-content p {
          margin-bottom: 1rem;
          color: #444;
          line-height: 1.6;
        }
        
        .engineering-changes {
          background-color: rgba(0, 112, 243, 0.05);
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }
        
        .engineering-changes h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #0070f3;
          font-size: 1rem;
        }
        
        .engineering-changes ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .engineering-changes li {
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .engineering-changes li:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default CarTimeline;