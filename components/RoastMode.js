// components/RoastMode.js - AI-generated humorous car critiques
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { trackMicroConversion } from '../lib/analytics';
import { buildVehicleUrl, getSocialShareUrls, copyToClipboard } from '../lib/url-helpers';

const RoastMode = ({ vehicleData, searchParams, reliabilityScore }) => {
  const { t } = useTranslation('common');
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roastGenerated, setRoastGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRoast = async () => {
    setLoading(true);
    trackMicroConversion('roast_generated', 'roast_mode');

    try {
      const response = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: searchParams.year,
          make: searchParams.make,
          model: searchParams.model,
          score: reliabilityScore,
          issues: vehicleData.common_issues || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRoast(data.roast);
        setRoastGenerated(true);
      }
    } catch (error) {
      console.error('Error generating roast:', error);
      setRoast('This car needs a comedic intervention! 🍋');
      setRoastGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const shareRoast = (platform) => {
    trackMicroConversion(`roast_shared_${platform}`, 'roast_mode');

    if (!roast) return;

    const shareText = `🚗 ${searchParams.year} ${searchParams.make} ${searchParams.model} Roast:\n\n"${roast}"\n\n💯 Check your car's real score on lemnaed.com`;
    const url = buildVehicleUrl(searchParams);
    const socialUrls = getSocialShareUrls(shareText, url);

    if (socialUrls[platform]) {
      window.open(socialUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyRoast = async () => {
    trackMicroConversion('roast_copied', 'roast_mode');
    const success = await copyToClipboard(roast || '');
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regenerateRoast = () => {
    setRoastGenerated(false);
    setRoast(null);
    generateRoast();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🎤 Roast This Car</h3>
        <p style={styles.subtitle}>Get AI-powered humorous takes on this vehicle's flaws</p>
      </div>

      {!roastGenerated ? (
        <button
          onClick={generateRoast}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Roasting...' : '🔥 Generate Roast'}
        </button>
      ) : (
        <>
          <div style={styles.roastBox}>
            <div style={styles.roastContent}>
              "{roast}"
            </div>
            <div style={styles.roastMeta}>
              Score: {reliabilityScore}/100 • AI Generated Humor
            </div>
          </div>

          <div style={styles.actionGrid}>
            <button onClick={copyRoast} style={styles.actionBtn}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <button onClick={() => shareRoast('twitter')} style={styles.actionBtn}>
              𝕏 Tweet
            </button>
            <button onClick={() => shareRoast('reddit')} style={styles.actionBtn}>
              ⓡ Reddit
            </button>
            <button onClick={() => shareRoast('tiktok')} style={styles.actionBtn}>
              ♪ TikTok
            </button>
            <button onClick={regenerateRoast} style={styles.actionBtn}>
              🔄 Regenerate
            </button>
          </div>

          <div style={styles.disclaimer}>
            💡 For entertainment purposes. Always check actual reliability reports before purchasing.
          </div>
        </>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#fff3e0',
    borderRadius: '12px',
    marginTop: '24px',
    border: '2px dashed #ff9800',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#e65100',
  },
  subtitle: {
    fontSize: '14px',
    color: '#d84315',
    marginBottom: '0',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ff6f00',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  roastBox: {
    backgroundColor: '#fff',
    border: '2px solid #ff9800',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  roastContent: {
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#1a202c',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  roastMeta: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'right',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  actionBtn: {
    padding: '10px',
    backgroundColor: '#fff',
    border: '2px solid #ff9800',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ff6f00',
    transition: 'all 0.2s',
  },
  disclaimer: {
    fontSize: '13px',
    color: '#d84315',
    backgroundColor: '#ffe0b2',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
  },
};

export default RoastMode;