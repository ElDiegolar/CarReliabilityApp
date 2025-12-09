// pages/product-search.js - Generic product reliability search page
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import RevCounterGauge from '../components/RevCounterGauge';
import ShareReportButton from '../components/ShareReportButton';
import DownloadPdfButton from '../components/DownloadPdfButton';
import { 
  getAllCategories, 
  getCategoryConfig, 
  PRODUCT_CATEGORIES,
  formatProductName 
} from '../lib/product-categories';
import styles from '../styles/ProductSearch.module.css';

export default function ProductSearch() {
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const router = useRouter();
  const hasLoadedFromUrl = useRef(false);

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

  // Load data from URL parameters (from shared reports or direct links)
  useEffect(() => {
    if (!router.isReady || hasLoadedFromUrl.current) return;

    const { category, ...queryParams } = router.query;

    // If no query params, nothing to load
    if (Object.keys(queryParams).length === 0) return;

    // Mark that we've processed URL params to prevent re-running
    hasLoadedFromUrl.current = true;

    // If category is provided in URL, set it
    if (category && PRODUCT_CATEGORIES[category.toUpperCase()]) {
      setSelectedCategory(PRODUCT_CATEGORIES[category.toUpperCase()]);
    }

    // If there are query params with product data, populate the form
    const formData = {};
    const categoryConfig = getCategoryConfig(category || selectedCategory);
    
    // Map URL params to form fields
    categoryConfig.fields.forEach(field => {
      if (queryParams[field.name]) {
        formData[field.name] = queryParams[field.name];
      }
    });

    if (Object.keys(formData).length > 0) {
      setProductData(formData);
      // Auto-submit if we have required fields
      const hasRequiredFields = categoryConfig.fields
        .filter(f => f.required)
        .every(f => formData[f.name]);
      
      if (hasRequiredFields) {
        // Delay to ensure state is updated
        setTimeout(() => {
          handleSubmit(null, formData, category || selectedCategory);
        }, 100);
      }
    }
  }, [router.isReady, router.query]);

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
    hasLoadedFromUrl.current = false; // Allow URL params to be loaded again
    router.push('/product-search', undefined, { shallow: true });
  };

  // Handle form submission
  const handleSubmit = async (e, dataOverride = null, categoryOverride = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    setSpecifications(null);
    setTimelineData([]);

    const submitCategory = categoryOverride || selectedCategory;
    const submitData = dataOverride || productData;

    try {
      const requestBody = {
        productData: {
          ...submitData,
          category: submitCategory
        },
        category: submitCategory,
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

      // Update URL with search parameters for sharing/bookmarking
      const queryParams = new URLSearchParams({
        category: submitCategory,
        ...submitData
      });
      router.push(`/product-search?${queryParams.toString()}`, undefined, { shallow: true });

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
      
      <div className={styles.productSearchContainer}>
        <h1>{t('productSearch.title') || 'Product Reliability Checker'}</h1>
        <p className={styles.subtitle}>
          {t('productSearch.subtitle') || 'Check the reliability of any product based on real user reviews and expert testing'}
        </p>

        {!showSearchForm && (
          <button onClick={() => setShowSearchForm(true)} className={styles.reopenButton}>
            {t('productSearch.modifySearch') || 'Modify Search'}
          </button>
        )}

        {showSearchForm && (
          <div className={styles.searchSection}>
            {/* Category Selection */}
            <div className={styles.categorySelection}>
              <h3>{t('productSearch.selectCategory') || 'Select Product Category'}</h3>
              <div className={styles.categoryGrid}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryCard} ${selectedCategory === cat.id ? styles.active : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    <span className={styles.categoryName}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form */}
            <form onSubmit={handleSubmit} className={styles.productForm}>
              <h3>{t('productSearch.enterDetails') || `Enter ${currentConfig.name} Details`}</h3>
              <div className={styles.formGrid}>
                {currentConfig.fields.map((field) => (
                  <div key={field.name} className={styles.formGroup}>
                    <label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className={styles.required}>*</span>}
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

              <div className={styles.formActions}>
                {results && (
                  <button type="button" onClick={resetSearch} className={styles.resetButton}>
                    {t('productSearch.reset') || 'Reset'}
                  </button>
                )}
                <button type="submit" className={styles.searchButton} disabled={loading}>
                  {loading ? (
                    <><span className={styles.spinner} /> {t('productSearch.analyzing') || 'Analyzing...'}</>
                  ) : (
                    t('productSearch.checkReliability') || 'Check Reliability'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {/* Results Section */}
        {results && (
          <div className={styles.results}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2>{productName} {t('productSearch.reliabilityAnalysis') || 'Reliability Analysis'}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <DownloadPdfButton
                  reportType="product"
                  category={selectedCategory}
                  productData={productData}
                  reliabilityData={results}
                  specifications={specifications}
                  timelineData={timelineData}
                />
                <ShareReportButton
                  reportType="product"
                  category={selectedCategory}
                  productData={productData}
                  reliabilityData={results}
                  specifications={specifications}
                  timeline={timelineData}
                />
              </div>
            </div>
            
            {/* Overall Score */}
            <div className={styles.scoreCard}>
              <h3>{t('productSearch.overallScore') || 'Overall Reliability Score'}</h3>
              <div className={styles.score}>
                <span className={styles.scoreValue}>{results.overallScore}</span>
                <span className={styles.scoreMax}>/100</span>
              </div>
              <p className={styles.scoreDescription}>
                {results.overallScore >= 80 && (t('productSearch.excellentRating') || 'Excellent reliability rating')}
                {results.overallScore >= 60 && results.overallScore < 80 && (t('productSearch.goodRating') || 'Good reliability rating')}
                {results.overallScore >= 40 && results.overallScore < 60 && (t('productSearch.averageRating') || 'Average reliability rating')}
                {results.overallScore < 40 && (t('productSearch.poorRating') || 'Below average reliability rating')}
              </p>
            </div>

            {/* Category Scores */}
            {results.categories && (
              <div className={styles.categories}>
                <h3>{t('productSearch.categoryScores') || 'Category Breakdown'}</h3>
                <div className={styles.categoryGridResults}>
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
              <div className={styles.commonIssues}>
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
              <div className={styles.analysis}>
                <h3>{t('productSearch.expertAnalysis') || 'Expert Analysis'}</h3>
                <p>{results.analysis}</p>
                {results.sources && results.sources.length > 0 && (
                  <div className={styles.sources}>
                    <strong>{t('productSearch.sources') || 'Sources:'}</strong> {results.sources.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {specifications && (
              <div className={styles.specifications}>
                <h3>{t('productSearch.specifications') || 'Technical Specifications'}</h3>
                <div className={styles.specsContent}>
                  <pre>{JSON.stringify(specifications, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Timeline */}
            {timelineData && timelineData.length > 0 && (
              <div className={styles.timelineSection}>
                <h3>{t('productSearch.productHistory') || 'Product History'}</h3>
                <div className={styles.timeline}>
                  {timelineData.map((item, index) => (
                    <div key={index} className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>{item.year}</div>
                      <div className={styles.timelineContent}>
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

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>{t('productSearch.analyzing') || 'Analyzing product reliability...'}</span>
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
