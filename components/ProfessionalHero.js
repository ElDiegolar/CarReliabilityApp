// components/ProfessionalHero.js
import Link from 'next/link';

export default function ProfessionalHero({ 
  title, 
  subtitle, 
  ctaText = 'Get Started', 
  ctaLink = '/search',
  backgroundStyle = 'gradient'
}) {
  return (
    <section className={`professional-hero hero-${backgroundStyle}`}>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <div className="hero-actions">
            <Link href={ctaLink} className="btn btn-primary btn-lg">
              {ctaText}
              <span className="btn-arrow">→</span>
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-lg">
              View Pricing
            </Link>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-element decoration-1"></div>
          <div className="decoration-element decoration-2"></div>
          <div className="decoration-element decoration-3"></div>
        </div>
      </div>

      <style jsx>{`
        .professional-hero {
          position: relative;
          overflow: hidden;
          padding: var(--spacing-20) var(--spacing-6);
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Gradient Background */
        .hero-gradient {
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%);
        }

        /* Solid Background */
        .hero-solid {
          background: white;
          border-bottom: 1px solid var(--gray-200);
        }

        /* Dark Background */
        .hero-dark {
          background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
        }

        /* Hero Container */
        .hero-container {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-12);
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* Hero Content */
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-6);
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
          color: var(--gray-900);
          margin: 0;
        }

        .hero-dark .hero-title {
          color: white;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          font-weight: 400;
          line-height: 1.8;
          color: var(--gray-600);
          margin: 0;
          max-width: 500px;
        }

        .hero-dark .hero-subtitle {
          color: var(--gray-300);
        }

        /* Hero Actions */
        .hero-actions {
          display: flex;
          gap: var(--spacing-4);
          align-items: center;
          flex-wrap: wrap;
          margin-top: var(--spacing-4);
        }

        .btn-arrow {
          margin-left: var(--spacing-2);
          transition: transform var(--transition-base);
        }

        .btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Decoration */
        .hero-decoration {
          position: relative;
          height: 400px;
          display: none;
        }

        .decoration-element {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .decoration-1 {
          width: 300px;
          height: 300px;
          background: var(--primary-600);
          top: -50px;
          right: -50px;
          animation-delay: 0s;
        }

        .decoration-2 {
          width: 200px;
          height: 200px;
          background: var(--primary-400);
          bottom: 50px;
          right: 50px;
          animation-delay: 2s;
        }

        .decoration-3 {
          width: 250px;
          height: 250px;
          background: var(--gray-400);
          top: 100px;
          right: 100px;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-8);
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-decoration {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .professional-hero {
            padding: var(--spacing-12) var(--spacing-4);
            min-height: auto;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .hero-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .professional-hero {
            padding: var(--spacing-8) var(--spacing-4);
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}