// pages/payment-success.js - Payment success page
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Verify payment and create subscription when session_id is available
    if (session_id) {
      const verifyPayment = async () => {
        try {
          const token = getToken();
          
          if (!token) {
            throw new Error('Authentication required');
          }
          
          console.log('Verifying payment with session ID:', session_id);
          
          const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              sessionId: session_id,
              plan: 'premium' // Default to premium plan
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Payment verification failed';
            let errorData = {};
            
            try {
              // Try to parse as JSON
              errorData = JSON.parse(errorText);
              console.error('Payment verification failed:', errorData);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // If not JSON, just log the text
              console.error('Payment verification failed with non-JSON response:', errorText);
            }
            
            throw new Error(errorMessage);
          }
          
          const data = await response.json();
          console.log('Payment verification response:', data);
          setSubscription(data);
        } catch (err) {
          console.error('Error in payment verification:', err);
          setError(err.message || 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [session_id, getToken]);

  return (
    <Layout title="Payment Successful">
      <div className="success-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h1>Payment Verification Failed</h1>
            <p>{error}</p>
            <p>Please contact our support team for assistance.</p>
            <div className="action-buttons">
              <Link href="/profile">
                <a className="button secondary">Go to Profile</a>
              </Link>
              <Link href="/search">
                <a className="button primary">Start Searching</a>
              </Link>
            </div>
          </div>
        ) : (
          <div className="success-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h1>Payment Successful!</h1>
            <p>Thank you for your subscription. You now have premium access to all features.</p>
            
            {subscription && subscription.accessToken && (
              <div className="subscription-details">
                <p className="subscription-info">
                  Your premium access token: <span className="access-token">{subscription.accessToken}</span>
                </p>
                <p className="token-tip">
                  You can use this token to access premium features from other devices.
                </p>
              </div>
            )}
            
            <div className="action-buttons">
              <Link href="/profile">
                <a className="button secondary">View Profile</a>
              </Link>
              <Link href="/search">
                <a className="button primary">Start Searching</a>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .success-container {
          max-width: 600px;
          margin: 3rem auto;
          text-align: center;
        }
        
        .loading-state, .success-state, .error-state {
          padding: 2rem;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .loading-spinner {
          margin: 0 auto 1.5rem;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0070f3;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .success-state svg, .error-state svg {
          color: #0070f3;
          margin-bottom: 1.5rem;
        }
        
        .error-state svg {
          color: #e53e3e;
        }
        
        h1 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        .subscription-details {
          margin: 2rem 0;
          padding: 1rem;
          background-color: #f5f9ff;
          border-radius: 4px;
          text-align: left;
        }
        
        .subscription-info {
          margin-top: 0;
        }
        
        .access-token {
          display: block;
          padding: 0.75rem;
          background-color: #e5f6ff;
          border-radius: 4px;
          font-family: monospace;
          margin-top: 0.5rem;
          word-break: break-all;
        }
        
        .token-tip {
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 0;
        }
        
        .action-buttons {
          margin-top: 2rem;
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
      `}</style>
    </Layout>
  );
}