// pages/search.js - Redesigned car search page with translations
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
      <div className="search-container">
        <div className="search-header">
          <h1>{t('search.title')}</h1>
          <p className="search-description">
            {t('search.description', 'Get detailed reliability information about any vehicle. Enter your car details below to start.')}
          </p>

          {isPremium && (
            <div className="premium-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>{t('search.premiumUser')}</span>
            </div>
          )}
        </div>

        {!submitted && (
          <div className="form-container">
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

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>{t('search.searching', 'Searching...')}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>{t('search.searchButton')}</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="error-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="error">{error}</p>
              </div>
            )}
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2>{t('search.resultsFor')} {formData.year} {formData.make} {formData.model}</h2>
              <button onClick={handleReset} className="reset-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 2v6h6M21.5 22v-6h-6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                <span>{t('search.newSearch', 'New Search')}</span>
              </button>
            </div>
            
            <div className="score-section">
              <div className="score-card" style={{ 
                borderColor: getScoreColor(results.overallScore),
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 3px ${getScoreColor(results.overallScore)}25`
              }}>
                <h3>{t('search.overallScore')}</h3>
                <div className="score-circle" style={{ backgroundColor: `${getScoreColor(results.overallScore)}15`, borderColor: getScoreColor(results.overallScore) }}>
                  <span className="score-value" style={{ color: getScoreColor(results.overallScore) }}>{results.overallScore}</span>
                  <span className="score-max">/100</span>
                </div>
                <p className="score-label">
                  {results.overallScore >= 80 ? t('search.scoreExcellent', 'Excellent') : 
                   results.overallScore >= 60 ? t('search.scoreGood', 'Good') : 
                   t('search.scorePoor', 'Poor')}
                </p>
              </div>
            </div>

            <div className="categories-section">
              <h3 className="section-title">{t('search.categoryScores')}</h3>
              <div className="category-grid">
                <div className="category" style={{ borderColor: getScoreColor(results.categories.engine) }}>
                  <div className="category-content">
                    <h4>{t('search.engine')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.engine) }}>
                      {results.categories.engine}/100
                    </div>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ 
                      width: `${results.categories.engine}%`,
                      backgroundColor: getScoreColor(results.categories.engine)
                    }}></div>
                  </div>
                </div>
                
                <div className="category" style={{ borderColor: getScoreColor(results.categories.transmission) }}>
                  <div className="category-content">
                    <h4>{t('search.transmission')}</h4>
                    <div className="category-score" style={{ color: getScoreColor(results.categories.transmission) }}>
                      {results.categories.transmission}/100
                    </div>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ 
                      width: `${results.categories.transmission}%`,
                      backgroundColor: getScoreColor(results.categories.transmission)
                    }}></div>
                  </div>
                </div>







                {results.isPremium ? (
                  <>
                    <div className="category" style={{ borderColor: getScoreColor(results.categories.electricalSystem) }}>
                      <div className="category-content">
                        <h4>{t('search.electrical')}</h4>
                        <div className="category-score" style={{ color: getScoreColor(results.categories.electricalSystem) }}>
                          {results.categories.electricalSystem}/100
                        </div>
                      </div>
                      <div className="score-bar">
                        <div className="score-fill" style={{ 
                          width: `${results.categories.electricalSystem}%`,
                          backgroundColor: getScoreColor(results.categories.electricalSystem)
                        }}></div>
                      </div>
                    </div>
                    
                    <div className="category" style={{ borderColor: getScoreColor(results.categories.brakes) }}>
                      <div className="category-content">
                        <h4>{t('search.brakes')}</h4>
                        <div className="category-score" style={{ color: getScoreColor(results.categories.brakes) }}>
                          {results.categories.brakes}/100
                        </div>
                      </div>
                      <div className="score-bar">
                        <div className="score-fill" style={{ 
                          width: `${results.categories.brakes}%`,
                          backgroundColor: getScoreColor(results.categories.brakes)
                        }}></div>
                      </div>
                    </div>
                    
                    <div className="category" style={{ borderColor: getScoreColor(results.categories.suspension) }}>
                      <div className="category-content">
                        <h4>{t('search.suspension')}</h4>
                        <div className="category-score" style={{ color: getScoreColor(results.categories.suspension) }}>
                          {results.categories.suspension}/100
                        </div>
                      </div>
                      <div className="score-bar">
                        <div className="score-fill" style={{ 
                          width: `${results.categories.suspension}%`,
                          backgroundColor: getScoreColor(results.categories.suspension)
                        }}></div>
                      </div>
                    </div>
                    
                    <div className="category" style={{ borderColor: getScoreColor(results.categories.fuelSystem) }}>
                      <div className="category-content">
                        <h4>{t('search.fuelSystem')}</h4>
                        <div className="category-score" style={{ color: getScoreColor(results.categories.fuelSystem) }}>
                          {results.categories.fuelSystem}/100
                        </div>
                      </div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <p>{t('search.upgradeFull')}</p>
                    <Link href="/pricing" className="upgrade-button">
                      {t('search.viewPricingPlans', 'View Pricing Plans')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
              <div className="issues-section">
                <h3 className="section-title">{t('search.commonIssues')}</h3>
                <div className="issues-grid">
                  {results.commonIssues.map((issue, index) => (
                    <div key={index} className="issue-card">
                      <div className="issue-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h4>{issue.description}</h4>
                      </div>
                      <div className="issue-details">
                        <div className="issue-detail">
                          <span className="detail-label">{t('search.costToFix')}:</span>
                          <span className="detail-value">{issue.costToFix}</span>
                        </div>
                        <div className="issue-detail">
                          <span className="detail-label">{t('search.occurrence')}:</span>
                          <span className="detail-value">{issue.occurrence}</span>
                        </div>
                        <div className="issue-detail">
                          <span className="detail-label">{t('search.typicalMileage')}:</span>
                          <span className="detail-value">{issue.mileage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="analysis-section">
              <h3 className="section-title">{t('search.analysis')}</h3>
              <div className="analysis-content">
                {results.isPremium ? (
                  <p>{results.aiAnalysis}</p>
                ) : (
                  <div className="premium-prompt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <div>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>{t('search.loadingMessage') || 'Loading...'}</span>
        </div>
      )}

      <style jsx>{`
        .search-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .search-header {
          margin-bottom: 2.5rem;
          text-align: center;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .search-description {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .premium-badge {
          display: inline-flex;
          align-items: center;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          font-weight: 600;
          box-shadow: 0 2px 5px rgba(0, 112, 243, 0.3);
        }
        
        .premium-badge svg {
          margin-right: 0.4rem;
        }
        
        .form-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 0.5rem;
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
          padding: 0.85rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        input:focus {
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.15);
          outline: none;
        }
        
        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0, 112, 243, 0.3);
        }
        
        .submit-button:hover {
          background-color: #005bdb;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0, 112, 243, 0.4);
        }
        
        .submit-button:active {
          transform: translateY(0);
        }
        
        .submit-button:disabled {
          background-color: #99c1f5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 0.25rem;
        }
        
        .error-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1rem;
          margin-top: 1rem;
          border-radius: 6px;
          color: #ef4444;
        }
        
        .error {
          margin: 0;
        }
        
        .results-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .results-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
        
        .reset-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #f3f4f6;
          color: #374151;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .reset-button:hover {
          background-color: #e5e7eb;
        }
        
        .score-section {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }
        
        .score-card {
          text-align: center;
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 2rem;
          width: 100%;
          max-width: 300px;
        }
        
        .score-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.25rem;
        }
        
        .score-circle {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          background-color: rgba(34, 197, 94, 0.1);
          border: 3px solid #22c55e;
        }
        
        .score-value {
          font-size: 3.5rem;
          font-weight: bold;
          line-height: 1;
          color: #22c55e;
        }
        
        .score-max {
          font-size: 1.5rem;
          color: #666;
        }
        
        .score-label {
          font-weight: 600;
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }
        
        .section-title {
          font-size: 1.5rem;
          color: #333;
          margin-top: 0;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .categories-section {
          margin-bottom: 3rem;
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        .category {
          background-color: #fafafa;
          border-radius: 8px;
          border-left: 4px solid;
          padding: 1.25rem;
        }
        
        .category-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .category h4 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 600;
        }
        
        .category-score {
          font-weight: 600;
          font-size: 1.1rem;
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
        
        .premium-prompt {
          grid-column: 1 / -1;
          background-color: #f0f7ff;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }
        
        .premium-prompt p {
          margin: 0;
          color: #0070f3;
          font-weight: 500;
        }
        
        .upgrade-benefits {
          list-style-type: none;
          padding: 0;
          margin: 0.5rem 0 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.5rem 1.5rem;
          text-align: left;
        }
        
        .upgrade-benefits li {
          position: relative;
          padding-left: 1.5rem;
          color: #4b5563;
        }
        
        .upgrade-benefits li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #0070f3;
          font-weight: bold;
        }
        
        .upgrade-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 9999px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0, 112, 243, 0.3);
        }
        
        .upgrade-button:hover {
          background-color: #005bdb;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0, 112, 243, 0.4);
        }
        
        .issues-section {
          margin-bottom: 3rem;
        }
        
        .issues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .issue-card {
          background-color: #fafafa;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .issue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .issue-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .issue-header svg {
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        
        .issue-header h4 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
          line-height: 1.4;
        }
        
        .issue-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .issue-detail {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }
        
        .detail-label {
          color: #666;
        }
        
        .detail-value {
          font-weight: 600;
          color: #333;
        }
        
        .analysis-section {
          margin-bottom: 1rem;
        }
        
        .analysis-content {
          background-color: #fafafa;
          border-radius: 8px;
          padding: 1.5rem;
          line-height: 1.6;
        }
        
        .analysis-content p {
          margin: 0;
          color: #444;
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
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 6px solid #e5e7eb;
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
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .category-grid {
            grid-template-columns: 1fr;
          }
          
          .issues-grid {
            grid-template-columns: 1fr;
          }
          
          .score-card {
            padding: 1.5rem;
          }
          
          .score-circle {
            width: 120px;
            height: 120px;
          }
          
          .score-value {
            font-size: 3rem;
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