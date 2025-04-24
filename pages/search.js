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
    setFormData({ ...formData, [name]: value });
  };

  const resetSearch = () => {
    setResults(null);
    setTimelineData([]);
    setSavedTimelineData(null);
    setShowSearchForm(true);
    router.replace({ pathname: router.pathname }, undefined, { shallow: true });

    setFormData({
      year: '',
      make: '',
      model: '',
      mileage: ''
    });
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setError('');

    if (!isAutoSubmit) {
      setResults(null);
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

      {/* Search Form Section */}
      <div className={`search-form-wrapper ${showSearchForm ? 'expanded' : 'collapsed'}`}>
        <div className="search-toggle-header" onClick={() => setShowSearchForm(!showSearchForm)}>
          <h2>{results ? 'Modify Search' : 'Vehicle Details'}</h2>
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

            <div className="form-actions">
              {results && (
                <button type="button" className="reset-button" onClick={resetSearch}>
                  Reset
                </button>
              )}
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? <span className="spinner" /> : t('search.searchButton')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Image preview */}
      {results?.imageUrl && (
        <div className="car-image">
          <img
            src={results.imageUrl}
            alt={`${formData.make} ${formData.model}`}
            style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }}
          />
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="results">
          <div className="score-card">
            <h3>{t('search.overallScore')}</h3>
            <div className="score">
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>

          <div className="action-buttons">
            <SaveSearchButton vehicleData={results} searchParams={formData} />
            <DownloadPdfButton 
              vehicleData={results}
              searchParams={formData}
              timelineData={savedTimelineData || timelineData}
              imageUrl={results.imageUrl}
            />
          </div>

          {results.categories && (
            <div className="categories">
              <h2>{t('search.categoryScores')}</h2>
              <div className="category-grid">
                {Object.entries(results.categories).map(([key, value]) => (
                  value !== null && (
                    <div className="category" key={key}>
                      <h4>{key}</h4>
                      <div className="category-score">{`${value}/100`}</div>
                    </div>
                  )
                ))}
                
                {!results.isPremium && (
                  <div className="premium-prompt">
                    <p>{t('search.upgradeFull')}</p>
                    <Link href="/pricing" className="upgrade-button">
                      {t('search.goPremium')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
            <div className="common-issues">
              <h2>{t('search.commonIssues')}</h2>
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
            <h2>{t('search.analysis')}</h2>
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

          <CarTimeline
            timelineData={savedTimelineData || timelineData}
            onLoad={handleTimelineLoaded}
          />

          {user && (
            <div className="search-actions">
              <Link href="/search-history" className="view-history-button">
                {t('search.viewSearchHistory')}
              </Link>
              <Link href="/saved-vehicles" className="view-saved-button">
                View Saved Vehicles
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
      
        .search-form-wrapper {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .search-toggle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          cursor: pointer;
          background-color: #f9f9f9;
          border-bottom: 1px solid #eee;
        }
        
        .search-toggle-header h2 {
          margin: 0;
          font-size: 1.3rem;
          color: #333;
        }
        
        .toggle-icon {
          font-size: 1.5rem;
          color: #0070f3;
          font-weight: bold;
        }
        
        .search-form-wrapper.collapsed {
          border-bottom: none;
        }
        
        .search-form-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .search-form-body.show {
          max-height: 1000px; /* Large enough to contain the form */
        }
        
        .search-form-wrapper.expanded .search-form-body {
          border-top: 1px solid #eee;
        }
      
        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
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
        
        .reset-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: 8px;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background-color: #e5e5e5;
        }
        
        .search-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
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
      
        .results {
          margin-top: 2rem;
        }
      
        .score-card {
          background-color: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
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
      
        .categories, .common-issues, .analysis {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .categories h2, .common-issues h2, .analysis h2 {
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
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      
        .category h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #444;
          text-transform: capitalize;
        }
      
        .category-score {
          font-size: 1.25rem;
          font-weight: bold;
          color: #0070f3;
        }
      
        .premium-prompt, .upgrade-prompt {
          background-color: #fffbea;
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
          font-size: 1.1rem;
        }
      
        .analysis p {
          line-height: 1.6;
          color: #444;
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
      
        .search-actions {
          margin-top: 2rem;
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