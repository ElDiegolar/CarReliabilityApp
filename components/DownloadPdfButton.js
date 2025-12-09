import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function DownloadPdfButton({ 
  // Vehicle props
  vehicleData, 
  searchParams, 
  // Product props
  category,
  productData,
  reliabilityData,
  specifications,
  // Common props
  timelineData,
  // Type identifier
  reportType = 'vehicle' // 'vehicle' or 'product'
}) {
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      if (reportType === 'vehicle') {
        // Vehicle PDF generation
        let timelineDataToUse = timelineData;

        if ((!timelineDataToUse || timelineDataToUse.length === 0) && vehicleData.isPremium) {
          try {
            const token = getToken();

            const response = await fetch(`/api/car-timeline`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                year: searchParams.year,
                make: searchParams.make,
                model: searchParams.model,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              timelineDataToUse = data.timeline || [];
            }
          } catch (err) {
            console.error('Error fetching timeline data for PDF:', err);
          }
        }

        const requestData = {
          year: searchParams.year,
          make: searchParams.make,
          model: searchParams.model,
          mileage: searchParams.mileage,
          reliability_data: vehicleData,
          timeline_data: timelineDataToUse,
        };

        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${searchParams.year}-${searchParams.make}-${searchParams.model}-reliability-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Product PDF generation
        const requestData = {
          category,
          productData,
          reliability_data: reliabilityData,
          specifications_data: specifications,
          timeline_data: timelineData,
        };

        const response = await fetch('/api/generate-product-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `${productData?.brand || 'product'}-${productData?.model || 'report'}-reliability.pdf`;
        a.download = fileName.replace(/[^a-z0-9.-]/gi, '-');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleDownload} className="button download" disabled={loading}>
        {loading ? t('buttons.generating') : t('buttons.downloadPdf')}
      </button>

      <style jsx>{`
        .button {
          flex: 1 1 200px;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-align: center;
          border: none;
        }

        .button.download {
          background-color: #2e7d32;
          color: white;
        }

        .button.download:hover {
          background-color: #1b5e20;
        }

        .button.download:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
