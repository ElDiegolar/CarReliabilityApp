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
          <div className="hero-badge">🔍 AI-Powered Product Reliability Intelligence</div>
          <h1 className="hero-title">
            <span className="gradient-text">Check Any Product's Reliability</span>
            <br />
            <span className="hero-subtitle">Cars • Electronics • Appliances • Tools & More</span>
          </h1>
          <p className="hero-description">
            Get instant reliability reports for any product with review history. Check cars, smartphones, appliances, tools, and more. Make informed purchasing decisions with comprehensive reliability analysis.
          </p>
          <div className="hero-buttons">
            <Link href="/product-search" className="btn-primary cta-search search-btn">
              <button type="button" className="search-btn-inner">
                <span role="img" aria-label="search" style={{fontSize: '1.5em', verticalAlign: 'middle', marginRight: '0.5em'}}>🔍</span>
                {t('hero.search')}
              </button>
            </Link>
            <Link href="/search" className="btn-secondary">
              {t('hero.searchCars') || 'Search Cars (Classic)'}
            </Link>
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

      <style jsx>{`
        .search-btn {
          padding: 0;
          background: none;
          border: none;
        }
        .search-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(90deg, #ff9800 0%, #ff5e62 100%);
          color: #fff;
          padding: 1.25rem 2.5rem;
          border-radius: 40px;
          font-weight: 800;
          font-size: 1.35rem;
          border: none;
          box-shadow: 0 6px 24px rgba(255, 94, 98, 0.18), 0 1.5px 8px rgba(255, 152, 0, 0.12);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(.25,.8,.25,1);
          position: relative;
          animation: pulseGlow 1.8s infinite;
        }
        .search-btn-inner:hover {
          background: linear-gradient(90deg, #ff5e62 0%, #ff9800 100%);
          box-shadow: 0 0 0 8px rgba(255,152,0,0.12), 0 8px 32px rgba(255, 94, 98, 0.22);
        }
        .hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 6rem;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 30px;
          color: white;
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 2rem;
          animation: slideInUp 0.8s ease-out;
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
          line-height: 1.1;
          animation: slideInUp 0.8s ease-out 0.2s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .btn-primary {
          display: inline-block;
          background: linear-gradient(90deg, #ff9800 0%, #ff5e62 100%);
          color: #fff;
          padding: 1.25rem 2.5rem;
          border-radius: 40px;
          font-weight: 800;
          font-size: 1.35rem;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(.25,.8,.25,1);
          box-shadow: 0 6px 24px rgba(255, 94, 98, 0.18), 0 1.5px 8px rgba(255, 152, 0, 0.12);
          position: relative;
          animation: pulseGlow 1.8s infinite;
        }

        .btn-primary.cta-search {
          border: 3px solid #fff3e0;
          box-shadow: 0 0 0 6px rgba(255,152,0,0.08), 0 6px 24px rgba(255, 94, 98, 0.18);
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(255,152,0,0.25), 0 6px 24px rgba(255, 94, 98, 0.18); }
          70% { box-shadow: 0 0 0 12px rgba(255,152,0,0.12), 0 6px 24px rgba(255, 94, 98, 0.18); }
          100% { box-shadow: 0 0 0 0 rgba(255,152,0,0.25), 0 6px 24px rgba(255, 94, 98, 0.18); }
        }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: white;
        }

        .btn-secondary {
          display: inline-block;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 2rem;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
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
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            max-width: 280px;
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