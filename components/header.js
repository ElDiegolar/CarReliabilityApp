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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setLanguageOpen(false);
      setUserMenuOpen(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="logo">
          <Link href="/">
            <div className="logo-content">
              <img src="/logo.png" alt="CarReliability" className="logo-image" width={64} height={32} />
              <span className="logo-text">Car<span className="highlight">Reliability</span></span>
            </div>
          </Link>
        </div>

        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link href="/" legacyBehavior><a className={router.pathname === '/' ? 'active' : ''}>{t('nav.home')}</a></Link></li>
            <li><Link href="/search" legacyBehavior><a className={router.pathname === '/search' ? 'active' : ''}>{t('nav.search')}</a></Link></li>
            <li><Link href="/pricing" legacyBehavior><a className={router.pathname === '/pricing' ? 'active' : ''}>{t('nav.pricing')}</a></Link></li>

            {isAuthenticated ? (
              <li className="user-dropdown">
                <button className="user-button" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <span className="user-icon">👤</span>
                  <span className="user-email">{user?.email?.split('@')[0]}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className={`user-menu ${userMenuOpen ? 'show' : ''}`}>
                  <Link href="/profile" legacyBehavior><a className="user-menu-item">{t('nav.profile')}</a></Link>
                  <Link href="/search-history" legacyBehavior><a className="user-menu-item">{t('nav.history')}</a></Link>
                  <Link href="/saved-vehicles" legacyBehavior><a className="user-menu-item">{t('savedVehicles.title')}</a></Link>
                  <button onClick={handleLogout} className="user-menu-item logout">{t('nav.logout')}</button>
                </div>
              </li>
            ) : (
              <li className="auth-item">
                <Link href="/login" legacyBehavior><a className="auth-link login">{t('nav.login')}</a></Link>
                <span className="auth-divider">/</span>
                <Link href="/login?mode=register" legacyBehavior><a className="auth-link register">{t('nav.register')}</a></Link>
              </li>
            )}

            <li className="language-selector">
              <div className="language-dropdown">
                <button onClick={() => setLanguageOpen(!languageOpen)} className="language-button">
                  {getCurrentLanguageName()}<span className="dropdown-arrow">▼</span>
                </button>
                <div className={`language-options ${languageOpen ? 'show' : ''}`}>
                  {languages.map(lang => (
                    <Link key={lang.code} href={router.asPath} locale={lang.code} legacyBehavior passHref>
                      <a className={router.locale === lang.code ? 'active' : ''} onClick={() => setLanguageOpen(false)}>
                        <span className="flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
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
        .user-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 4px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          width: 180px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 10;
          border: 1px solid #eee;
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
        }

        .user-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .user-menu-item {
          display: block;
          padding: 0.75rem 1rem;
          color: #444;
          text-decoration: none;
          transition: background-color 0.2s;
          text-align: left;
          width: 100%;
          font-size: 0.95rem;
          border: none;
          background: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .user-menu-item:hover {
          background-color: #f5f5f5;
        }

        .user-menu-item.logout {
          color: #e53e3e;
          font-weight: 500;
          border-top: 1px solid #eee;
        }

        .language-options a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        }

        .language-options.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>
    </header>
  );
}
