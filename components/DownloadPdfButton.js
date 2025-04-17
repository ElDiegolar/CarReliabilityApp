// components/DownloadPdfButton.js
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function DownloadPdfButton({ vehicleData, searchParams }) {
  const { t } = useTranslation('common');
  const { isAuthenticated, getToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Handle download PDF
  const handleDownload = async () => {
    // Require authentication for premium reports
    if (!isAuthenticated && vehicleData.isPremium) {
      // Redirect to login if not authenticated
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Create request body
      const requestBody = {
        ...searchParams,
        reliability_data: vehicleData,
      };

      // Request PDF generation
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // Get blob data from response
      const blob = await response.blob();
      
      // Create URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to download the file
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename based on vehicle info
      const filename = `${searchParams.year}-${searchParams.make}-${searchParams.model}-reliability-report.pdf`;
      a.download = filename;
      
      // Add to document, click to download, then remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="download-pdf-button">
      <button 
        onClick={handleDownload} 
        disabled={isGenerating}
        className="download-button"
      >
        {isGenerating 
          ? t('report.generating') 
          : t('report.downloadPdf')}
        <span className="download-icon">📄</span>
      </button>
      
      {error && <div className="download-error">{error}</div>}
      
      <style jsx>{`
        .download-pdf-button {
          margin: 1rem 0;
        }
        
        .download-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .download-button:hover {
          background-color: #45a049;
        }
        
        .download-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .download-icon {
          margin-left: 0.5rem;
          font-size: 1.1rem;
        }
        
        .download-error {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}