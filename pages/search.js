// pages/search.js - Car search page with translations
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
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

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
    setError('');
    setIsFormCollapsed(true);

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

  const toggleSearchForm = () => {
    setIsFormCollapsed(!isFormCollapsed);
  };

  return (
    <Layout title={t('search.title')}>
      <div className="search-container">
        <h1>{t('search.title')}</h1>

        {isPremium && (
          <div className="premium-badge">
            <span>{t('search.premiumUser')}</span>
          </div>
        )}

        {isFormCollapsed ? (
          <div className="search-summary">
            <div className="search-info">
              <span className="search-label">{t('search.searchedFor')}:</span>
              <span className="vehicle-info">
                {formData.year} {formData.make} {formData.model} - {formData.mileage} {t('search.miles')}
              </span>
            </div>
            <button 
              onClick={toggleSearchForm} 
              className="modify-search-button"
            >
              {t('search.modifySearch')}
            </button>
          </div>
        ) : (
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

            <button type="submit" disabled={loading} className="search-button">
              {loading ? <span className="spinner" /> : t('search.searchButton')}
            </button>
          </form>
        )}

        {error && <p className="error">{error}</p>}

        {results && (
          <div className="results">
            <div className="report-box">
              <h2 className="report-title">{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>

              <div className="report-section">
                <h3>{t('search.overallScore')}</h3>
                <div className="score-highlight">
                  <span className="score-value">{results.overallScore}</span><span>/100</span>
                </div>
              </div>

              <div className="report-section">
                <h3>{t('search.categoryScores')}</h3>
                <div className="category-grid">
                  <div className="category"><strong>{t('search.engine')}:</strong> {results.categories.engine}/100</div>
                  <div className="category"><strong>{t('search.transmission')}:</strong> {results.categories.transmission}/100</div>

                  {results.isPremium ? (
                    <>
                      <div className="category"><strong>{t('search.electrical')}:</strong> {results.categories.electricalSystem}/100</div>
                      <div className="category"><strong>{t('search.brakes')}:</strong> {results.categories.brakes}/100</div>
                      <div className="category"><strong>{t('search.suspension')}:</strong> {results.categories.suspension}/100</div>
                      <div className="category"><strong>{t('search.fuelSystem')}:</strong> {results.categories.fuelSystem}/100</div>
                    </>
                  ) : (
                    <div className="premium-prompt">
                      <p>{t('search.upgradeFull')}</p>
                    </div>
                  )}
                </div>
              </div>

              {results.isPremium && results.commonIssues?.length > 0 && (
                <div className="report-section">
                  <h3>{t('search.commonIssues')}</h3>
                  <ul className="issues-list">
                    {results.commonIssues.map((issue, index) => (
                      <li key={index} className="issue-item">
                        <strong>{issue.description}</strong>
                        {issue.costToFix && <div>{t('search.costToFix')}: {issue.costToFix}</div>}
                        {issue.occurrence && <div>{t('search.occurrence')}: {issue.occurrence}</div>}
                        {issue.mileage && <div>{t('search.typicalMileage')}: {issue.mileage}</div>}
                        {issue.engineCodes && (
                          <div className="engine-codes">
                            <h4>{t('search.engineCodes')}</h4>
                            <pre className="code-box">{issue.engineCodes}</pre>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="report-section">
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
          .report-box {
            background: #fff;
            border: 2px solid #e2e8f0;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            margin: 2rem 0;
          }

          .report-title {
            font-size: 1.75rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #cbd5e0;
            padding-bottom: 0.5rem;
          }

          .report-section {
            margin-bottom: 2rem;
          }

          .score-highlight {
            font-size: 2.5rem;
            font-weight: bold;
            color: #3182ce;
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
          }

          .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          }

          .category {
            background-color: #f7fafc;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
          }

          .issues-list {
            list-style-type: none;
            padding-left: 0;
          }

          .issue-item {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border-left: 4px solid #e53e3e;
            background-color: #fff5f5;
            border-radius: 0.5rem;
          }

          .engine-codes h4 {
            margin-top: 0.5rem;
            font-weight: 600;
          }

          .code-box {
            background-color: #edf2f7;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-top: 0.25rem;
            font-family: monospace;
          }
        `}</style>
      </div>
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
