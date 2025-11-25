// components/ARFilter.js - AR Filter integration for Snapchat/Instagram
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { getBaseUrl } from '../lib/url-helpers';

const ARFilter = ({ vehicleData, reliabilityScore }) => {
  const { t } = useTranslation('common');
  const [arSupported, setArSupported] = useState(false);
  const [arActive, setArActive] = useState(false);

  useEffect(() => {
    // Check if AR is supported
    const checkARSupport = async () => {
      if ('MediaStream' in window && navigator.mediaDevices) {
        setArSupported(true);
      }
    };

    checkARSupport();
  }, []);

  const generateARShareLink = () => {
    // Generate shareable link for Snapchat/Instagram AR
    const baseUrl = getBaseUrl();
    const filterUrl = `${baseUrl}/api/ar-filter?score=${reliabilityScore}&vehicle=${vehicleData.year}_${vehicleData.make}_${vehicleData.model}`;
    
    const snapchatShare = `https://www.snapchat.com/unlock/?data=${encodeURIComponent(filterUrl)}`;
    const instagramShare = `https://www.instagram.com/?url=${encodeURIComponent(filterUrl)}`;

    return { snapchatShare, instagramShare };
  };

  const { snapchatShare, instagramShare } = generateARShareLink();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🎬 AR Experience</h3>
        <p style={styles.subtitle}>Share your car score in AR</p>
      </div>

      {!arSupported ? (
        <div style={styles.unsupported}>
          <p>Your device doesn't support AR experiences yet. Share via social media instead!</p>
        </div>
      ) : (
        <>
          <div style={styles.arPreview}>
            <div style={styles.previewPlaceholder}>
              {reliabilityScore >= 85 ? '✅' : '⚠️'} 
              <br />
              Score: {reliabilityScore}/100
            </div>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => window.open(snapchatShare, '_blank')}
              style={{
                ...styles.button,
                backgroundColor: '#FFFC00'
              }}
            >
              📱 Share on Snapchat
            </button>
            <button
              onClick={() => window.open(instagramShare, '_blank')}
              style={{
                ...styles.button,
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
              }}
            >
              📸 Share on Instagram
            </button>
          </div>
        </>
      )}

      <div style={styles.info}>
        <h4 style={styles.infoTitle}>How AR Filters Work</h4>
        <ol style={styles.infoList}>
          <li>Share the AR link on Snapchat or Instagram</li>
          <li>Friends can scan the code with their camera</li>
          <li>They see your car's score in beautiful AR</li>
          <li>They can check their own cars immediately</li>
        </ol>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f0f7ff',
    borderRadius: '12px',
    marginTop: '24px',
    border: '2px solid #0070f3',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#0070f3',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '0',
  },
  unsupported: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    color: '#666',
    textAlign: 'center',
  },
  arPreview: {
    marginBottom: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
  },
  previewPlaceholder: {
    fontSize: '64px',
    color: '#0070f3',
    fontWeight: 'bold',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  button: {
    padding: '14px',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  info: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1a202c',
  },
  infoList: {
    margin: '0',
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.8',
  },
};

export default ARFilter;