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

{results && (
  <div className="results">
    <div className="score-card">
      <div className="score">{results.overallScore}</div>
      <div className="score-max">/100</div>
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
        <h2>Category Scores</h2>
        <div className="category-grid">
          {Object.entries(results.categories).map(([key, value]) => (
            <div className="category" key={key}>
              <h4>{key}</h4>
              <div className="category-score">{value !== null ? `${value}/100` : 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {results.commonIssues && results.commonIssues.length > 0 && (
      <div className="common-issues">
        <h2>Common Issues</h2>
        <ul>
          {results.commonIssues.map((issue, i) => (
            <li key={i}>
              <strong>{issue.description}</strong><br />
              Cost to Fix: {issue.costToFix}<br />
              Occurrence: {issue.occurrence}<br />
              Typical Mileage: {issue.mileage}
            </li>
          ))}
        </ul>
      </div>
    )}

    {results.aiAnalysis && (
      <div className="analysis">
        <h2>AI Analysis</h2>
        <p>{results.aiAnalysis}</p>
      </div>
    )}

    <CarTimeline
      timelineData={savedTimelineData || timelineData}
      onLoad={handleTimelineLoaded}
    />
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
          margin-bottom: 1.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #f0f0f0;
          color: #0070f3;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
      
        .reopen-button:hover {
          background-color: #e5e5e5;
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
      
        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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
      
        button[type="submit"] {
          grid-column: 1 / -1;
          justify-self: center;
          width: fit-content;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: 8px;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
      
        button[type="submit"]:hover {
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
          margin-bottom: 1rem;
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
      
        /* Car Specifications Styles */
        .car-specs {
          background-color: #f9f9f9;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .car-specs h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          text-align: center;
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .spec-item {
          background-color: white;
          padding: 1rem;
          border-radius: 6px;
          border-left: 3px solid #0070f3;
        }
        
        .spec-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .spec-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }
      
        .categories {
          margin-bottom: 2rem;
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
        }
      
        .category-score {
          font-size: 1.25rem;
          font-weight: bold;
          color: #0070f3;
        }
      
        .premium-prompt,
        .upgrade-prompt {
          background-color: #fffbea;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          grid-column: 1 / -1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      
        .common-issues {
          margin-bottom: 2rem;
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
      
        .analysis {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
        }
      
        .view-history-button,
        .view-saved-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #0070f3;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }
      
        .view-history-button:hover,
        .view-saved-button:hover {
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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