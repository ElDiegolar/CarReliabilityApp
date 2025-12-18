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
    console.log('DownloadPdfButton clicked, reportType:', reportType);
    setLoading(true);

    try {
      if (reportType === 'vehicle') {
        console.log('Starting vehicle PDF generation...');
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
          specifications_data: specificationsData,
        };

        console.log('Sending vehicle PDF request:', { ...requestData, reliability_data: '...', timeline_data: '...', specifications_data: '...' });
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        console.log('Vehicle PDF fetch response status:', response.status, response.ok);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Vehicle PDF failed with response:', errorText);
          throw new Error('Failed to generate PDF');
        }

        console.log('Creating blob from vehicle PDF response...');
        const blob = await response.blob();
        console.log('Blob created, size:', blob.size, 'type:', blob.type);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${searchParams.year}-${searchParams.make}-${searchParams.model}-reliability-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.log('Starting product PDF generation...');
        // Product PDF generation
        const requestData = {
          category,
          productData,
          reliability_data: reliabilityData,
          specifications_data: specifications,
          timeline_data: timelineData,
        };

        console.log('Sending product PDF request:', { category, hasProductData: !!productData, hasReliabilityData: !!reliabilityData });
        const response = await fetch('/api/generate-product-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        console.log('Product PDF fetch response status:', response.status, response.ok);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Product PDF generation failed:', response.status, errorData);
          throw new Error(errorData.error || errorData.details || 'Failed to generate PDF');
        }

        console.log('Creating blob from product PDF response...');
        const blob = await response.blob();
        console.log('Blob created, size:', blob.size, 'type:', blob.type);
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
      alert(`Failed to download PDF: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
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
