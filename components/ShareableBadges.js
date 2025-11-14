// components/ShareableBadges.js - Generate viral-ready shareable graphics
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { trackMicroConversion } from '../lib/analytics';

const ShareableBadges = ({ vehicleData, searchParams, reliabilityScore }) => {
  const { t } = useTranslation('common');
  const [badgeUrl, setBadgeUrl] = useState(null);
  const [shareMode, setShareMode] = useState('badge'); // 'badge', 'lemon', 'winner'
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Calculate estimated savings from a good reliability score
  const estimateSavings = (score) => {
    if (score >= 85) return Math.floor(Math.random() * 2000 + 1500); // $1500-3500
    if (score >= 70) return Math.floor(Math.random() * 1000 + 500);  // $500-1500
    return 0;
  };

  const savings = estimateSavings(reliabilityScore);

  // Generate badge graphics using Canvas
  const generateBadge = (type = 'badge') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 630; // Instagram story/Twitter card size

    // Background gradient based on score
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (type === 'winner' || reliabilityScore >= 85) {
      gradient.addColorStop(0, '#1dd1a1'); // Green
      gradient.addColorStop(1, '#10ac84');
    } else if (type === 'lemon' || reliabilityScore < 60) {
      gradient.addColorStop(0, '#ee5a6f'); // Red
      gradient.addColorStop(1, '#ff6348');
    } else {
      gradient.addColorStop(0, '#ffa502'); // Orange
      gradient.addColorStop(1, '#ff8c42');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(i * 120, i * 63, 60, 630);
    }

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('RELIABILITY CHECK', canvas.width / 2, 80);

    // Vehicle info
    ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(
      `${searchParams.year} ${searchParams.make} ${searchParams.model}`,
      canvas.width / 2,
      160
    );

    // Score display (large)
    ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(`${reliabilityScore}/100`, canvas.width / 2, 350);

    // Score label
    let scoreLabel = 'EXCELLENT';
    if (reliabilityScore < 60) scoreLabel = '⚠️ LEMON ALERT';
    else if (reliabilityScore < 70) scoreLabel = 'FAIR';
    else if (reliabilityScore < 85) scoreLabel = 'GOOD';

    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(scoreLabel, canvas.width / 2, 420);

    // Savings (if applicable)
    if (savings > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillText(`💰 Saved $${savings.toLocaleString()}!`, canvas.width / 2, 490);
    }

    // Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText('lemnaed.com • Free AI Check', canvas.width / 2, 570);

    // Convert to data URL
    const url = canvas.toDataURL('image/png');
    setBadgeUrl(url);
    return url;
  };

  useEffect(() => {
    generateBadge(shareMode);
  }, [shareMode, reliabilityScore, searchParams]);

  const downloadImage = () => {
    if (!badgeUrl) return;

    trackMicroConversion('badge_download', 'shareable_badge');

    const link = document.createElement('a');
    link.href = badgeUrl;
    link.download = `${searchParams.year}-${searchParams.make}-${searchParams.model}-reliability-badge.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToSocial = (platform) => {
    trackMicroConversion(`share_${platform}`, 'shareable_badge');

    if (!badgeUrl) return;

    const shareText = reliabilityScore >= 85
      ? `🎯 This ${searchParams.year} ${searchParams.make} ${searchParams.model} scored ${reliabilityScore}/100 on reliability! Saved ~$${savings.toLocaleString()} 💰 Check yours free:`
      : `⚠️ LEMON ALERT: This ${searchParams.year} ${searchParams.make} ${searchParams.model} scored ${reliabilityScore}/100. Dodge it! Check before buying:`;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}?year=${searchParams.year}&make=${searchParams.make}&model=${searchParams.model}`;

    const platforms = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`,
      tiktok: `https://www.tiktok.com/upload?text=${encodeURIComponent(shareText)}`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(url)}`
    };

    if (platforms[platform]) {
      window.open(platforms[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyShareLink = () => {
    trackMicroConversion('share_link_copied', 'shareable_badge');

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}?year=${searchParams.year}&make=${searchParams.make}&model=${searchParams.model}`;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📸 Share Your Reliability Check</h3>
        <p style={styles.subtitle}>Go viral! Share your car score with your network</p>
      </div>

      <div style={styles.modeSelector}>
        <button
          onClick={() => setShareMode('badge')}
          style={{
            ...styles.modeButton,
            ...(shareMode === 'badge' ? styles.modeButtonActive : {})
          }}
        >
          ✅ Trusted
        </button>
        <button
          onClick={() => setShareMode('winner')}
          style={{
            ...styles.modeButton,
            ...(shareMode === 'winner' ? styles.modeButtonActive : {})
          }}
        >
          🏆 Winner
        </button>
        <button
          onClick={() => setShareMode('lemon')}
          style={{
            ...styles.modeButton,
            ...(shareMode === 'lemon' ? styles.modeButtonActive : {})
          }}
        >
          🍋 Lemon Alert
        </button>
      </div>

      <div style={styles.preview}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />
      </div>

      <div style={styles.actions}>
        <button onClick={downloadImage} style={styles.actionButton}>
          ⬇️ Download Image
        </button>
        <button onClick={copyShareLink} style={styles.actionButton}>
          {copied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>
      </div>

      <div style={styles.socialGrid}>
        <button
          onClick={() => shareToSocial('twitter')}
          style={{ ...styles.socialButton, backgroundColor: '#1DA1F2' }}
          title="Share on Twitter/X"
        >
          𝕏
        </button>
        <button
          onClick={() => shareToSocial('facebook')}
          style={{ ...styles.socialButton, backgroundColor: '#1877F2' }}
          title="Share on Facebook"
        >
          f
        </button>
        <button
          onClick={() => shareToSocial('tiktok')}
          style={{ ...styles.socialButton, backgroundColor: '#000000' }}
          title="Share on TikTok"
        >
          ♪♪
        </button>
        <button
          onClick={() => shareToSocial('reddit')}
          style={{ ...styles.socialButton, backgroundColor: '#FF4500' }}
          title="Share on Reddit"
        >
          ⓡ
        </button>
        <button
          onClick={() => shareToSocial('instagram')}
          style={{ ...styles.socialButton, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
          title="Share on Instagram"
        >
          ◼
        </button>
      </div>

      <div style={styles.viralStats}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>6x</div>
          <div style={styles.statLabel}>Average Shares</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>2B+</div>
          <div style={styles.statLabel}>Car Views/Year</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>80%</div>
          <div style={styles.statLabel}>Buyers Stress</div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .social-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginTop: '24px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '0',
  },
  modeSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  modeButton: {
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#0070f3',
    color: '#fff',
    borderColor: '#0070f3',
  },
  preview: {
    textAlign: 'center',
    marginBottom: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '12px',
  },
  canvas: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  actionButton: {
    padding: '12px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  socialButton: {
    padding: '14px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  viralStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #0070f3',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
};

export default ShareableBadges;