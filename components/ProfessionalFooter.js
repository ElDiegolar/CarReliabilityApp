// components/ProfessionalFooter.js
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function ProfessionalFooter() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="professional-footer">
      <div className="footer-content">
        <div className="footer-container">
          {/* Brand Column */}
          <div className="footer-column">
            <div className="footer-brand">
              <span className="brand-icon">🚗</span>
              <div className="brand-text">
                <h4>Lemnaed</h4>
                <p>Reliable Vehicle Intelligence</p>
              </div>
            </div>
            <p className="footer-description">
              Making used car buying smarter and safer through reliable data and community intelligence.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Twitter">
                𝕏
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                in
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                f
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="footer-column">
            <h5 className="footer-heading">Product</h5>
            <nav className="footer-links">
              <Link href="/search">Vehicle Search</Link>
              <Link href="/pricing">Pricing Plans</Link>
              <Link href="/blog">Blog & Guides</Link>
              <Link href="/challenges">Challenges</Link>
            </nav>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h5 className="footer-heading">Company</h5>
            <nav className="footer-links">
              <Link href="/">About Us</Link>
              <Link href="/blog">Blog</Link>
              <a href="mailto:support@lemnaed.com">Contact Us</a>
              <Link href="/terms">Terms of Service</Link>
            </nav>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h5 className="footer-heading">Legal</h5>
            <nav className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <a href="#">Cookie Settings</a>
              <a href="#">Security</a>
            </nav>
          </div>

          {/* Newsletter Column */}
          <div className="footer-column">
            <h5 className="footer-heading">Stay Updated</h5>
            <p className="footer-small">Subscribe to get the latest vehicle insights.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                →
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Lemnaed. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="badge-text">🔒 Secure</span>
              <span className="badge-text">📊 Data-Driven</span>
              <span className="badge-text">🌍 Global</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .professional-footer {
          background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
          color: var(--gray-300);
          border-top: 1px solid var(--gray-700);
          margin-top: var(--spacing-20);
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: var(--spacing-16) var(--spacing-6);
        }

        .footer-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-12);
          margin-bottom: var(--spacing-12);
        }

        /* Brand Column */
        .footer-column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .footer-brand {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-3);
          margin-bottom: var(--spacing-4);
        }

        .brand-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .brand-text h4 {
          color: white;
          margin: 0;
          font-size: 1.25rem;
        }

        .brand-text p {
          color: var(--gray-400);
          font-size: 0.85rem;
          margin: var(--spacing-1) 0 0 0;
        }

        .footer-description {
          color: var(--gray-400);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: var(--spacing-4);
        }

        /* Social Links */
        .social-links {
          display: flex;
          gap: var(--spacing-3);
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 700;
          text-decoration: none;
          transition: all var(--transition-base);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .social-link:hover {
          background: var(--primary-600);
          border-color: var(--primary-500);
          transform: translateY(-2px);
        }

        /* Footer Heading */
        .footer-heading {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--spacing-4) 0;
          letter-spacing: -0.01em;
        }

        /* Footer Links */
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .footer-links a {
          color: var(--gray-400);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all var(--transition-base);
        }

        .footer-links a:hover {
          color: var(--primary-400);
          transform: translateX(4px);
        }

        /* Newsletter */
        .footer-small {
          color: var(--gray-400);
          font-size: 0.9rem;
          margin: 0;
        }

        .newsletter-form {
          display: flex;
          gap: var(--spacing-2);
          margin-top: var(--spacing-3);
        }

        .newsletter-input {
          flex: 1;
          padding: var(--spacing-2) var(--spacing-3);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-lg);
          color: white;
          font-size: 0.9rem;
          transition: all var(--transition-base);
        }

        .newsletter-input::placeholder {
          color: var(--gray-400);
        }

        .newsletter-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .newsletter-btn {
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--primary-600);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 600;
          font-size: 1.2rem;
          transition: all var(--transition-base);
        }

        .newsletter-btn:hover {
          background: var(--primary-700);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* Bottom Section */
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-8);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-8);
          flex-wrap: wrap;
        }

        .copyright {
          color: var(--gray-400);
          font-size: 0.9rem;
          margin: 0;
        }

        /* Badges */
        .footer-badges {
          display: flex;
          gap: var(--spacing-4);
          flex-wrap: wrap;
        }

        .badge-text {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-2);
          color: var(--gray-400);
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-content {
            padding: var(--spacing-12) var(--spacing-4);
          }

          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-8);
            margin-bottom: var(--spacing-8);
          }

          .footer-bottom-content {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-4);
          }

          .footer-badges {
            width: 100%;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}