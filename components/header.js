// components/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' }
  ];

  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === router.locale);
    return currentLang ? currentLang.name : 'English';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setLanguageOpen(false);
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
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="logo">
          <Link href="/">
            <div className="logo-content">
              <img 
                src="/logo.png" 
                alt="CarReliability" 
                className="logo-image"
                width={64}
                height={32}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="logo-text">Car<span className="highlight">Reliability</span></span>
            </div>
          </Link>
        </div>

        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label={t('nav.toggleMenu')}
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
            {isAuthenticated ? (
              <li className="profile-item">
                <Link href="/profile" className="profile-link">
                  {t('nav.profile')}
                </Link>
              </li>
            ) : (
              <li className="auth-item">
                <Link href="/login" className="auth-link login">
                  {t('nav.login')}
                </Link>
                <span className="auth-divider">/</span>
                <Link href="/login?mode=register" className="auth-link register">
                  {t('nav.register')}
                </Link>
              </li>
            )}
            <li className="language-selector">
              <div className="language-dropdown">
              <button onClick={toggleLanguage} className="language-button">
  {/* <span className="flag">
    {languages.find(lang => lang.code === router.locale)?.flag}
  </span> */}
  {getCurrentLanguageName()}
  <span className="dropdown-arrow">▼</span>
</button>
                <div className={`language-options ${languageOpen ? 'show' : ''}`}>
                {languages.map((language) => (
                  <Link 
                    key={language.code} 
    href={router.asPath} 
    locale={language.code} 
    legacyBehavior 
    passHref
                  >
                    <a 
      className={router.locale === language.code ? 'active' : ''} 
      onClick={() => setLanguageOpen(false)}
    >
      <span className="flag">{language.flag}</span> 
                    </a>
                  </Link>
                ))}

                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <style jsx>{`
        .header {
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
          min-width: 200px;
        }

        .logo-content {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-image {
          margin-right: 0.5rem;
          width: 64px;
          height: auto;
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
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
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
          margin: 0 1.2rem; /* ✨ More space between buttons on desktop */
        }

        .nav-links a {
        min-width: 100px; /* 👈 ensure consistent button size */
  text-align: center;
          color: #444;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.2s;
          display: inline-block;
        }

        .nav-links a:hover {
          color: #0070f3;
          background-color: rgba(0, 112, 243, 0.04);
        }

        .nav-links a.active {
          color: #0070f3;
          background-color: rgba(0, 112, 243, 0.08);
          font-weight: 600;
        }

        .auth-item {
          display: flex;
          align-items: center;
        }

        .auth-link {
          font-weight: 500;
          color: #444;
          text-decoration: none;
          transition: all 0.2s;
          padding: 0.5rem 0.75rem;
        }

        .auth-link:hover {
          color: #0070f3;
        }

        .auth-link.register {
          color: #0070f3;
        }

        .auth-link.register:hover {
          text-decoration: underline;
        }

        .profile-link {
          color: #0070f3;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        .profile-link:hover {
          background-color: rgba(0, 112, 243, 0.08);
        }

        .auth-divider {
          color: #999;
          margin: 0 0.35rem;
        }

        .language-selector {
          position: relative;
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
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
          color: #444;
          min-width: 100px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .language-button:hover {
          background-color: #e5e5e5;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          margin-left: auto;
          color: #666;
        }
          .language-options a .flag {
  margin-right: 0.5rem;
  font-size: 1.1rem;
  vertical-align: middle;
}   
        .language-options {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 4px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          width: 140px;
          max-height: 250px;
          overflow-y: auto;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 10;
          border: 1px solid #eee;
          margin-top: 0.5rem;

          /* 👇 ADD THIS */
          display: flex;
          flex-direction: column;
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

        @media (max-width: 768px) {
          .nav-links li {
            margin: 0.6rem 0; /* 👈 This mobile spacing is untouched */
          }
        }
      `}</style>
    </header>
  );
}
