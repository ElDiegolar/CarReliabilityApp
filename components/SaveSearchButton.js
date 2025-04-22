// components/SaveSearchButton.js
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function SaveSearchButton({ vehicleData, searchParams, timelineData, savedId }) {
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!savedId);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error(t('errors.authRequired'));
      }
      
      const saveData = {
        year: searchParams.year,
        make: searchParams.make,
        model: searchParams.model,
        mileage: searchParams.mileage,
        reliability_data: vehicleData,
        timeline_data: timelineData || [] // Include timeline data if available
      };
      
      // If we have a savedId, update the existing saved vehicle
      const endpoint = savedId 
        ? `/api/saved-vehicles/update?id=${savedId}`
        : '/api/saved-vehicles/save';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('savedVehicles.saveFailed'));
      }
      
      setIsSaved(true);
    } catch (err) {
      setError(err.message);
      console.error('Error saving vehicle:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="save-button-container">
      <button 
        onClick={handleSave}
        className={`save-button ${isSaved ? 'saved' : ''}`}
        disabled={isSaving}
      >
        {isSaving 
          ? t('savedVehicles.saving')
          : isSaved 
            ? t('savedVehicles.saved') 
            : t('savedVehicles.saveVehicle')
        }
      </button>
      
      {error && <div className="save-error">{error}</div>}
      
      <style jsx>{`
        .save-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .save-button {
          background-color: #f5f5f5;
          color: #0070f3;
          padding: 0.75rem 1.5rem;
          border: 1px solid #0070f3;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .save-button:hover {
          background-color: #e5f1ff;
        }
        
        .save-button.saved {
          background-color: #e5f1ff;
          color: #0070f3;
        }
        
        .save-button:disabled {
          background-color: #f5f5f5;
          color: #999;
          border-color: #ddd;
          cursor: not-allowed;
        }
        
        .save-error {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}