// components/Layout.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Header from './header'; 
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, title }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const pageTitle = title || "CarReliability";

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle route change to close mobile menu
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguageOpen(!languageOpen);
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="layout">
        <Header/>
        
        <main className="main-content">
          {children}
        </main>
        
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">
                <Link href="/">
                  <span className="logo-text">Car<span className="highlight">Reliability</span></span>
                </Link>
                <p className="footer-tagline">
                  {t('hero.description')}
                </p>
              </div>
              
              <div className="footer-links">
                <div className="footer-section">
                  <h3>{t('nav.home')}</h3>
                  <ul>
                    <li><Link href="/search">{t('nav.search')}</Link></li>
                    <li><Link href="/pricing">{t('nav.pricing')}</Link></li>
                  </ul>
                </div>
                
                <div className="footer-section">
                  <h3>{t('profile.accountInfo')}</h3>
                  <ul>
                    <li><Link href="/profile">{t('nav.profile')}</Link></li>
                    <li><Link href="/search-history">{t('nav.history')}</Link></li>
                  </ul>
                </div>
                
                <div className="footer-section">
                  <h3>{t('common.info', 'Legal')}</h3>
                  <ul>
                    <li><Link href="/terms">{t('footer.terms')}</Link></li>
                    <li><Link href="/privacy">{t('footer.privacy')}</Link></li>
                    <li><a href="mailto:contact@carreliability.com">{t('footer.contact')}</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright section - separated from the footer-content for better visibility */}
          <div className="copyright-container">
            <div className="container">
              <p className="copyright">
                {t('footer.copyright', '© 2025 CarReliability. All rights reserved.')}
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .main-content {
          flex: 1;
          padding: 1.5rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        
        /* Footer styles */
        .footer {
          background-color: #f9f9f9;
          border-top: 1px solid #eaeaea;
          margin-top: 3rem;
        }

        .container {
          display: flex;
          flex-direction: column;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
        }

        .footer-content {
          display: flex;
          flex-wrap: wrap;
          padding: 3rem 0;
        }

        .footer-logo {
          flex: 1;
          max-width: 50%;
          margin-bottom: 2rem;
        }

        .footer-logo .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          letter-spacing: -0.01em;
        }

        .highlight {
          color: #0070f3;
        }

        .footer-tagline {
          color: #666;
          margin-top: 0.75rem;
          font-size: 0.95rem;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 3rem;
        }

        .footer-section h3 {
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 1rem;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 0.75rem;
        }

        .footer-section a {
          color: #555;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: #0070f3;
        }

        /* Copyright section */
        .copyright-container {
          border-top: 1px solid #eaeaea;
          background-color: #f3f3f3;
          width: 100%;
          padding: 1rem 0;
          text-align: center;
        }

        .copyright {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        /* Mobile styles - only apply at 768px and below */
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .footer-content {
            flex-direction: column;
            padding: 2rem 0;
          }

          .footer-links {
            gap: 2rem;
          }
        }
      `}</style>
    </>
  );
}