// components/DownloadPdfButton.js
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

export default function DownloadPdfButton({ vehicleData, searchParams, timelineData }) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: searchParams.year,
          make: searchParams.make,
          model: searchParams.model,
          mileage: searchParams.mileage,
          reliability_data: vehicleData,
          timeline_data: timelineData // Include timeline data in the request
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${searchParams.year}-${searchParams.make}-${searchParams.model}-reliability-report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      className="download-button"
      disabled={loading}
    >
      {loading ? t('buttons.generating') : t('buttons.downloadPdf')}
      
      <style jsx>{`
        .download-button {
          background-color: #2e7d32;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .download-button:hover {
          background-color: #1b5e20;
        }
        
        .download-button:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}