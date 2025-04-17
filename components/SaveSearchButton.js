// components/SaveSearchButton.js
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function SaveSearchButton({ vehicleData, searchParams, savedId }) {
  const { t } = useTranslation('common');
  const { isAuthenticated, getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!savedId); // If savedId exists, it's already saved
  const [error, setError] = useState('');
  const [currentSavedId, setCurrentSavedId] = useState(savedId);

  // Handle save search
  const handleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = getToken();
      
      const response = await fetch('/api/saved-vehicles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year: searchParams.year,
          make: searchParams.make,
          model: searchParams.model,
          mileage: searchParams.mileage,
          reliability_data: vehicleData,
          // If we already have a saved ID, include it for update
          saved_id: currentSavedId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save search');
      }
      
      const data = await response.json();
      
      // Store the saved vehicle ID
      if (data.id) {
        setCurrentSavedId(data.id);
      }

      setIsSaved(true);
      setTimeout(() => {
        // Don't reset isSaved status if we have a saved ID - it remains saved
        if (!currentSavedId) {
          setIsSaved(false);
        }
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="save-search-button">
      <button 
        onClick={handleSave} 
        disabled={isSaving}
        className={`save-button ${isSaved ? 'saved' : ''}`}
      >
        {isSaving 
          ? t('search.saving') 
          : isSaved 
            ? t('search.saved')
            : t('search.saveSearch')}
        {isSaved && <span className="saved-icon">✓</span>}
      </button>
      
      {error && <div className="save-error">{error}</div>}
      
      <style jsx>{`
        .save-search-button {
          margin: 1rem 0;
        }
        
        .save-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .save-button:hover {
          background-color: #e0e0e0;
        }
        
        .save-button.saved {
          background-color: #d4edda;
          color: #155724;
        }
        
        .save-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .saved-icon {
          margin-left: 0.5rem;
          font-weight: bold;
        }
        
        .save-error {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}