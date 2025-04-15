// pages/search.js - Revised search page with consistent styling
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

  // Helper function to calculate color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Green for high scores
    if (score >= 60) return '#f59e0b'; // Amber for medium scores
    return '#ef4444'; // Red for low scores
  };

  return (
    <Layout title={t('search.title')}>
      <h1>{t('search.title')}</h1>

      {isPremium && (
        <div className="premium-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          <span>{t('search.premiumUser')}</span>
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-grid">
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

          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : t('search.searchButton')}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <div className="results-header">
            <h2>{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>
            <button onClick={handleReset} className="reset-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2v6h6M21.5 22v-6h-6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>{t('search.newSearch', 'New Search')}</span>
            </button>
          </div>
          
          <div className="score-card">
            <h3>{t('search.overallScore')}</h3>
            <div className="score" style={{ color: getScoreColor(results.overallScore) }}>
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
            <p className="score-label">
              {results.overallScore >= 80 ? t('search.scoreExcellent', 'Excellent') : 
               results.overallScore >= 60 ? t('search.scoreGood', 'Good') : 
               t('search.scorePoor', 'Poor')}
            </p>
          </div>

          <div className="categories">
            <h3>{t('search.categoryScores')}</h3>
            <div className="category-grid">
              <div className="category">
                <h4>{t('search.engine')}</h4>
                <div className="category-score" style={{ color: getScoreColor(results.categories.engine) }}>{results.categories.engine}/100</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ 
                    width: `${results.categories.engine}%`,
                    backgroundColor: getScoreColor(results.categories.engine)
                  }}></div>
                </div>
              </div>
              <div className="category">
                <h4>{t('search.transmission')}</h4>
                <div className="category-score" style={{ color: getScoreColor(results.categories.transmission) }}>{results.categories.transmission}/100</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ 
                    width: `${results.categories.transmission}%`,
                    backgroundColor: getScoreColor(results.categories.transmission)
                  }}></div>
                </div>
              </div>

              {results.isPremium ? (
                <>
                  <div className="category">
                    <h4>{t('search.electrical')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.electricalSystem) }}>{results.categories.electricalSystem}/100</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ 
                        width: `${results.categories.electricalSystem}%`,
                        backgroundColor: getScoreColor(results.categories.electricalSystem)
                      }}></div>
                    </div>
                  </div>
                  <div className="category">
                    <h4>{t('search.brakes')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.brakes) }}>{results.categories.brakes}/100</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ 
                        width: `${results.categories.brakes}%`,
                        backgroundColor: getScoreColor(results.categories.brakes)
                      }}></div>
                    </div>
                  </div>
                  <div className="category">
                    <h4>{t('search.suspension')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.suspension) }}>{results.categories.suspension}/100</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ 
                        width: `${results.categories.suspension}%`,
                        backgroundColor: getScoreColor(results.categories.suspension)
                      }}></div>
                    </div>
                  </div>
                  <div className="category">
                    <h4>{t('search.fuelSystem')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.fuelSystem) }}>{results.categories.fuelSystem}/100</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ 
                        width: `${results.categories.fuelSystem}%`,
                        backgroundColor: getScoreColor(results.categories.fuelSystem)
                      }}></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="premium-prompt">
                  <p>{t('search.upgradeFull')}</p>
                  <Link href="/pricing" className="upgrade-button">
                    {t('search.viewPricingPlans', 'View Pricing Plans')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
            <div className="common-issues">
              <h3>{t('search.commonIssues')}</h3>
              <ul>
                {results.commonIssues.map((issue, index) => (
                  <li key={index} className="issue-item">
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
                <ul className="upgrade-benefits">
                  <li>{t('search.benefit1', 'Comprehensive reliability scores')}</li>
                  <li>{t('search.benefit2', 'Detailed issue analysis')}</li>
                  <li>{t('search.benefit3', 'Expert insights')}</li>
                  <li>{t('search.benefit4', 'Historical data')}</li>
                </ul>
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
          display: inline-flex;
          align-items: center;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-weight: bold;
          gap: 0.5rem;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin-bottom: 2rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
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
        
        input:focus {
          border-color: #0070f3;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.15);
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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
        }

        .score-max {
          font-size: 1.5rem;
          color: #666;
        }
        
        .score-label {
          font-weight: 600;
          margin-top: 0.5rem;
          font-size: 1.2rem;
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
        }

        .category h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .category-score {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .score-bar {
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }
        
        .score-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 1s ease-out;
        }

        .premium-prompt, .upgrade-prompt {
          background-color: #f0f7ff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          grid-column: 1 / -1;
        }
        
        .upgrade-benefits {
          list-style-type: none;
          padding: 0;
          margin: 1rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.5rem;
          text-align: left;
        }
        
        .upgrade-benefits li {
          position: relative;
          padding-left: 1.5rem;
        }
        
        .upgrade-benefits li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #0070f3;
          font-weight: bold;
        }

        .common-issues {
          margin-bottom: 2rem;
        }

        .common-issues ul {
          list-style-type: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .issue-item {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
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
          
          .form-grid, .category-grid, .common-issues ul {
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