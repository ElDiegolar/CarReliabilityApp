// components/Layout.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = ({ children, title }) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="layout">
      <Head>
        <title>{title ? `${title} | Car Reliability` : 'Car Reliability'}</title>
        <meta name="description" content="Get detailed reliability information about vehicles." />
      </Head>

      <header className="header">
        <div className="container">
        <Link href="/" className="logo">
          <span className="logo-icon" aria-hidden="true">
            <img src="/logo.png" alt="Car Reliability Logo" className="logo-img" height={64} width={64}/>
          </span>
          {/* <span className="logo-text">Car Reliability</span> */}
        </Link>
          
          <nav className="nav">
            <Link href="/" className={router.pathname === '/' ? 'active' : ''}>
              {t('nav.home')}
            </Link>
            <Link href="/search" className={router.pathname === '/search' ? 'active' : ''}>
              {t('nav.search')}
            </Link>
            <Link href="/pricing" className={router.pathname === '/pricing' ? 'active' : ''}>
              {t('nav.pricing')}
            </Link>
             
            {isAuthenticated ? (
              <>
                <Link href="/search-history" className={router.pathname === '/search-history' ? 'active' : ''}>
                  {t('nav.history')}
                </Link>
                <Link href="/profile" className={router.pathname === '/profile' ? 'active' : ''}>
                  {t('nav.profile')}
                </Link>
                <button onClick={handleLogout} className="nav-button">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={router.pathname === '/login' ? 'active' : ''}>
                  {t('nav.login')}
                </Link>
              </>
            )}
            
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>{t('footer.copyright')}</p>
          <div className="footer-links">
            <Link href="/privacy">{t('footer.privacy')}</Link>
            <Link href="/terms">{t('footer.terms')}</Link>
            <Link href="/contact">{t('footer.contact')}</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .header {
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
         .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem; /* spacing between icon and text */
          font-size: 1.4rem;
          font-weight: 700;
          color: #111;
          text-decoration: none;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-img {
          width: 240px;
          height:auto;
          object-fit: contain;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.4rem;
        }
        
        .nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .nav a {
          color: #444;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.2s;
        }
        
        .nav a:hover, .nav .active {
          color: #0070f3;
        }
        
        .nav-button {
          background: none;
          border: none;
          color: #444;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
        }
        
        .nav-button:hover {
          color: #0070f3;
        }
        
        .main {
          flex: 1;
          padding: 2rem 0;
        }
        
        .footer {
          background-color: #f5f5f5;
          padding: 2rem 0;
          margin-top: 3rem;
        }
        
        .footer .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .footer p {
          margin: 0;
          color: #666;
        }
        
        .footer-links {
          display: flex;
          gap: 1.5rem;
        }
        
        .footer-links a {
          color: #666;
          text-decoration: none;
        }
        
        .footer-links a:hover {
          color: #0070f3;
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .header .container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
          
          .footer .container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;