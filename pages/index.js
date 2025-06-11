
// pages/index.js - Lemon-themed Home page component with i18n
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
        <div className="lemon-decorations">
          <div className="lemon lemon-1">🍋</div>
          <div className="lemon lemon-2">🍋</div>
          <div className="lemon lemon-3">🍋</div>
          <div className="lemon lemon-4">🍋</div>
          <div className="lemon lemon-5">🍋</div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🚗 Fresh AI-Powered Vehicle Intelligence 🍋</div>
          <h1 className="hero-title">
            <span className="gradient-text">{t('hero.title')}</span>
            <div className="title-accent">✨ Zesty & Reliable ✨</div>
          </h1>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <div className="hero-buttons">
            <Link href="/search" className="btn-primary">
              <span>{t('hero.search')}</span>
              <div className="btn-sparkle">✨</div>
            </Link>
            <Link href="/login" className="btn-secondary">
              <span>{t('hero.signup')}</span>
              <div className="btn-lemon">🍋</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <h2>{t('features.title')}</h2>
          <div className="section-subtitle">Fresh insights, zesty results 🍋</div>
          <div className="section-underline"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('features.reliabilityScores.title')}</h3>
            <p>{t('features.reliabilityScores.description')}</p>
            <div className="feature-glow"></div>
            <div className="feature-lemon">🍋</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>{t('features.commonIssues.title')}</h3>
            <p>{t('features.commonIssues.description')}</p>
            <div className="feature-glow"></div>
            <div className="feature-lemon">🍋</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>{t('features.expertAnalysis.title')}</h3>
            <p>{t('features.expertAnalysis.description')}</p>
            <div className="feature-glow"></div>
            <div className="feature-lemon">🍋</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>{t('features.premiumData.title')}</h3>
            <p>{t('features.premiumData.description')}</p>
            <div className="feature-glow"></div>
            <div className="feature-lemon">🍋</div>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="section-header">
          <h2>{t('howItWorks.title')}</h2>
          <div className="section-subtitle">Squeeze the most out of your research 🍋</div>
          <div className="section-underline"></div>
        </div>
        <div className="process-timeline">
          {steps.map((step, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-connector"></div>
              <div className="timeline-marker">
                <span>{index + 1}</span>
                <div className="marker-lemon">🍋</div>
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
          <p className="section-subtitle">{t('pricing.description')} 🍋</p>
          <div className="section-underline"></div>
        </div>
        
        <div className="pricing-cards">
          <div className="pricing-card starter">
            <div className="card-decoration">🍋</div>
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
                  <div className="check-mark">🍋</div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/search" className="plan-button starter-btn">
              <span>{t('pricing.free.cta')}</span>
              <div className="btn-accent">🌟</div>
            </Link>
          </div>
          
          <div className="pricing-card premium featured">
            <div className="featured-badge">
              <span>🍋 {t('pricing.premium.badge')} 🍋</span>
            </div>
            <div className="card-decoration premium-decoration">🍋</div>
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
                  <div className="check-mark">🍋</div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="plan-button premium-btn">
              <span>{t('pricing.premium.cta')}</span>
              <div className="btn-accent">✨</div>
            </Link>
          </div>
          
          <div className="pricing-card professional">
            <div className="card-decoration">🍋</div>
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
                  <div className="check-mark">🍋</div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="plan-button pro-btn">
              <span>{t('pricing.professional.cta')}</span>
              <div className="btn-accent">🚀</div>
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
          background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
          opacity: 0.95;
        }

        .hero-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffec8b' fill-opacity='0.15'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: float 25s ease-in-out infinite;
        }

        .lemon-decorations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .lemon {
          position: absolute;
          font-size: 2rem;
          opacity: 0.3;
          animation: bobFloat 8s ease-in-out infinite;
        }

        .lemon-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .lemon-2 {
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .lemon-3 {
          bottom: 30%;
          left: 8%;
          animation-delay: 4s;
        }

        .lemon-4 {
          bottom: 15%;
          right: 10%;
          animation-delay: 6s;
        }

        .lemon-5 {
          top: 50%;
          left: 5%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }

        @keyframes bobFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(-5px) rotate(-5deg); }
          75% { transform: translateY(-15px) rotate(3deg); }
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
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 2rem;
          border-radius: 50px;
          color: #2d3748;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 2rem;
          animation: slideInUp 0.8s ease-out;
          box-shadow: 0 4px 20px rgba(241, 196, 15, 0.3);
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
          margin-bottom: 1rem;
          line-height: 1.1;
          animation: slideInUp 0.8s ease-out 0.2s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #fff8dc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .title-accent {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .hero-description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 3rem;
          line-height: 1.6;
          animation: slideInUp 0.8s ease-out 0.4s both;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(45, 55, 72, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(45, 55, 72, 0.6);
        }

        .btn-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: #2d3748;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-3px);
        }

        .btn-lemon {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          font-size: 1.3rem;
          color: #f39c12;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .section-underline {
          width: 100px;
          height: 5px;
          background: linear-gradient(135deg, #f1c40f, #f39c12);
          margin: 0 auto;
          border-radius: 3px;
          box-shadow: 0 2px 10px rgba(241, 196, 15, 0.3);
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
          border-radius: 25px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 3px solid transparent;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-15px);
          box-shadow: 0 25px 70px rgba(241, 196, 15, 0.2);
          border-color: #f1c40f;
        }

        .feature-card:hover .feature-glow {
          opacity: 1;
        }

        .feature-card:hover .feature-lemon {
          transform: scale(1.2) rotate(360deg);
        }

        .feature-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(241, 196, 15, 0.1), rgba(243, 156, 18, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .feature-lemon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.5rem;
          opacity: 0.6;
          transition: all 0.3s ease;
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
          left: 30px;
          top: 70px;
          width: 3px;
          height: 80px;
          background: linear-gradient(to bottom, #f1c40f, #f39c12);
          opacity: 0.6;
          border-radius: 2px;
        }

        .timeline-marker {
          position: relative;
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f1c40f, #f39c12);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2d3748;
          font-weight: 800;
          font-size: 1.3rem;
          margin-right: 2rem;
          box-shadow: 0 6px 20px rgba(241, 196, 15, 0.4);
          border: 3px solid white;
        }

        .marker-lemon {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 1.2rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
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
          position: relative;
          background: white;
          border-radius: 30px;
          padding: 2.5rem;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 3px solid transparent;
          overflow: hidden;
        }

        .pricing-card.featured {
          border-color: #f1c40f;
          transform: scale(1.05);
          box-shadow: 0 25px 70px rgba(241, 196, 15, 0.3);
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.featured:hover {
          transform: scale(1.05) translateY(-10px);
        }

        .card-decoration {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .premium-decoration {
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .pricing-card:hover .card-decoration {
          opacity: 0.8;
          transform: scale(1.2) rotate(15deg);
        }

        .featured-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f1c40f, #f39c12);
          color: #2d3748;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(241, 196, 15, 0.4);
          border: 2px solid white;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f7fafc;
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
          color: #f39c12;
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
          gap: 1rem;
          padding: 0.75rem 0;
          color: #4a5568;
        }

        .check-mark {
          flex-shrink: 0;
          font-size: 1.2rem;
        }

        .plan-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1.2rem;
          text-align: center;
          border-radius: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .starter-btn {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .starter-btn:hover {
          background: linear-gradient(135deg, #edf2f7, #e2e8f0);
          border-color: #cbd5e0;
          transform: translateY(-2px);
        }

        .premium-btn {
          background: linear-gradient(135deg, #f1c40f, #f39c12);
          color: #2d3748;
          box-shadow: 0 6px 20px rgba(241, 196, 15, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .premium-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(241, 196, 15, 0.6);
        }

        .pro-btn {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          box-shadow: 0 6px 20px rgba(45, 55, 72, 0.4);
        }

        .pro-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(45, 55, 72, 0.6);
        }

        .btn-accent {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .lemon-decorations {
            display: none;
          }

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
            transform: translateY(-10px);
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