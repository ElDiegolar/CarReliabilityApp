// pages/search.js - Enhanced version with fixed timeline handling
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import SaveSearchButton from '../components/SaveSearchButton';
import DownloadPdfButton from '../components/DownloadPdfButton';
import CarTimeline from '../components/CarTimeline';

export default function Search() {
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { year: queryYear, make: queryMake, model: queryModel, mileage: queryMileage, fromSaved, savedId } = router.query;

  const apiRequestInProgress = useRef(false);
  const hasAutoSubmitted = useRef(false);
  
  // Track if timeline fetch has been attempted
  const timelineFetchAttempted = useRef(false);

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [savedTimelineData, setSavedTimelineData] = useState(null);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [carImageUrl, setCarImageUrl] = useState(null);

  // Dedicated function for timeline fetching with proper error handling
  const fetchTimelineData = async (year, make, model) => {
    if (!isPremium || !year || !make || !model || timelineFetchAttempted.current) return null;
    
    timelineFetchAttempted.current = true;
    setTimelineLoading(true);
    setTimelineError('');
    
    try {
      console.log(`Fetching timeline data for ${year} ${make} ${model}`);
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/car-timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ year, make, model })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch timeline data');
      }
      
      const data = await response.json();
      console.log('Timeline API response:', data);
      
      if (data.timeline && Array.isArray(data.timeline)) {
        console.log(`Received ${data.timeline.length} timeline items`);
        setTimelineData(data.timeline);
        return data.timeline;
      } else {
        console.warn('Timeline data format is invalid:', data);
        throw new Error('Invalid timeline data format');
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setTimelineError(err.message || 'Failed to load timeline data');
      return null;
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchCarImage = async (year, make, model) => {
    try {
      // Skip image fetching if we don't have an API key configured
      if (!process.env.NEXT_PUBLIC_SERPER_API_KEY) {
        console.log('Serper API key not configured, skipping image fetch');
        return null;
      }
      
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: `${year} ${make} ${model}` })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch car image');
      }
      
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        setCarImageUrl(data.images[0].imageUrl);
        return data.images[0].imageUrl;
      }
    } catch (err) {
      console.error('Failed to fetch car image:', err);
    }
    return null;
  };

  // Load vehicle data from URL parameters or saved vehicle
  useEffect(() => {
    const loadSavedVehicle = async () => {
      if (!savedId || !user || apiRequestInProgress.current) return;
      apiRequestInProgress.current = true;

      try {
        const token = getToken();
        const response = await fetch(`/api/saved-vehicles/get-one?id=${savedId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const vehicle = data.savedVehicle;
          
          if (vehicle?.reliability_data) {
            console.log('Loaded saved vehicle:', vehicle);
            
            // Apply premium status if user is premium
            if (isPremium) vehicle.reliability_data.isPremium = true;
            setResults(vehicle.reliability_data);
            
            // Handle timeline data from saved vehicle
            if (vehicle.timeline_data && Array.isArray(vehicle.timeline_data) && vehicle.timeline_data.length > 0) {
              console.log(`Loaded ${vehicle.timeline_data.length} timeline items from saved vehicle`);
              setTimelineData(vehicle.timeline_data);
              setSavedTimelineData(vehicle.timeline_data);
              timelineFetchAttempted.current = true;
            }

            // Handle car image if available
            if (vehicle.reliability_data.imageUrl) {
              setCarImageUrl(vehicle.reliability_data.imageUrl);
            } else {
              fetchCarImage(vehicle.year, vehicle.make, vehicle.model);
            }

            setShowSearchForm(false);
            return;
          }
        } else {
          console.error('Error loading saved vehicle:', await response.text());
        }
      } catch (err) {
        console.error('Error loading saved vehicle:', err);
      } finally {
        apiRequestInProgress.current = false;
      }

      // If saved vehicle loading fails, attempt auto-submission with query params
      if (queryYear && queryMake && queryModel && queryMileage && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        handleSubmit(null, true);
      }
    };

    // Set form data from URL parameters
    if (queryYear || queryMake || queryModel || queryMileage) {
      setFormData({
        year: queryYear || '',
        make: queryMake || '',
        model: queryModel || '',
        mileage: queryMileage || ''
      });
    }

    // Handle loading logic based on URL parameters
    if (fromSaved === 'true' && savedId) {
      loadSavedVehicle();
    } else if (queryYear && queryMake && queryModel && queryMileage && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleSubmit(null, true);
    }
  }, [queryYear, queryMake, queryModel, queryMileage, fromSaved, savedId, user, getToken, isPremium]);

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      try {
        const token = getToken();
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        console.log('User subscription data:', data.subscription);
        setSubscription(data.subscription);
        setIsPremium(!!data.subscription);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };
    
    checkSubscription();
  }, [user, getToken]);

  // Fetch timeline data when results are available and user is premium
  useEffect(() => {
    const loadTimelineDataIfNeeded = async () => {
      if (results && isPremium && !timelineFetchAttempted.current) {
        // If we don't have timeline data yet, fetch it
        if (timelineData.length === 0 && !savedTimelineData) {
          await fetchTimelineData(formData.year, formData.make, formData.model);
        }
      }
    };
    
    loadTimelineDataIfNeeded();
  }, [results, isPremium, formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetSearch = () => {
    setResults(null);
    setTimelineData([]);
    setSavedTimelineData(null);
    setTimelineError('');
    setCarImageUrl(null);
    setShowSearchForm(true);
    timelineFetchAttempted.current = false;
    router.replace('/search', undefined, { shallow: true });
    setFormData({ year: '', make: '', model: '', mileage: '' });
    hasAutoSubmitted.current = false;
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    if (apiRequestInProgress.current) return;

    apiRequestInProgress.current = true;
    setLoading(true);
    setError('');
    timelineFetchAttempted.current = false;

    if (!isAutoSubmit) {
      setResults(null);
      setTimelineData([]);
      setSavedTimelineData(null);
      setCarImageUrl(null);
    }

    try {
      const body = {
        ...formData,
        locale: router.locale,
        ...(user && { userId: user.id }),
        ...(subscription?.access_token && { premiumToken: subscription.access_token })
      };

      console.log('Sending reliability data request:', body);
      
      const res = await fetch('/api/car-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API error response:', errorData);
        throw new Error('Failed to fetch reliability data');
      }

      const data = await res.json();
      console.log('Received reliability data:', data);
      
      if (isPremium) data.isPremium = true;
      setResults(data);
      setShowSearchForm(false);

      // Fetch car image
      const imageUrl = await fetchCarImage(formData.year, formData.make, formData.model);
      if (imageUrl) {
        setResults(prev => ({ ...prev, imageUrl }));
      }

      // Update URL if not auto-submitted
      if (!isAutoSubmit) {
        router.push({
          pathname: router.pathname,
          query: {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            mileage: formData.mileage
          }
        }, undefined, { shallow: true });
      }
      
      // After getting results, we'll let the useEffect handle timeline fetching
    } catch (err) {
      console.error('Error fetching reliability data:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      apiRequestInProgress.current = false;
      setLoading(false);
    }
  };

  // Generate mock timeline data for testing
  const getMockTimelineData = () => {
    const baseYear = parseInt(formData.year || 2000);
    return [
      {
        year: formData.year,
        title: `${formData.make} ${formData.model} Released`,
        description: `The ${formData.year} ${formData.make} ${formData.model} was released to the public with several new features.`
      },
      {
        year: (baseYear + 2).toString(),
        title: 'Minor Update',
        description: `${formData.make} released a minor update to address some issues with the ${formData.model}.`
      },
      {
        year: (baseYear + 5).toString(),
        title: 'Major Redesign',
        description: `${formData.make} completely redesigned the ${formData.model} with improved reliability.`
      }
    ];
  };

  const handleUseMockData = () => {
    const mockData = getMockTimelineData();
    setTimelineData(mockData);
    setTimelineError('');
    setTimelineLoading(false);
  };

  return (
    <Layout title={t('search.title')}>
      <h1>{t('search.title')}</h1>

      {isPremium && (
        <div className="premium-badge">{t('search.premiumUser')}</div>
      )}

      {!showSearchForm && (
        <button onClick={() => setShowSearchForm(true)} className="reopen-button">
          {t('search.showForm') || 'Modify Search'}
        </button>
      )}

      {showSearchForm && (
        <form onSubmit={handleSubmit} className="search-form">
          {['year', 'make', 'model', 'mileage'].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>{t(`search.${field}`) || field}</label>
              <input
                type={field === 'mileage' || field === 'year' ? 'number' : 'text'}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                placeholder={t(`search.${field}Placeholder`) || `Enter ${field}`}
              />
            </div>
          ))}

          <div className="form-actions">
            {results && (
              <button type="button" onClick={resetSearch} className="reset-button">
                {t('search.reset') || 'Reset'}
              </button>
            )}
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <span className="spinner" /> : t('search.searchButton') || 'Search'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      {carImageUrl && (
        <div className="car-image">
          <img src={carImageUrl} alt={`${formData.make} ${formData.model}`} />
        </div>
      )}

      {results && (
        <div className="results">
          <h2>{t('search.resultsFor') || 'Results for'} {formData.year} {formData.make} {formData.model}</h2>
          
          <div className="score-card">
            <h3>{t('search.overallScore') || 'Overall Reliability Score'}</h3>
            <div className="score">
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>

          <div className="action-buttons">
            {user && (
              <SaveSearchButton
                vehicleData={results}
                searchParams={formData}
                timelineData={savedTimelineData || timelineData}
                savedId={savedId}
              />
            )}
            <DownloadPdfButton
              vehicleData={results}
              searchParams={formData}
              timelineData={savedTimelineData || timelineData}
            />
          </div>

          {/* Timeline Section */}
          {isPremium && (
            <div className="timeline-section">
              <h3>{t('timeline.title') || 'Vehicle Timeline'}</h3>
              
              {timelineLoading ? (
                <div className="timeline-loading">
                  <div className="loading-spinner"></div>
                  <p>{t('timeline.loading') || 'Loading timeline data...'}</p>
                </div>
              ) : timelineError ? (
                <div className="timeline-error">
                  <p>{timelineError}</p>
                  <button onClick={handleUseMockData} className="mock-data-button">
                    {t('timeline.useSampleData') || 'Use Sample Data'}
                  </button>
                </div>
              ) : timelineData.length > 0 ? (
                <div className="timeline">
                  {timelineData.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{item.year || item.date}</div>
                        <h4 className="timeline-title">{item.title}</h4>
                        <p className="timeline-description">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="timeline-empty">
                  <p>{t('timeline.noData') || 'No timeline data available for this vehicle.'}</p>
                  <button onClick={handleUseMockData} className="mock-data-button">
                    {t('timeline.useSampleData') || 'Use Sample Data'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category Scores */}
          <div className="categories">
            <h3>{t('search.categoryScores') || 'Category Scores'}</h3>
            <div className="category-grid">
              <div className="category">
                <h4>{t('search.engine') || 'Engine'}</h4>
                <div className="category-score">{results.categories.engine}/100</div>
              </div>
              <div className="category">
                <h4>{t('search.transmission') || 'Transmission'}</h4>
                <div className="category-score">{results.categories.transmission}/100</div>
              </div>

              {results.isPremium ? (
                <>
                  <div className="category">
                    <h4>{t('search.electrical') || 'Electrical System'}</h4>
                    <div className="category-score">{results.categories.electricalSystem}/100</div>
                  </div>
                  <div className="category">
                    <h4>{t('search.brakes') || 'Brakes'}</h4>
                    <div className="category-score">{results.categories.brakes}/100</div>
                  </div>
                  <div className="category">
                    <h4>{t('search.suspension') || 'Suspension'}</h4>
                    <div className="category-score">{results.categories.suspension}/100</div>
                  </div>
                  <div className="category">
                    <h4>{t('search.fuelSystem') || 'Fuel System'}</h4>
                    <div className="category-score">{results.categories.fuelSystem}/100</div>
                  </div>
                </>
              ) : (
                <div className="premium-prompt">
                  <p>{t('search.upgradeFull') || 'Upgrade to premium for full category breakdowns'}</p>
                  <Link href="/pricing" className="upgrade-button">
                    {t('search.goPremium') || 'Go Premium'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Common Issues - Only show for premium users and if there are issues */}
          {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
            <div className="common-issues">
              <h3>{t('search.commonIssues') || 'Common Issues'}</h3>
              <ul>
                {results.commonIssues.map((issue, index) => (
                  <li key={index}>
                    <strong>{issue.description}</strong>
                    <div>{t('search.costToFix') || 'Cost to Fix'}: {issue.costToFix}</div>
                    <div>{t('search.occurrence') || 'Occurrence'}: {issue.occurrence}</div>
                    <div>{t('search.typicalMileage') || 'Typical Mileage'}: {issue.mileage}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Analysis */}
          <div className="analysis">
            <h3>{t('search.analysis') || 'Analysis'}</h3>
            <p>{results.aiAnalysis}</p>

            {!results.isPremium && (
              <div className="upgrade-prompt">
                <p>{t('search.upgradePrompt') || 'Upgrade to premium for full AI analysis and detailed reports.'}</p>
                <Link href="/pricing" className="upgrade-button">
                  {t('search.goPremium') || 'Go Premium'}
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div className="search-actions">
              <Link href="/search-history" className="view-history-button">
                {t('search.viewSearchHistory') || 'View Search History'}
              </Link>
              <Link href="/saved-vehicles" className="view-saved-button">
                {t('search.viewSavedVehicles') || 'View Saved Vehicles'}
              </Link>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        h1 {
          margin-bottom: 2rem;
        }

        .premium-badge {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-weight: bold;
        }

        .reopen-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reopen-button:hover {
          background-color: #e5e5e5;
        }

        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        input {
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.15);
        }
        
        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .reset-button, .mock-data-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover, .mock-data-button:hover {
          background-color: #e5e5e5;
        }
        
        .search-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .search-button:hover {
          background-color: #005fc2;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #fff;
          border-top: 3px solid #0070f3;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error {
          color: red;
          padding: 1rem;
          background-color: #fff5f5;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #e53e3e;
        }
        
        .car-image {
          margin-bottom: 2rem;
          text-align: center;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .car-image img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .results {
          margin-top: 2rem;
        }
        
        .results h2 {
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.75rem;
        }

        .score-card {
          background-color: #f9fafb;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .score-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }

        .score {
          font-size: 3rem;
          font-weight: bold;
          color: #0070f3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-max {
          font-size: 1.5rem;
          color: #666;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .categories, .common-issues, .analysis, .timeline-section {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .categories h3, .common-issues h3, .analysis h3, .timeline-section h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .category {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .category:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .category h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #444;
        }

        .category-score {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0070f3;
        }

        .premium-prompt, .upgrade-prompt {
          background-color: #f0f7ff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          grid-column: 1 / -1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-top: 1rem;
        }

        .common-issues ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .common-issues li {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .common-issues li strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #333;
          font-size: 1rem;
      }









          .common-issues li strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #333;
          font-size: 1.1rem;
        }
        
        .common-issues li div {
          margin-bottom: 0.5rem;
          color: #555;
        }

        .analysis {
          padding: 2rem;
        }
        
        .analysis p {
          line-height: 1.6;
          color: #444;
          margin-top: 0;
        }

        .upgrade-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 1rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .upgrade-button:hover {
          background-color: #0060df;
        }

        /* Timeline specific styles */
        .timeline-loading, .timeline-empty, .timeline-error {
          padding: 2rem;
          text-align: center;
          color: #666;
        }
        
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #0070f3;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }
        
        .timeline {
          position: relative;
          padding-left: 2rem;
          margin-top: 2rem;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e0e0e0;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        .timeline-marker {
          position: absolute;
          left: -2rem;
          top: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #0070f3;
          transform: translateX(-50%);
          z-index: 1;
        }
        
        .timeline-content {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .timeline-date {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .timeline-title {
          margin: 0 0 0.75rem;
          color: #333;
        }
        
        .timeline-description {
          margin: 0;
          color: #444;
          line-height: 1.5;
        }

        .search-actions {
          margin-top: 3rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .view-history-button, .view-saved-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #0070f3;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .view-history-button:hover, .view-saved-button:hover {
          background-color: #e5f1ff;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(255, 255, 255, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          flex-direction: column;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 6px solid #ccc;
          border-top: 6px solid #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .search-form {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .search-actions {
            flex-direction: column;
          }
          
          .view-history-button, .view-saved-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>{t('search.loadingMessage') || 'Loading...'}</span>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}