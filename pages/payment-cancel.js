// pages/payment-cancel.js - Payment cancelled page with translations
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';

export default function PaymentCancel() {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('payment.cancel.title')}>
      <div className="cancel-container">
        <div className="cancel-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          
          <h1>{t('payment.cancel.title')}</h1>
          
          <p>
            {t('payment.cancel.message')}
          </p>
          
          <div className="action-buttons">
            <Link href="/pricing">
              <a className="button secondary">{t('payment.cancel.viewPlans')}</a>
            </Link>
            <Link href="/search">
              <a className="button primary">{t('payment.cancel.continueSearching')}</a>
            </Link>
          </div>
          
          <div className="help-section">
            <h3>{t('payment.cancel.needHelp')}</h3>
            <p>
              {t('payment.cancel.supportMessage')}
            </p>
            <Link href="mailto:support@carreliability.com">
              <a className="contact-link">{t('payment.cancel.contactSupport')}</a>
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .cancel-container {
          max-width: 600px;
          margin: 3rem auto;
          text-align: center;
        }
        
        .cancel-card {
          padding: 2rem;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        svg {
          color: #888;
          margin-bottom: 1.5rem;
        }
        
        h1 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        p {
          color: #555;
          margin-bottom: 2rem;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .button.primary {
          background-color: #0070f3;
          color: white;
        }
        
        .button.primary:hover {
          background-color: #0060df;
        }
        
        .button.secondary {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .button.secondary:hover {
          background-color: #eaeaea;
        }
        
        .help-section {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eaeaea;
          text-align: center;
        }
        
        .help-section h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
        }
        
        .help-section p {
          margin-bottom: 1rem;
        }
        
        .contact-link {
          color: #0070f3;
          text-decoration: none;
        }
        
        .contact-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
}

// Add getServerSideProps to load translations
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}