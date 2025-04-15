// components/Layout.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Header from '../components/Header'; 
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
        {/* Header Navigation */}

        {/* <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
          <div className="container">
            <div className="logo">
              <Link href="/">
                <div className="logo-content">
                  <img 
                    src="/logo.png" 
                    alt="CarReliability" 
                    className="logo-image"
                    width={32}
                    height={32}
                    onError={(e) => {
                      e.target.style.display = 'none'; // Hide broken image
                    }}
                  />
                  <span className="logo-text">Car<span className="highlight">Reliability</span></span>
                </div>
              </Link>
            </div>

            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
              <ul className="nav-links">
                <li>
                  <Link href="/" className={router.pathname === '/' ? 'active' : ''}>
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link href="/search" className={router.pathname === '/search' ? 'active' : ''}>
                    {t('nav.search')}
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className={router.pathname === '/pricing' ? 'active' : ''}>
                    {t('nav.pricing')}
                  </Link>
                </li>
                <li className="auth-item">
                  {isAuthenticated ? (
                    <Link href="/profile" className="auth-link">
                      {t('nav.profile')}
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="auth-link">
                        {t('nav.login')}
                      </Link>
                      <span className="auth-divider">/</span>
                      <Link href="/login?mode=register" className="auth-link">
                        {t('nav.register')}
                      </Link>
                    </>
                  )}
                </li>
                <li className="language-selector">
                  <div className="language-dropdown">
                    <button onClick={toggleLanguage} className="language-button">
                      {router.locale === 'en' ? 'English' : 'Español'}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    <div className={`language-options ${languageOpen ? 'show' : ''}`}>
                      <Link href={router.asPath} locale="en" 
                        className={router.locale === 'en' ? 'active' : ''}>
                        English
                      </Link>
                      <Link href={router.asPath} locale="es" 
                        className={router.locale === 'es' ? 'active' : ''}>
                        Español
                      </Link>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </header> */}
        
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
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="copyright">
                {t('footer.copyright')}
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
        
        .header {
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 100;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f0f0f0;
        }

        .header.scrolled {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .logo-content {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-image {
          width: 32px;
          height: auto;
          margin-right: 0.5rem;
        }

        .logo-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          letter-spacing: -0.01em;
        }

        .highlight {
          color: #0070f3;
        }

        .menu-toggle {
          display: none; /* Hide by default, show only on mobile */
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001; /* Above the mobile nav */
        }

        .menu-toggle span {
          display: block;
          width: 24px;
          height: 2px;
          margin: 5px 0;
          background-color: #333;
          transition: all 0.3s ease;
        }

        .menu-toggle.active span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .menu-toggle.active span:nth-child(2) {
          opacity: 0;
        }

        .menu-toggle.active span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .nav {
          margin-left: auto;
        }

        .nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }

        .nav-links li {
          margin: 0 0.15rem;
        }

        .nav-links a {
          color: #444;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.5rem 0.85rem;
          transition: color 0.2s;
          display: inline-block;
        }

        .nav-links a:hover {
          color: #0070f3;
        }

        .nav-links a.active {
          color: #0070f3;
        }

        .auth-item {
          display: flex;
          align-items: center;
          margin-left: 0.5rem;
        }

        .auth-link {
          color: #444;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .auth-link:hover {
          color: #0070f3;
        }

        .auth-divider {
          color: #999;
          margin: 0 0.35rem;
        }

        .language-selector {
          margin-left: 1rem;
        }

        .language-dropdown {
          position: relative;
        }

        .language-button {
          display: flex;
          align-items: center;
          background-color: #f5f5f5;
          border: none;
          border-radius: 4px;
          padding: 0.4rem 0.75rem;
          font-size: 0.9rem;
          color: #444;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .language-button:hover {
          background-color: #e5e5e5;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          margin-left: 0.35rem;
          color: #666;
        }

        .language-options {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 4px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          width: 120px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 10;
          border: 1px solid #eee;
          margin-top: 0.5rem;
        }

        .language-options.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .language-options a {
          display: block;
          padding: 0.65rem 1rem;
          color: #444;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .language-options a:hover {
          background-color: #f5f5f5;
        }

        .language-options a.active {
          background-color: #f0f7ff;
          color: #0070f3;
          font-weight: 500;
        }

        /* Footer styles */
        .footer {
          background-color: #f9f9f9;
          padding: 3rem 0 1.5rem;
          border-top: 1px solid #eaeaea;
          margin-top: 3rem;
        }

        .footer-content {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .footer-logo {
          flex: 1;
          min-width: 250px;
          margin-bottom: 2rem;
        }

        .footer-logo .logo-text {
          font-size: 1.5rem;
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

        .footer-bottom {
          border-top: 1px solid #eaeaea;
          padding-top: 1.5rem;
          text-align: center;
        }

        .copyright {
          color: #666;
          font-size: 0.9rem;
        }

        /* Mobile styles - only apply at 768px and below */
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .menu-toggle {
            display: block; /* Show menu toggle only on mobile */
          }

          .nav {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 250px;
            background-color: white;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            padding-top: 4rem;
            overflow-y: auto;
          }

          .nav.open {
            transform: translateX(0);
          }

          .nav-links {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }

          .nav-links li {
            margin: 0.5rem 0;
            width: 100%;
          }

          .nav-links a {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
          }

          .auth-item {
            flex-direction: column;
            align-items: flex-start;
            margin-left: 0;
            width: 100%;
          }

          .auth-divider {
            display: none;
          }

          .auth-link {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin: 0.2rem 0;
          }

          .language-selector {
            margin-left: 0;
            margin-top: 0.5rem;
            width: 100%;
          }

          .language-button {
            width: 100%;
            justify-content: space-between;
          }

          .language-options {
            position: static;
            width: 100%;
            box-shadow: none;
            border: 1px solid #eee;
            margin-top: 0.5rem;
          }

          .footer-content {
            flex-direction: column;
          }

          .footer-links {
            gap: 2rem;
          }
        }
      `}</style>
    </>
  );
}