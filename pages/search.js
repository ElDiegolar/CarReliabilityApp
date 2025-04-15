// pages/search.js - Car search page with translations and reset functionality
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Search() {
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setError('');

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
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Added reset functionality to allow users to search again without refreshing
  const handleReset = () => {
    setResults(null);
    setSubmitted(false);
    setFormData({
      year: '',
      make: '',
      model: '',
      mileage: ''
    });
  };

  return (
    <Layout title={t('search.title')}>
      <h1>{t('search.title')}</h1>

      {isPremium && (
        <div className="premium-badge">
          <span>{t('search.premiumUser')}</span>
        </div>
      )}

      {!submitted && (
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
      )}

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <div className="results-header">
            <h2>{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>
            <button onClick={handleReset} className="reset-button">
              {t('search.newSearch', 'New Search')}
            </button>
          </div>

          <div className="score-card">
            <h3>{t('search.overallScore')}</h3>
            <div className="score">
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
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
            {results.isPremium ? (
              <p>{results.aiAnalysis}</p>
            ) : (
              <div className="upgrade-prompt">
                <p>{t('search.upgradePrompt')}</p>
                <Link href="/pricing" className="upgrade-button">
                  {t('search.goPremium')}
                </Link>
              </div>
            )}
          </div>
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
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-weight: bold;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover {
          background-color: #0060df;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .reset-button {
          background-color: #f3f4f6;
          color: #374151;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
        }
        
        .reset-button:hover {
          background-color: #e5e7eb;
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
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
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
          border-radius: 4px;
          text-align: center;
        }

        .category h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .category-score {
          font-size: 1.25rem;
          font-weight: bold;
          color: #0070f3;
        }

        .premium-prompt, .upgrade-prompt {
          background-color: #fffbea;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          grid-column: 1 / -1;
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
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .analysis {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .upgrade-prompt {
          margin-top: 1rem;
        }

        .upgrade-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          font-weight: 500;
          margin-top: 0.5rem;
          text-decoration: none;
        }

        .upgrade-button:hover {
          background-color: #0060df;
        }
        
        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .category-grid {
            grid-template-columns: 1fr;
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