// pages/payment-cancel.js - Payment cancelled page
import Link from 'next/link';
import Layout from '../components/Layout';

export default function PaymentCancel() {
  return (
    <Layout title="Payment Cancelled">
      <div className="cancel-container">
        <div className="cancel-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          
          <h1>Payment Cancelled</h1>
          
          <p>
            Your payment was cancelled and you have not been charged.
            If you have any questions or concerns, please contact our support team.
          </p>
          
          <div className="action-buttons">
            <Link href="/pricing">
              <a className="button secondary">View Plans</a>
            </Link>
            <Link href="/search">
              <a className="button primary">Continue Searching</a>
            </Link>
          </div>
          
          <div className="help-section">
            <h3>Need Help?</h3>
            <p>
              If you encountered any issues during the payment process, our support
              team is available to assist you.
            </p>
            <Link href="mailto:support@carreliability.com">
              <a className="contact-link">Contact Support</a>
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