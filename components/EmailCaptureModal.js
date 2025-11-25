// components/EmailCaptureModal.js - Lead generation modal for first-time visitors
import { useState, useEffect } from 'react';
import { trackEmailCapture, trackMicroConversion } from '../lib/analytics';

const EmailCaptureModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal or provided email
    const hasSeenModal = localStorage.getItem('email_capture_shown');
    const hasEmail = localStorage.getItem('user_email');
    
    if (!hasSeenModal && !hasEmail) {
      // Show modal after 30 seconds or when user shows exit intent
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('email_capture_shown', 'true');
        trackMicroConversion('modal_shown', 'timed_trigger');
      }, 30000);

      // Exit intent detection
      const handleMouseLeave = (e) => {
        if (e.clientY <= 0 && !hasSeenModal) {
          clearTimeout(timer);
          setIsVisible(true);
          localStorage.setItem('email_capture_shown', 'true');
          trackMicroConversion('modal_shown', 'exit_intent');
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Store email locally
      localStorage.setItem('user_email', email);
      
      // Track the email capture
      trackEmailCapture('exit_intent_modal');
      
      // Here you would typically send to your email service
      // await fetch('/api/email-capture', { method: 'POST', body: JSON.stringify({ email }) });
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      
    } catch (error) {
      console.error('Email capture error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    trackMicroConversion('modal_closed', 'user_action');
  };

  if (!isVisible) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal">
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>
        
        {!isSubmitted ? (
          <>
            <div className="modal-header">
              <h3>🚗 Get Your Complete Car Analysis</h3>
              <p>Get the full reliability PDF report emailed to you instantly!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="email-form">
              <div className="email-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="email-input"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? 'Sending...' : 'Get Free PDF Report'}
                </button>
              </div>
              
              <div className="benefits">
                <div className="benefit">✅ Detailed reliability analysis</div>
                <div className="benefit">✅ Common problems & repair costs</div>
                <div className="benefit">✅ Buying recommendations</div>
                <div className="benefit">✅ 100% Free - No spam ever</div>
              </div>
            </form>
          </>
        ) : (
          <div className="success-message">
            <h3>✅ Success!</h3>
            <p>Check your email for your free car reliability report!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .email-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }

        .email-modal {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .modal-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .email-form {
          margin-bottom: 1rem;
        }

        .email-input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .email-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .email-input:focus {
          border-color: #0070f3;
        }

        .submit-button {
          background: linear-gradient(135deg, #0070f3, #0051a2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          width: 100%;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .benefits {
          display: grid;
          gap: 0.5rem;
        }

        .benefit {
          font-size: 0.9rem;
          color: #555;
          display: flex;
          align-items: center;
        }

        .success-message {
          text-align: center;
          padding: 2rem 0;
        }

        .success-message h3 {
          color: #22c55e;
          margin: 0 0 0.5rem 0;
        }

        .success-message p {
          color: #666;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .email-modal {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .modal-header h3 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailCaptureModal;