// components/ShareReportButton.js
import { useState } from 'react';

export default function ShareReportButton({ 
  // Vehicle props
  year, 
  make, 
  model, 
  mileage, 
  // Product props
  category,
  productData,
  // Common props
  reliabilityData, 
  specifications, 
  timeline,
  // Type identifier
  reportType = 'vehicle' // 'vehicle' or 'product'
}) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const createShareLink = async () => {
    setLoading(true);
    try {
      const requestBody = reportType === 'vehicle' 
        ? {
            type: 'vehicle',
            year,
            make,
            model,
            mileage,
            reliability_data: reliabilityData,
            specifications,
            timeline
          }
        : {
            type: 'product',
            category,
            product_data: productData,
            reliability_data: reliabilityData,
            specifications,
            timeline
          };

      const response = await fetch('/api/reports/create-share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Failed to create share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const text = reportType === 'vehicle'
      ? `Check out this ${year} ${make} ${model} reliability report!`
      : `Check out this ${productData?.brand || ''} ${productData?.model || 'product'} reliability report!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedText}&body=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <>
      <button
        onClick={createShareLink}
        disabled={loading}
        className="share-report-btn"
      >
        {loading ? '⏳ Creating Link...' : '🔗 Share Report'}
      </button>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Report</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </div>

            <div className="share-modal-content">
              <p className="share-description">
                {reportType === 'vehicle' 
                  ? `Share this ${year} ${make} ${model} reliability report with others!`
                  : `Share this ${productData?.brand || ''} ${productData?.model || 'product'} reliability report with others!`
                }
              </p>

              <div className="share-link-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button onClick={copyToClipboard} className="copy-btn">
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>

              <div className="social-share-buttons">
                <button onClick={() => shareToSocial('twitter')} className="social-btn twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
                <button onClick={() => shareToSocial('facebook')} className="social-btn facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button onClick={() => shareToSocial('linkedin')} className="social-btn linkedin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>
                <button onClick={() => shareToSocial('whatsapp')} className="social-btn whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
                <button onClick={() => shareToSocial('email')} className="social-btn email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email
                </button>
              </div>

              <p className="share-note">
                <small>Link expires in 30 days</small>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .share-report-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-report-btn:hover {
          background: #005fc2;
          transform: translateY(-1px);
        }

        .share-report-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .share-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .share-modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #999;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #333;
        }

        .share-modal-content {
          padding: 1.5rem;
        }

        .share-description {
          margin: 0 0 1.5rem 0;
          color: #666;
          font-size: 1rem;
        }

        .share-link-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .share-link-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #333;
          background: #f9f9f9;
        }

        .copy-btn {
          padding: 0.75rem 1.25rem;
          background: #f0f0f0;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background: #e0e0e0;
        }

        .social-share-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .social-btn.twitter {
          background: #000;
        }

        .social-btn.twitter:hover {
          background: #333;
        }

        .social-btn.facebook {
          background: #1877f2;
        }

        .social-btn.facebook:hover {
          background: #145dbf;
        }

        .social-btn.linkedin {
          background: #0a66c2;
        }

        .social-btn.linkedin:hover {
          background: #084d93;
        }

        .social-btn.whatsapp {
          background: #25d366;
        }

        .social-btn.whatsapp:hover {
          background: #1da851;
        }

        .social-btn.email {
          background: #666;
        }

        .social-btn.email:hover {
          background: #444;
        }

        .share-note {
          text-align: center;
          margin: 1rem 0 0 0;
          color: #999;
        }

        @media (max-width: 768px) {
          .social-share-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
