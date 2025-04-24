// pages/search.js - Car search page with collapsible modern search area
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
  const [showSearchForm, setShowSearchForm] = useState(true);

  const { fromSaved, savedId } = router.query;

  useEffect(() => {
    if (queryYear || queryMake || queryModel || queryMileage) {
      setFormData({
        year: queryYear || '',
        make: queryMake || '',
        model: queryModel || '',
        mileage: queryMileage || ''
      });

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
                setResults(data.savedVehicle.reliability_data);

                if (data.savedVehicle.timeline_data) {
                  setSavedTimelineData(data.savedVehicle.timeline_data);
                  setTimelineData(data.savedVehicle.timeline_data);
                }

                setLoading(false);
                setShowSearchForm(false);
                return;
              }
            }
          } catch (err) {
            console.error('Error loading saved vehicle data:', err);
          }

          if (queryYear && queryMake && queryModel && queryMileage) {
            await handleSubmit(null, true);
          }
        };

        loadSavedVehicle();
      } else if (queryYear && queryMake && queryModel && queryMileage) {
        const autoSubmitForm = async () => {
          await handleSubmit(null, true);
        };
        autoSubmitForm();
      }
    }
  }, [queryYear, queryMake, queryModel, queryMileage, fromSaved, savedId, user, getToken]);

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

  useEffect(() => {
    if (
      !results &&
      queryYear && queryMake && queryModel && queryMileage &&
      !loading && !fromSaved
    ) {
      handleSubmit(null, true);
    }
  }, [results, queryYear, queryMake, queryModel, queryMileage, loading, fromSaved]);

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

    if (!isAutoSubmit) {
      setResults(null); // ✅ Clear previous results when new manual search is submitted
      setTimelineData([]);
      setSavedTimelineData(null);
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

    try {
      const requestBody = {
        ...formData,
        locale: router.locale
      };

      if (user) requestBody.userId = user.id;
      if (subscription?.access_token) requestBody.premiumToken = subscription.access_token;

      const response = await fetch('/api/car-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to fetch reliability data');

      const data = await response.json();
      setResults(data);
      setShowSearchForm(false);

      if (!isAutoSubmit) {
        router.push({
          pathname: router.pathname,
          query: {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            mileage: formData.mileage,
            ...(savedId ? { savedId, fromSaved: 'true' } : {})
          }
        }, undefined, { shallow: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineLoaded = (data) => {
    setTimelineData(data);
  };

  return (
    <Layout title={t('search.title')}>
      <h1>{t('search.title')}</h1>

      {isPremium && (
        <div className="premium-badge">
          <span>{t('search.premiumUser')}</span>
        </div>
      )}

      <div className={`search-form-wrapper ${showSearchForm ? 'expanded' : 'collapsed'}`}>
        <div className="search-toggle-header" onClick={() => setShowSearchForm(!showSearchForm)}>
          <h2>{t('search.searchSection')}</h2>
          <span className="toggle-icon">{showSearchForm ? '−' : '+'}</span>
        </div>

        <div className={`search-form-body ${showSearchForm ? 'show' : ''}`}>
          <form onSubmit={handleSubmit} className="search-form">
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

            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : t('search.searchButton')}
            </button>
          </form>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <h2>{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>

          <div className="score-card">
            <h3>{t('search.overallScore')}</h3>
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
                savedId={router.query.savedId}
              />
            )}
            
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

          {results.isPremium && results.commonIssues?.length > 0 && (
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

          {results.isPremium && (
            <div className="timeline-section">
              <h2>{t('timeline.sectionTitle')}</h2>

              {savedTimelineData ? (
                <div className="car-timeline">
                  <h3>{t('timeline.title')}</h3>
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
                          {event.engineeringChanges?.length > 0 && (
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
                </div>
              ) : (
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
              <Link href="/search-history" className="view-history-button">
                {t('search.viewSearchHistory')}
              </Link>
              <Link href="/saved-vehicles" className="view-saved-button">
                {t('search.viewSavedVehicles')}
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
