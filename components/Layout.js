// components/Layout.js - Updated with authentication
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthDebugger from './AuthDebugger'; // Import the debugger

export default function Layout({ children, title = 'Car Reliability App' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Car Reliability Information Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav className="desktop-nav">
          <Link href="/" className="logo">
            Car Reliability
          </Link>
          
          <div className="nav-links">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/search" className="nav-link">
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="nav-link">
                  Profile
                </Link>
                <Link href="/search-history" className="nav-link">
                  History
                </Link>
                <button onClick={logout} className="logout-button">Logout</button>
              </>
            ) : (
              <Link href="/login" className="nav-link">
                Login
              </Link>
            )}
          </div>
          
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
        
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Home
            </Link>
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                  Profile
                </Link>
                <Link href="/search-history" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                  History
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="mobile-logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      <main>
        {children}
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Car Reliability</h3>
            <p>Get detailed reliability information about vehicles to make informed decisions.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/search" className="footer-link">Search</Link></li>
              <li><Link href="/login" className="footer-link">Login</Link></li>
              {isAuthenticated && (
                <li><Link href="/profile" className="footer-link">Profile</Link></li>
              )}
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: support@carreliability.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Car Reliability. All rights reserved.</p>
        </div>
      </footer>

      {/* Add the auth debugger in development mode */}
      {process.env.NODE_ENV === 'development' && <AuthDebugger />}

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          padding: 1rem;
          background-color: #f5f5f5;
          border-bottom: 1px solid #eaeaea;
        }

        .desktop-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          padding: 0.5rem;
        }

        .nav-link:hover {
          color: #0070f3;
        }
        
        .logout-button {
          cursor: pointer;
          color: #e53e3e;
          background: none;
          border: none;
          padding: 0.5rem;
          font-size: inherit;
          font-family: inherit;
        }
        
        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          flex-direction: column;
          gap: 5px;
        }
        
        .mobile-menu-button span {
          display: block;
          width: 25px;
          height: 3px;
          background-color: #333;
        }
        
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 1rem 0;
        }
        
        .mobile-link {
          padding: 0.75rem 1rem;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #eaeaea;
        }
        
        .mobile-link:hover {
          background-color: #f9f9f9;
        }
        
        .mobile-logout-button {
          cursor: pointer;
          color: #e53e3e;
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          font-size: inherit;
          font-family: inherit;
          text-align: left;
          border-bottom: 1px solid #eaeaea;
        }

        main {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        footer {
          background-color: #f5f5f5;
          border-top: 1px solid #eaeaea;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .footer-section {
          flex: 1;
          min-width: 250px;
          margin-bottom: 1.5rem;
        }
        
        .footer-section h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .footer-section li {
          margin-bottom: 0.5rem;
        }
        
        .footer-link {
          color: #333;
          text-decoration: none;
        }
        
        .footer-link:hover {
          color: #0070f3;
        }
        
        .footer-bottom {
          text-align: center;
          padding: 1rem;
          border-top: 1px solid #eaeaea;
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .mobile-menu-button {
            display: flex;
          }
          
          .mobile-menu {
            display: flex;
          }
          
          .footer-content {
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}