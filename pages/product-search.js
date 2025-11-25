// pages/product-search.js - Generic product reliability search page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import RevCounterGauge from '../components/RevCounterGauge';
import { 
  getAllCategories, 
  getCategoryConfig, 
  PRODUCT_CATEGORIES,
  formatProductName 
} from '../lib/product-categories';

export default function ProductSearch() {
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(PRODUCT_CATEGORIES.AUTOMOTIVE);
  const [productData, setProductData] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [specifications, setSpecifications] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  const categories = getAllCategories();
  const currentConfig = getCategoryConfig(selectedCategory);

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    setProductData({});
    setResults(null);
    setSpecifications(null);
    setTimelineData([]);
  };

  // Handle form field changes
  const handleChange = (e) => {
    setProductData({ 
      ...productData, 
      [e.target.name]: e.target.value 
    });
  };

  // Reset search
  const resetSearch = () => {
    setResults(null);
    setTimelineData([]);
    setSpecifications(null);
    setShowSearchForm(true);
    setProductData({});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    setSpecifications(null);
    setTimelineData([]);

    try {
      const requestBody = {
        productData: {
          ...productData,
          category: selectedCategory
        },
        category: selectedCategory,
        locale: router.locale,
        ...(user && { userId: user.id })
      };

      console.log('Sending product reliability request:', requestBody);
      
      const res = await fetch('/api/product-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API error response:', errorData);
        throw new Error('Failed to fetch reliability data');
      }

      const data = await res.json();
      console.log('Received reliability data:', data);
      
      if (data.specifications) {
        setSpecifications(data.specifications);
      }
      
      if (data.timeline && Array.isArray(data.timeline)) {
        setTimelineData(data.timeline);
      }
      
      setResults(data);
      setShowSearchForm(false);

    } catch (err) {
      console.error('Error fetching reliability data:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const productName = results ? formatProductName(productData, selectedCategory) : '';

  return (
    <Layout>
      <SEO
        title="Product Reliability Checker | Check Any Product's Reliability Score"
        description="Check reliability scores for any product - cars, electronics, appliances, tools, and more. Get instant reliability reports based on real user reviews and expert testing."
        keywords="product reliability, reliability checker, product reviews, consumer reports, reliability score"
      />
      
      <div className="product-search-container">
        <h1>{t('productSearch.title') || 'Product Reliability Checker'}</h1>
        <p className="subtitle">
          {t('productSearch.subtitle') || 'Check the reliability of any product based on real user reviews and expert testing'}
        </p>

        {!showSearchForm && (
          <button onClick={() => setShowSearchForm(true)} className="reopen-button">
            {t('productSearch.modifySearch') || 'Modify Search'}
          </button>
        )}

        {showSearchForm && (
          <div className="search-section">
            {/* Category Selection */}
            <div className="category-selection">
              <h3>{t('productSearch.selectCategory') || 'Select Product Category'}</h3>
              <div className="category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form */}
            <form onSubmit={handleSubmit} className="product-form">
              <h3>{t('productSearch.enterDetails') || `Enter ${currentConfig.name} Details`}</h3>
              <div className="form-grid">
                {currentConfig.fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={productData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="form-actions">
                {results && (
                  <button type="button" onClick={resetSearch} className="reset-button">
                    {t('productSearch.reset') || 'Reset'}
                  </button>
                )}
                <button type="submit" className="search-button" disabled={loading}>
                  {loading ? (
                    <><span className="spinner" /> {t('productSearch.analyzing') || 'Analyzing...'}</>
                  ) : (
                    t('productSearch.checkReliability') || 'Check Reliability'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {/* Results Section */}
        {results && (
          <div className="results">
            <h2>{productName} {t('productSearch.reliabilityAnalysis') || 'Reliability Analysis'}</h2>
            
            {/* Overall Score */}
            <div className="score-card">
              <h3>{t('productSearch.overallScore') || 'Overall Reliability Score'}</h3>
              <div className="score">
                <span className="score-value">{results.overallScore}</span>
                <span className="score-max">/100</span>
              </div>
              <p className="score-description">
                {results.overallScore >= 80 && (t('productSearch.excellentRating') || 'Excellent reliability rating')}
                {results.overallScore >= 60 && results.overallScore < 80 && (t('productSearch.goodRating') || 'Good reliability rating')}
                {results.overallScore >= 40 && results.overallScore < 60 && (t('productSearch.averageRating') || 'Average reliability rating')}
                {results.overallScore < 40 && (t('productSearch.poorRating') || 'Below average reliability rating')}
              </p>
            </div>

            {/* Category Scores */}
            {results.categories && (
              <div className="categories">
                <h3>{t('productSearch.categoryScores') || 'Category Breakdown'}</h3>
                <div className="category-grid-results">
                  {currentConfig.reliabilityCategories.map((cat) => (
                    <RevCounterGauge 
                      key={cat.key}
                      value={results.categories[cat.key]} 
                      label={cat.label} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Common Issues */}
            {results.commonIssues && results.commonIssues.length > 0 && (
              <div className="common-issues">
                <h3>{t('productSearch.commonIssues') || 'Common Issues Reported'}</h3>
                <ul>
                  {results.commonIssues.map((issue, index) => (
                    <li key={index}>
                      <strong>{issue.description}</strong>
                      {issue.costToFix && <div><strong>Cost to Fix:</strong> {issue.costToFix}</div>}
                      {issue.occurrence && <div><strong>Occurrence:</strong> {issue.occurrence}</div>}
                      {issue.timeframe && <div><strong>Timeframe:</strong> {issue.timeframe}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis */}
            {results.analysis && (
              <div className="analysis">
                <h3>{t('productSearch.expertAnalysis') || 'Expert Analysis'}</h3>
                <p>{results.analysis}</p>
                {results.sources && results.sources.length > 0 && (
                  <div className="sources">
                    <strong>{t('productSearch.sources') || 'Sources:'}</strong> {results.sources.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {specifications && (
              <div className="specifications">
                <h3>{t('productSearch.specifications') || 'Technical Specifications'}</h3>
                <div className="specs-content">
                  <pre>{JSON.stringify(specifications, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Timeline */}
            {timelineData && timelineData.length > 0 && (
              <div className="timeline-section">
                <h3>{t('productSearch.productHistory') || 'Product History'}</h3>
                <div className="timeline">
                  {timelineData.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker">{item.year}</div>
                      <div className="timeline-content">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        {item.changes && item.changes.length > 0 && (
                          <ul>
                            {item.changes.map((change, i) => (
                              <li key={i}>{change}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .product-search-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 3rem;
        }

        .reopen-button {
          display: block;
          margin: 0 auto 2rem;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reopen-button:hover {
          background-color: #e5e5e5;
        }

        .search-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .category-selection h3 {
          margin-bottom: 1.5rem;
          color: #2d3748;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-card:hover {
          background: #edf2f7;
          transform: translateY(-2px);
        }

        .category-card.active {
          background: #ebf8ff;
          border-color: #0070f3;
        }

        .category-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .category-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #2d3748;
          text-align: center;
        }

        .product-form h3 {
          margin-bottom: 1.5rem;
          color: #2d3748;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
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

        .required {
          color: #e53e3e;
          margin-left: 0.25rem;
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
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .reset-button, .search-button {
          padding: 0.75rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .reset-button {
          background-color: #f5f5f5;
          color: #333;
        }

        .reset-button:hover {
          background-color: #e5e5e5;
        }

        .search-button {
          background-color: #0070f3;
          color: white;
        }

        .search-button:hover {
          background-color: #005fc2;
        }

        .search-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top: 2px solid #0070f3;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
        }

        .results h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #2d3748;
        }

        .score-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 2rem;
        }

        .score {
          font-size: 4rem;
          font-weight: bold;
          margin: 1rem 0;
        }

        .score-max {
          font-size: 2rem;
          opacity: 0.8;
        }

        .score-description {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .categories, .common-issues, .analysis, .specifications, .timeline-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .categories h3, .common-issues h3, .analysis h3, 
        .specifications h3, .timeline-section h3 {
          margin-bottom: 1.5rem;
          color: #2d3748;
        }

        .category-grid-results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .common-issues ul {
          list-style: none;
          padding: 0;
        }

        .common-issues li {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .common-issues li strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .common-issues li div {
          margin-top: 0.5rem;
          color: #4a5568;
        }

        .analysis p {
          line-height: 1.8;
          color: #4a5568;
        }

        .sources {
          margin-top: 1rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
          color: #4a5568;
        }

        .specs-content pre {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e2e8f0;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }

        .timeline-marker {
          position: absolute;
          left: -2.75rem;
          width: 4rem;
          height: 2.5rem;
          background: #0070f3;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .timeline-content {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-left: 2rem;
        }

        .timeline-content h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #2d3748;
        }

        .timeline-content p {
          color: #4a5568;
          line-height: 1.6;
        }

        .timeline-content ul {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }

        .timeline-content li {
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }

          .category-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .category-grid-results {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>{t('productSearch.analyzing') || 'Analyzing product reliability...'}</span>
          <style jsx>{`
            .loading-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background-color: rgba(255, 255, 255, 0.95);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 9999;
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
          `}</style>
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
