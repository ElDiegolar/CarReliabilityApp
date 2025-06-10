
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';
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

  return (
    <Layout>
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge">🚗 AI-Powered Vehicle Intelligence</div>
          <h1 className="hero-title">
            <span className="gradient-text">{t('hero.title')}</span>
          </h1>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <div className="hero-buttons">
            <Link href="/search" className="btn-primary">
              <span>{t('hero.search')}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary">
              {t('hero.signup')}
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <h2>{t('features.title')}</h2>
          <div className="section-underline"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('features.reliabilityScores.title')}</h3>
            <p>{t('features.reliabilityScores.description')}</p>
            <div className="feature-glow"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>{t('features.commonIssues.title')}</h3>
            <p>{t('features.commonIssues.description')}</p>
            <div className="feature-glow"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>{t('features.expertAnalysis.title')}</h3>
            <p>{t('features.expertAnalysis.description')}</p>
            <div className="feature-glow"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>{t('features.premiumData.title')}</h3>
            <p>{t('features.premiumData.description')}</p>
            <div className="feature-glow"></div>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="section-header">
          <h2>{t('howItWorks.title')}</h2>
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
          <h2>{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.description')}</p>
          <div className="section-underline"></div>
        </div>
        
        <div className="pricing-cards">
          <div className="pricing-card starter">
            <div className="card-header">
              <h3>{t('pricing.free.title')}</h3>
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">{t('pricing.free.period')}</span>
              </div>
            </div>
            <ul className="feature-list">
              {freeFeatures.map((feature, index) => (
                <li key={index}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/search" className="plan-button starter-btn">
              {t('pricing.free.cta')}
            </Link>
          </div>
          
          <div className="pricing-card premium featured">
            <div className="featured-badge">
              <span>{t('pricing.premium.badge')}</span>
            </div>
            <div className="card-header">
              <h3>{t('pricing.premium.title')}</h3>
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">9.99</span>
                <span className="period">{t('pricing.premium.period')}</span>
              </div>
            </div>
            <ul className="feature-list">
              {premiumFeatures.map((feature, index) => (
                <li key={index}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="plan-button premium-btn">
              {t('pricing.premium.cta')}
            </Link>
          </div>
          
          <div className="pricing-card professional">
            <div className="card-header">
              <h3>{t('pricing.professional.title')}</h3>
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">19.99</span>
                <span className="period">{t('pricing.professional.period')}</span>
              </div>
            </div>
            <ul className="feature-list">
              {professionalFeatures.map((feature, index) => (
                <li key={index}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="plan-button pro-btn">
              {t('pricing.professional.cta')}
            </Link>
          </div>
        </div>
        {/* <TranslationDebugger /> */}
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 8rem;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #f6e05e 0%, #ecc94b 100%);
          opacity: 0.9;
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
          50% { transform: translateY(-20px) rotate(180deg); }
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
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          color: white;
          font-size: 0.9rem;
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
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          animation: slideInUp 0.8s ease-out 0.2s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          line-height: 1.6;
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(238, 90, 36, 0.6);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
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
          font-size: 1.2rem;
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
          margin-bottom: 8rem;
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
          position: relative;
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .feature-card:hover .feature-glow {
          opacity: 1;
        }

        .feature-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #718096;
          line-height: 1.6;
        }

        .process-section {
          margin-bottom: 8rem;
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
          font-weight: 700;
          font-size: 1.2rem;
          margin-right: 2rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .timeline-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          color: #718096;
          line-height: 1.6;
        }

        .pricing-section {
          margin-bottom: 8rem;
          padding: 0 2rem;
        }

        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-card {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid transparent;
        }

        .pricing-card.featured {
          border-color: #667eea;
          transform: scale(1.05);
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
        }

        .pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.featured:hover {
          transform: scale(1.05) translateY(-5px);
        }

        .featured-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .card-header h3 {
          font-size: 1.5rem;
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
          font-size: 1.5rem;
          font-weight: 600;
          color: #718096;
        }

        .amount {
          font-size: 3rem;
          font-weight: 800;
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
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: #4a5568;
        }

        .feature-list svg {
          color: #48bb78;
          flex-shrink: 0;
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
          border: 2px solid #e2e8f0;
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
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .pro-btn {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          box-shadow: 0 4px 15px rgba(45, 55, 72, 0.3);
        }

        .pro-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(45, 55, 72, 0.4);
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
            justify-content: center;
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