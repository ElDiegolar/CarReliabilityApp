// components/DeleteAccountModal.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { t } = useTranslation('common');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  // If the modal is not open, don't render
  if (!isOpen) return null;

  const handleChange = (e) => {
    setConfirmation(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if user typed "DELETE" for confirmation
    if (confirmation !== 'DELETE') {
      setError(t('deleteModal.typeDeleteToConfirm'));
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('deleteModal.loginRequired'));
      }
      
      // Send request to delete account
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('deleteModal.deleteFailed'));
      }
      
      // Log out the user
      await logout();
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{t('deleteModal.title')}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="warning-message">
          <p><strong>{t('common.warning')}:</strong> {t('deleteModal.warningPermanent')}</p>
          <p>{t('deleteModal.subscriptionWarning')}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="confirmation">{t('deleteModal.typeDeleteToConfirm')}</label>
            <input
              type="text"
              id="confirmation"
              value={confirmation}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="delete-button" 
              disabled={loading || confirmation !== 'DELETE'}
            >
              {loading ? t('deleteModal.deleting') : t('deleteModal.deleteAccount')}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #e53e3e;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        
        .warning-message {
          background-color: #fff5f5;
          border-left: 4px solid #e53e3e;
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        
        .warning-message p {
          margin: 0.5rem 0;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .error-message {
          color: #e53e3e;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .cancel-button {
          padding: 0.75rem 1rem;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        .delete-button {
          padding: 0.75rem 1rem;
          background-color: #e53e3e;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        .delete-button:disabled {
          background-color: #feb2b2;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}