// pages/index.js - SEO-optimized Home page component with i18n
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import TranslationDebugger from '../components/TranslationsDebugger';

export default function Home() {
  const { t } = useTranslation('common');

  // Default fallbacks for when translations fail or return non-arrays
  const defaultSteps = [
    { title: 'Enter Vehicle Details', description: 'Provide the year, make, model, and mileage of the vehicle you want to research.' },
    { title: 'Get Instant Results', description: 'Our AI analyzes data from multiple sources to provide accurate reliability information.' },
    { title: 'Make Informed Decisions', description: 'Use the reliability data to make better decisions about buying, selling, or maintaining vehicles.' }
  ];

  const defaultFreeFeatures = [
    'Basic reliability scores',
    'Engine & transmission data',
    'Limited vehicle searches',
    'Basic analysis'
  ];

  const defaultPremiumFeatures = [
    'Comprehensive reliability scores',
    'All vehicle systems data',
    'Common issues with repair costs',
    'Priority support',
    'Limited search history'
  ];

  const defaultProfessionalFeatures = [
    'Everything in Premium',
    'Batch vehicle analysis',
    'Comparison tools',
    'Market value analysis',
    'Dealership integration',
    'Unlimited search history',
    'API access',
    '24/7 priority support'
  ];

  // Safe translation function for arrays
  const safeTranslationArray = (path, defaultArray) => {
    try {
      const result = t(path, { returnObjects: true });
      return Array.isArray(result) ? result : defaultArray;
    } catch (e) {
      console.error(`Error getting translation array for ${path}:`, e);
      return defaultArray;
    }
  };

  // Get arrays safely
  const steps = safeTranslationArray('howItWorks.steps', defaultSteps);
  const freeFeatures = safeTranslationArray('pricing.free.features', defaultFreeFeatures);
  const premiumFeatures = safeTranslationArray('pricing.premium.features', defaultPremiumFeatures);
  const professionalFeatures = safeTranslationArray('pricing.professional.features', defaultProfessionalFeatures);

  // Structured data for the homepage
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lemnaed Product Reliability Checker",
    "description": "Free product reliability checker for cars, electronics, appliances, and more. Get instant reliability scores based on real user reviews and expert testing.",
    "url": "https://lemnaed.com",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free product reliability checking service worldwide"
    },
    "featureList": [
      "Product reliability scores",
      "Multi-category support (automotive, electronics, appliances, tools, etc.)",
      "AI-powered analysis",
      "Real user review aggregation",
      "Expert testing data",
      "Common issues database",
      "Worldwide product data"
    ],
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    }
  };

  return (
    <Layout>
      <SEO
        title="Free Product Reliability Checker | Cars, Electronics, Appliances & More"
        description="Check reliability for any product with review history - cars, electronics, appliances, tools. Get instant reliability reports based on real user reviews and expert testing."
        keywords="product reliability checker, reliability score, consumer reports, product reviews, car reliability, electronics reliability, appliance reliability, best products"
        structuredData={homeStructuredData}
      />
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            {t('hero.badge')}
          </div>
          <h1 className="hero-title">
            {t('hero.title')}
            <br />
            <span className="gradient-text">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <div className="hero-buttons">
            <Link href="/product-search" className="btn-primary">
              <span className="btn-icon">🔍</span>
              <span className="btn-text">{t('hero.checkProductReliability')}</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link href="/search" className="btn-secondary">
              <span className="btn-icon">🚗</span>
              <span className="btn-text">{t('hero.checkVehicleReliability')}</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">{t('hero.stats.productsAnalyzed')}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">{t('hero.stats.accuracyRate')}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">{t('hero.stats.instantResults')}</div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Products Analyzed</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Instant Results</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <h2>{t('features.title')}</h2>
          <p className="section-subtitle">Comprehensive product reliability insights powered by AI</p>
          <div className="section-underline"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('features.reliabilityScores.title')}</h3>
            <p>{t('features.reliabilityScores.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>{t('features.commonIssues.title')}</h3>
            <p>{t('features.commonIssues.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>{t('features.expertAnalysis.title')}</h3>
            <p>{t('features.expertAnalysis.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>{t('features.premiumData.title')}</h3>
            <p>{t('features.premiumData.description')}</p>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="section-header">
          <h2>{t('howItWorks.title')}</h2>
          <p className="section-subtitle">Simple, fast, and accurate product reliability research</p>
          <div className="section-underline"></div>
        </div>
        <div className="process-timeline">
          {steps.map((step, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-connector"></div>
              <div className="timeline-marker">
                <span>{index + 1}</span>
              </div>
              <div className="timeline-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pricing-section">
        <div className="section-header">
          <h2>🎉 All Features Now Free!</h2>
          <p className="section-subtitle">Get complete access to all product reliability data and analysis tools at no cost.</p>
          <div className="section-underline"></div>
        </div>
        
        <div className="free-features-card">
          <div className="card-header">
            <h3>Complete Product Reliability Analysis</h3>
            <div className="price-display">
              <span className="currency">$</span>
              <span className="amount">0</span>
              <span className="period">Forever Free</span>
            </div>
          </div>
          <div className="features-grid">
            <div className="feature-column">
              <h4>✅ Reliability Analysis</h4>
              <ul>
                <li>Comprehensive reliability scores</li>
                <li>Multi-category support</li>
                <li>Cars, electronics, appliances</li>
                <li>Tools, furniture, and more</li>
              </ul>
            </div>
            <div className="feature-column">
              <h4>✅ Advanced Features</h4>
              <ul>
                <li>Common issues with fix costs</li>
                <li>AI-powered analysis</li>
                <li>Product comparison tools</li>
                <li>PDF report generation</li>
              </ul>
            </div>
            <div className="feature-column">
              <h4>✅ Full Access</h4>
              <ul>
                <li>Unlimited product searches</li>
                <li>Complete search history</li>
                <li>Product history timelines</li>
                <li>All specifications</li>
              </ul>
            </div>
          </div>
          <Link href="/product-search" className="plan-button free-btn">
            Start Analyzing Products - Free!
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 1rem 2.5rem;
          font-size: 1rem;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          text-decoration: none;
        }

        .btn-primary {
          background-color: #0070f3;
          color: white;
        }

        .btn-primary:hover {
          background-color: #005fc2;
        }

        .btn-secondary {
          background-color: white;
          color: #0070f3;
          border: 2px solid #0070f3;
        }

        .btn-secondary:hover {
          background-color: #f0f9ff;
        }

        .btn-icon {
          font-size: 20px;
        }

        .btn-text {
          font-size: 16px;
        }

        .btn-arrow {
          font-size: 18px;
          transition: transform 0.2s ease;
        }

        .btn-primary:hover .btn-arrow,
        .btn-secondary:hover .btn-arrow {
          transform: translateX(3px);
        }
      `}</style>

      <style jsx>{`
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: white;
          color: #0284c7;
          padding: 1.125rem 2.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.05rem;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .btn-hero-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
          background: #f9fafb;
        }
        
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1.125rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.05rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .btn-hero-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .btn-icon {
          font-size: 1.2rem;
        }
        
        .btn-arrow {
          font-size: 1.3rem;
          transition: transform 0.2s ease;
        }
        
        .btn-hero-primary:hover .btn-arrow {
          transform: translateX(4px);
        }
        .hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 6rem;
          padding: 4rem 2rem;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
          opacity: 0.95;
        }

        .hero-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          padding: 0 2rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-full);
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2rem;
          animation: slideInUp 0.8s ease-out;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .badge-icon {
          font-size: 1.1rem;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.15;
          animation: slideInUp 0.8s ease-out 0.2s both;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .hero-description {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2.5rem;
          line-height: 1.6;
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 2.5rem;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }
        
        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.8s ease-out 0.8s both;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        
        .stat-divider {
          width: 1px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.8s ease-out 0.8s both;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #718096;
          margin-bottom: 2rem;
        }

        .section-underline {
          width: 80px;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          margin: 0 auto;
          border-radius: 2px;
        }

        .features-section {
          margin-bottom: 6rem;
          padding: 0 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .feature-card h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #718096;
          line-height: 1.6;
        }

        .process-section {
          margin-bottom: 6rem;
          padding: 0 2rem;
        }

        .process-timeline {
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 3rem;
          position: relative;
        }

        .timeline-item:last-child .timeline-connector {
          display: none;
        }

        .timeline-connector {
          position: absolute;
          left: 25px;
          top: 60px;
          width: 2px;
          height: 80px;
          background: linear-gradient(to bottom, #667eea, #764ba2);
          opacity: 0.3;
          border-radius: 1px;
        }

        .timeline-marker {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          margin-right: 2rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .timeline-content h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          color: #718096;
          line-height: 1.6;
        }

        .pricing-section {
          margin-bottom: 6rem;
          padding: 0 2rem;
        }

        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .free-features-card {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 3px solid #48bb78;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .feature-column {
          padding: 1.5rem;
          background: #f7fafc;
          border-radius: 12px;
          border-left: 4px solid #48bb78;
        }

        .feature-column h4 {
          color: #2d3748;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .feature-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-column li {
          padding: 0.5rem 0;
          color: #4a5568;
          font-size: 0.95rem;
        }

        .free-btn {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .free-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
        }

        .pricing-card {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .pricing-card.featured {
          border-color: #667eea;
          transform: scale(1.02);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
        }

        .pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.featured:hover {
          transform: scale(1.02) translateY(-5px);
        }

        .featured-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f7fafc;
        }

        .card-header h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .price-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }

        .currency {
          font-size: 1.3rem;
          font-weight: 600;
          color: #667eea;
        }

        .amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .period {
          font-size: 1rem;
          color: #718096;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          color: #4a5568;
        }

        .check-mark {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          background: #48bb78;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .plan-button {
          display: block;
          width: 100%;
          padding: 1rem;
          text-align: center;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .starter-btn {
          background: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .starter-btn:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .premium-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .pro-btn {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          box-shadow: 0 4px 15px rgba(45, 55, 72, 0.3);
        }

        .pro-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 55, 72, 0.4);
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 600px;
            padding: 2rem 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1.05rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            min-width: auto;
            padding: 0.875rem 1.5rem;
            font-size: 0.9375rem;
          }

          .btn-icon {
            font-size: 1.125rem;
          }

          .btn-text {
            font-size: 0.9375rem;
          }

          .btn-arrow {
            font-size: 1rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .stat-divider {
            width: 50px;
            height: 1px;
          }

          .stat-number {
            font-size: 2rem;
          }

          .timeline-item {
            flex-direction: column;
            text-align: center;
          }

          .timeline-marker {
            margin-right: 0;
            margin-bottom: 1rem;
          }

          .timeline-connector {
            display: none;
          }

          .pricing-cards {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .pricing-card.featured {
            transform: none;
            order: -1;
          }

          .pricing-card.featured:hover {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </Layout>
  );
}

// This function gets called at build time and on every request
export async function getStaticProps({ locale }) {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
      },
    };
  } catch (error) {
    console.error('Translation loading error:', error);
    // Return minimal props to prevent build failure
    return {
      props: {},
    };
  }
}