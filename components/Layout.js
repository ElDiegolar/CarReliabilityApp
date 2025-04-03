// components/Layout.js - Updated with modern minimal navbar
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthDebugger from './AuthDebugger';

export default function Layout({ children, title = 'Car Reliability Check' }) {
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
          <span className="logo-icon" aria-hidden="true">
            <img src="/logo.png" alt="Car Reliability Logo" className="logo-img" height={64} width={64}/>
          </span>
          {/* <span className="logo-text">Car Reliability</span> */}
        </Link>

          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/search" className="nav-link">Search</Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="nav-link">Profile</Link>
                <Link href="/search-history" className="nav-link">History</Link>
                <button onClick={logout} className="logout-button">Logout</button>
              </>
            ) : (
              <Link href="/login" className="nav-link">Login</Link>
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
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Home</Link>
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Search</Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Profile</Link>
                <Link href="/search-history" onClick={() => setMobileMenuOpen(false)} className="mobile-link">History</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-logout-button">Logout</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Login</Link>
            )}
          </div>
        )}
      </header>

      <main>{children}</main>

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

      {/* {process.env.NODE_ENV === 'development' && <AuthDebugger />} */}

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.75);
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid #eaeaea;
          position: sticky;
          top: 0;
          z-index: 1000;
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
        .nav-links {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }

        .nav-link {
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .nav-link:hover {
          background-color: #f0f0f0;
          color: #0070f3;
        }

        .logout-button {
          background: none;
          border: none;
          color: #e60023;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .logout-button:hover {
          background-color: #ffe8ec;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          flex-direction: column;
          gap: 5px;
        }

        .mobile-menu-button span {
          display: block;
          width: 24px;
          height: 2px;
          background-color: #333;
          border-radius: 2px;
          transition: all 0.3s;
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          background-color: white;
          border-top: 1px solid #eaeaea;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          animation: fadeIn 0.2s ease-in-out;
        }

        .mobile-link {
          padding: 1rem 1.5rem;
          font-weight: 500;
          color: #333;
          border-bottom: 1px solid #f2f2f2;
        }

        .mobile-link:hover {
          background-color: #f9f9f9;
        }

        .mobile-logout-button {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: #e60023;
          font-weight: 500;
          text-align: left;
          border-bottom: 1px solid #f2f2f2;
          cursor: pointer;
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
          padding: 1rem;
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
