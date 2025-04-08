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
          <h2>{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>

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
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    color: #222;
  }

  .premium-badge {
    display: inline-block;
    background: linear-gradient(90deg, #0070f3, #00c6ff);
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    margin: 1rem auto;
    font-weight: 600;
    text-align: center;
    font-size: 0.9rem;
    box-shadow: 0 4px 14px rgba(0, 112, 243, 0.3);
  }

  .search-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: #fff;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
    max-width: 600px;
    margin: 0 auto 3rem auto;
    border: 1px solid #eee;
  }

  .form-group {
    position: relative;
  }

  label {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 0.875rem;
    color: #666;
    pointer-events: none;
    transition: all 0.2s ease;
    background-color: white;
    padding: 0 4px;
    z-index: 1;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label {
    top: -8px;
    left: 10px;
    font-size: 0.75rem;
    color: #0070f3;
  }

  input {
    width: 100%;
    padding: 1.25rem 1rem 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 0.75rem;
    font-size: 1rem;
    background-color: #fdfdfd;
    transition: border-color 0.2s;
    box-shadow: inset 0 0 0 1px transparent;
  }

  input:focus {
    outline: none;
    border-color: #0070f3;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.15);
  }

  button {
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #0070f3, #00c6ff);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s, box-shadow 0.3s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  button:hover {
    box-shadow: 0 8px 24px rgba(0, 112, 243, 0.3);
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
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
    text-align: center;
    font-weight: 500;
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
