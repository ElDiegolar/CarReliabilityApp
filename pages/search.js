// pages/search.js - Car search page with translations
import { useState, useEffect } from 'react';
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
  const { year: queryYear, make: queryMake, model: queryModel, mileage: queryMileage } = router.query;

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
  const [submitted, setSubmitted] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [savedTimelineData, setSavedTimelineData] = useState(null);

  // Check if we're coming from saved vehicles page and need to load a specific saved vehicle
  const { fromSaved, savedId } = router.query;
  
  // Set form data from query parameters if they exist
  useEffect(() => {
    if (queryYear || queryMake || queryModel || queryMileage) {
      setFormData({
        year: queryYear || '',
        make: queryMake || '',
        model: queryModel || '',
        mileage: queryMileage || ''
      });
      
      // If we're coming from saved vehicles page and have all necessary info
      if (fromSaved === 'true' && savedId && user) {
        const loadSavedVehicle = async () => {
          try {
            const token = getToken();
            const response = await fetch(`/api/saved-vehicles/get-one?id=${savedId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.savedVehicle?.reliability_data) {
                // Set the results directly from saved data
                setResults(data.savedVehicle.reliability_data);
                
                // Set timeline data if it exists in the saved vehicle
                if (data.savedVehicle.timeline_data) {
                  setSavedTimelineData(data.savedVehicle.timeline_data);
                  setTimelineData(data.savedVehicle.timeline_data);
                  console.log('Loaded timeline from saved vehicle:', data.savedVehicle.timeline_data.length);
                }
                
                setLoading(false);
                return; // Skip the auto-submit since we already have results
              }
            }
          } catch (err) {
            console.error('Error loading saved vehicle data:', err);
            // Continue with normal auto-submit if loading saved data fails
          }
          
          // If we reached here, loading the saved vehicle failed, so do a normal search instead
          if (queryYear && queryMake && queryModel && queryMileage) {
            await handleSubmit(null, true);
          }
        };
        
        loadSavedVehicle();
      } 
      // Normal auto-submit if not coming from saved vehicles
      else if (queryYear && queryMake && queryModel && queryMileage) {
        const autoSubmitForm = async () => {
          await handleSubmit(null, true);
        };
        autoSubmitForm();
      }
    }
  }, [queryYear, queryMake, queryModel, queryMileage]);

  // Fix: Make sure to trigger new search when savedId changes (coming back from save page)
  useEffect(() => {
    if (savedId && fromSaved === 'true' && user) {
      const loadSavedOrSearch = async () => {
        try {
          setLoading(true);
          const token = getToken();
          const response = await fetch(`/api/saved-vehicles/get-one?id=${savedId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.savedVehicle?.reliability_data) {
              // Set the results directly from saved data
              setResults(data.savedVehicle.reliability_data);
              
              // Set timeline data if it exists in the saved vehicle
              if (data.savedVehicle.timeline_data) {
                setSavedTimelineData(data.savedVehicle.timeline_data);
                setTimelineData(data.savedVehicle.timeline_data);
              } else {
                setSavedTimelineData(null);
                setTimelineData([]);
              }
              
              setLoading(false);
              return;
            }
          }
          
          // If loading the saved vehicle failed, do a new search
          if (queryYear && queryMake && queryModel && queryMileage) {
            await handleSubmit(null, true);
          } else {
            setLoading(false);
            setError('Could not load saved vehicle data');
          }
        } catch (err) {
          console.error('Error loading saved vehicle data:', err);
          if (queryYear && queryMake && queryModel && queryMileage) {
            await handleSubmit(null, true);
          } else {
            setLoading(false);
            setError('Error loading saved vehicle: ' + err.message);
          }
        }
      };
      
      loadSavedOrSearch();
    }
  }, [savedId, fromSaved]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          const token = getToken();
          const response = await fetch('/api/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setSubscription(data.subscription);
            setIsPremium(!!data.subscription);
          }
        } catch (err) {
          console.error('Error fetching subscription:', err);
        }
      }
    };

    checkSubscription();
  }, [user, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setError('');
    
    // Clear any existing timeline data when doing a new search
    if (!isAutoSubmit) {
      setTimelineData([]);
      setSavedTimelineData(null);
    }

    try {
      const requestBody = {
        ...formData,
        locale: router.locale
      };

      if (user) {
        requestBody.userId = user.id;
      }

      if (subscription?.access_token) {
        requestBody.premiumToken = subscription.access_token;
      }

      const response = await fetch('/api/car-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reliability data');
      }

      const data = await response.json();
      setResults(data);
      
      // Update URL with search parameters for easy sharing/bookmarking
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
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle timeline data loading
  const handleTimelineLoaded = (data) => {
    console.log('Timeline data loaded:', data.length);
    setTimelineData(data);
  };

  return (
    <Layout title={t('search.title')}>
      <div className="search-container">
        <h1 className="search-title">{t('search.title')}</h1>

        {isPremium && (
          <div className="premium-badge">
            <span>{t('search.premiumUser')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-form-fields">
            <div className="form-group">
              <label htmlFor="year">{t('search.year')}</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1980"
                max="2025"
                required
                placeholder="e.g. 2018"
              />
            </div>

            <div className="form-group">
              <label htmlFor="make">{t('search.make')}</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                placeholder="e.g. Toyota"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">{t('search.model')}</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g. Camry"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mileage">{t('search.mileage')}</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                max="500000"
                required
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="search-button">
            {loading ? <span className="spinner" /> : t('search.searchButton')}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {results && (
          <div className="results">
            <h2 className="results-title">{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>

            <div className="score-card">
              <h3>{t('search.overallScore')}</h3>
              <div className="score">
                <span className="score-value">{results.overallScore}</span>
                <span className="score-max">/100</span>
              </div>
            </div>

            <div className="action-buttons">
              {/* Add SaveSearchButton component */}
              {user && (
                <SaveSearchButton 
                  vehicleData={results} 
                  searchParams={formData}
                  timelineData={savedTimelineData || timelineData}
                  savedId={router.query.savedId}
                />
              )}
              
              {/* Add DownloadPdfButton component */}
              <DownloadPdfButton 
                vehicleData={results} 
                searchParams={formData}
                timelineData={savedTimelineData || timelineData}
              />
            </div>

            <div className="categories">
              <h3>{t('search.categoryScores')}</h3>
              <div className="category-grid">
                <div className="category">
                  <h4>{t('search.engine')}</h4>
                  <div className="category-score">{results.categories.engine}/100</div>
                </div>
                <div className="category">
                  <h4>{t('search.transmission')}</h4>
                  <div className="category-score">{results.categories.transmission}/100</div>
                </div>

                {results.isPremium ? (
                  <>
                    <div className="category">
                      <h4>{t('search.electrical')}</h4>
                      <div className="category-score">{results.categories.electricalSystem}/100</div>
                    </div>
                    <div className="category">
                      <h4>{t('search.brakes')}</h4>
                      <div className="category-score">{results.categories.brakes}/100</div>
                    </div>
                    <div className="category">
                      <h4>{t('search.suspension')}</h4>
                      <div className="category-score">{results.categories.suspension}/100</div>
                    </div>
                    <div className="category">
                      <h4>{t('search.fuelSystem')}</h4>
                      <div className="category-score">{results.categories.fuelSystem}/100</div>
                    </div>
                  </>
                ) : (
                  <div className="premium-prompt">
                    <p>{t('search.upgradeFull')}</p>
                  </div>
                )}
              </div>
            </div>

            {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
              <div className="common-issues">
                <h3>{t('search.commonIssues')}</h3>
                <ul>
                  {results.commonIssues.map((issue, index) => (
                    <li key={index}>
                      <strong>{issue.description}</strong>
                      <div>{t('search.costToFix')}: {issue.costToFix}</div>
                      <div>{t('search.occurrence')}: {issue.occurrence}</div>
                      <div>{t('search.typicalMileage')}: {issue.mileage}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="analysis">
              <h3>{t('search.analysis')}</h3>
              <p>{results.aiAnalysis}</p>

              {!results.isPremium && (
                <div className="upgrade-prompt">
                  <p>{t('search.upgradePrompt')}</p>
                  <Link href="/pricing" className="upgrade-button">
                    {t('search.goPremium')}
                  </Link>
                </div>
              )}
            </div>
              
            {results && results.isPremium && (
              <div className="timeline-section">
                <h2>{t('timeline.sectionTitle', 'Vehicle Timeline')}</h2>
                
                {/* If we have saved timeline data, display it directly */}
                {savedTimelineData ? (
                  <div className="car-timeline">
                    <h3>{t('timeline.title', 'Model History Timeline')}</h3>
                    <div className="timeline-container">
                      {savedTimelineData.map((event, index) => (
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
                                <h5>{t('timeline.engineeringChanges', 'Engineering Changes')}</h5>
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
                  </div>
                ) : (
                  /* Otherwise fetch the timeline data */
                  <CarTimeline 
                    year={formData.year}
                    make={formData.make}
                    model={formData.model}
                    isPremium={results.isPremium}
                    onTimelineLoaded={handleTimelineLoaded}
                  />
                )}
              </div>
            )}
            
            {user && (
              <div className="search-actions">
                <Link href="/search-history" className="action-button">
                  {t('search.viewSearchHistory')}
                </Link>
                <Link href="/saved-vehicles" className="action-button">
                  {t('search.viewSavedVehicles', 'View Saved Vehicles')}
                </Link>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>{t('search.loadingMessage') || 'Loading...'}</span>
          </div>
        )}
      </div>
      <style jsx>{`
  .search-container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .search-title {
    margin-bottom: 2rem;
    color: #333;
    font-size: 2rem;
    text-align: center;
  }

  .premium-badge {
    display: inline-block;
    background-color: #0070f3;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 112, 243, 0.15);
  }

  .search-form {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto 2rem;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .search-form:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .search-form-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .search-form-fields {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #444;
    font-size: 0.95rem;
  }

  input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #f8fafc;
  }
  
  input:focus {
    outline: none;
    border-color: #0070f3;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.15);
    background: white;
  }

  .search-button {
    padding: 1rem 2rem;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    align-self: center;
    margin-top: 1rem;
    box-shadow: 0 4px 14px rgba(0, 112, 243, 0.25);
    width: 100%;
    max-width: 300px;
  }

  .search-button:hover {
    background-color: #0060df;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 112, 243, 0.35);
  }

  .search-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.5);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    flex-direction: column;
    backdrop-filter: blur(3px);
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 6px solid rgba(0, 112, 243, 0.1);
    border-top: 6px solid #0070f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    color: #e53e3e;
    background-color: #fff5f5;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 4px solid #e53e3e;
  }

  .results {
    margin-top: 3rem;
  }
  
  .results-title {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.75rem;
    color: #333;
  }

  .score-card {
    background: linear-gradient(135deg, #0070f3, #00a5fa);
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
    color: white;
    box-shadow: 0 8px 20px rgba(0, 112, 243, 0.2);
  }
  
  .score-card h3 {
    margin-top: 0;
    font-size: 1.4rem;
    margin-bottom: 1rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .score {
    font-size: 3.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .score-value {
    position: relative;
  }

  .score-max {
    font-size: 1.5rem;
    opacity: 0.7;
    margin-left: 0.25rem;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .categories {
    margin-bottom: 2.5rem;
  }
  
  .categories h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .category {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #f0f0f0;
  }
  
  .category:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
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
    background-color: #fffbea;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    grid-column: 1 / -1;
    border-left: 4px solid #f6ad55;
  }

  .common-issues {
    margin-bottom: 2.5rem;
  }
  
  .common-issues h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .common-issues ul {
    list-style-type: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .common-issues li {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
    transition: transform 0.2s;
  }
  
  .common-issues li:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  .common-issues li strong {
    display: block;
    margin-bottom: 0.75rem;
    color: #0070f3;
    font-size: 1.1rem;
  }
  
  .common-issues li div {
    margin-bottom: 0.5rem;
    color: #555;
  }

  .analysis {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
  }
  
  .analysis h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
    font-size: 1.5rem;
  }
  
  .analysis p {
    line-height: 1.6;
    color: #444;
  }

  .upgrade-prompt {
    margin-top: 2rem;
    background-color: #e6f7ff;
    border-left: 4px solid #0070f3;
  }

  .upgrade-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #0070f3;
    color: white;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 1rem;
    text-decoration: none;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(0, 112, 243, 0.25);
  }

  .upgrade-button:hover {
    background-color: #0060df;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 112, 243, 0.35);
  }
  
  .search-actions {
    margin-top: 2.5rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .action-button {
    display: inline-block;
    padding: 0.875rem 1.5rem;
    background-color: #f8fafc;
    color: #0070f3;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid #e2e8f0;
  }
  
  .action-button:hover {
    background-color: #e5f1ff;
    border-color: #0070f3;
    transform: translateY(-2px);
  }

  /* Timeline styles (duplicated here for saved timeline display) */
  .timeline-section {
    margin: 3rem 0;
  }
  
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
    margin-bottom: 2.5rem;
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
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 112, 243, 0.2);
  }
  
  .timeline-content {
    background-color: white;
    padding: 1.75rem;
    border-radius: 12px;
    margin-left: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .timeline-event:hover .timeline-content {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  .timeline-content h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #0070f3;
    font-size: 1.2rem;
  }
  
  .timeline-content p {
    color: #444;
    line-height: 1.6;
  }
  
  .timeline-image {
    margin: 1.5rem 0;
    text-align: center;
  }
  
  .timeline-image img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .timeline-image img:hover {
    transform: scale(1.02);
  }
  
  .engineering-changes {
    margin-top: 1.5rem;
    background-color: #f0f7ff;
    padding: 1.25rem;
    border-radius: 8px;
    border-left: 4px solid #0070f3;
  }
  
  .engineering-changes h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #0070f3;
    font-size: 1.1rem;
  }
  
  .engineering-changes ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #444;
  }
`}</style>  </Layout>)};