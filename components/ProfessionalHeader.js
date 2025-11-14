// components/ProfessionalHeader.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function ProfessionalHeader() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setActiveDropdown(null);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const changeLanguage = (code) => {
    router.push(router.asPath, router.asPath, { locale: code });
    setActiveDropdown(null);
  };

  const currentLanguage = languages.find(l => l.code === router.locale);

  return (
    <header className={`professional-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-icon">🚗</span>
          <div className="logo-text">
            <span className="logo-name">Lemnaed</span>
            <span className="logo-tagline">Reliable Vehicle Data</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link href="/search" className="nav-link">
            Search
          </Link>
          <Link href="/challenges" className="nav-link">
            Challenges
          </Link>
          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>
          <Link href="/blog" className="nav-link">
            Blog
          </Link>
        </nav>

        {/* Right Section */}
        <div className="header-actions">
          {/* Language Selector */}
          <div className="language-selector">
            <button
              className="dropdown-trigger"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === 'language' ? null : 'language'
                )
              }
              aria-label="Select language"
            >
              <span>{currentLanguage?.flag}</span>
              <span className="dropdown-label">{currentLanguage?.code.toUpperCase()}</span>
              <span className="dropdown-icon">▼</span>
            </button>
            {activeDropdown === 'language' && (
              <div className="dropdown-menu language-options">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`dropdown-item ${
                      router.locale === lang.code ? 'active' : ''
                    }`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Section */}
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/pricing" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="user-menu-wrapper">
              <button
                className="user-button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'user' ? null : 'user')
                }
              >
                <span className="user-avatar">{user?.email?.[0]?.toUpperCase()}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              {activeDropdown === 'user' && (
                <div className="dropdown-menu user-options">
                  <div className="dropdown-header">
                    <span className="user-email">{user?.email}</span>
                  </div>
                  <Link href="/profile" className="dropdown-item">
                    Profile Settings
                  </Link>
                  <Link href="/saved-vehicles" className="dropdown-item">
                    Saved Vehicles
                  </Link>
                  <Link href="/viral-dashboard" className="dropdown-item">
                    Viral Dashboard
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .professional-header {
          background: white;
          border-bottom: 1px solid var(--gray-200);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all var(--transition-base);
        }

        .professional-header.scrolled {
          box-shadow: var(--shadow-md);
          border-bottom-color: var(--gray-300);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: var(--spacing-4) var(--spacing-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-8);
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          text-decoration: none;
          color: var(--gray-900);
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .logo-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary-700);
          letter-spacing: -0.02em;
        }

        .logo-tagline {
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
        }

        /* Navigation Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-6);
          flex: 1;
        }

        .nav-link {
          padding: var(--spacing-2) var(--spacing-3);
          color: var(--gray-700);
          font-weight: 500;
          font-size: 0.95rem;
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .nav-link:hover {
          color: var(--primary-600);
          background-color: var(--primary-50);
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          flex-shrink: 0;
        }

        /* Dropdowns */
        .language-selector,
        .user-menu-wrapper {
          position: relative;
        }

        .dropdown-trigger,
        .user-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-3);
          background: var(--gray-100);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--gray-700);
        }

        .dropdown-trigger:hover,
        .user-button:hover {
          background: var(--gray-200);
          border-color: var(--gray-400);
        }

        .dropdown-trigger:focus,
        .user-button:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .dropdown-label {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .dropdown-icon {
          font-size: 0.7rem;
          transition: transform var(--transition-base);
        }

        .dropdown-trigger.open .dropdown-icon,
        .user-button.open .dropdown-icon {
          transform: rotate(180deg);
        }

        /* User Avatar */
        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* Dropdown Menus */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          min-width: 200px;
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          margin-top: var(--spacing-2);
          z-index: 1000;
          animation: slideInUp var(--transition-base);
        }

        .dropdown-header {
          padding: var(--spacing-3) var(--spacing-4);
          border-bottom: 1px solid var(--gray-200);
          font-size: 0.85rem;
        }

        .user-email {
          color: var(--gray-600);
          font-weight: 500;
          word-break: break-all;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          width: 100%;
          padding: var(--spacing-3) var(--spacing-4);
          border: none;
          background: none;
          color: var(--gray-700);
          text-align: left;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: var(--gray-100);
          color: var(--primary-600);
        }

        .dropdown-item.active {
          background: var(--primary-50);
          color: var(--primary-700);
          font-weight: 600;
        }

        .dropdown-item.danger:hover {
          background: var(--danger-50);
          color: var(--danger-600);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--gray-200);
          margin: var(--spacing-2) 0;
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          gap: var(--spacing-3);
          align-items: center;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
        }

        .mobile-menu-toggle span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--gray-900);
          border-radius: 1px;
          transition: all var(--transition-base);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-container {
            padding: var(--spacing-3) var(--spacing-4);
            gap: var(--spacing-4);
          }

          .logo {
            gap: var(--spacing-2);
          }

          .logo-icon {
            font-size: 1.5rem;
          }

          .logo-name {
            font-size: 1rem;
          }

          .logo-tagline {
            display: none;
          }

          .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            gap: 0;
            background: white;
            border-bottom: 1px solid var(--gray-200);
            padding: var(--spacing-4) 0;
            box-shadow: var(--shadow-md);
          }

          .nav-menu.open {
            display: flex;
          }

          .nav-link {
            padding: var(--spacing-3) var(--spacing-6);
            width: 100%;
            border-radius: 0;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .auth-buttons {
            display: none;
          }

          .language-selector {
            display: none;
          }

          .dropdown-menu {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
            border: 1px solid var(--gray-300);
            min-width: auto;
            max-height: 50vh;
            overflow-y: auto;
            animation: slideInUp var(--transition-slow);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}