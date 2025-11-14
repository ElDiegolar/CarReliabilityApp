// pages/viral-dashboard.js - View viral growth metrics
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function ViralDashboard() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/viral/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.empty}>
            <h2>Sign in to view your viral metrics</h2>
            <Link href="/login">
              <a style={styles.link}>Go to Login</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Viral Growth Dashboard">
      <SEO
        title="Your Viral Metrics - Lemnaed"
        description="Track your shares, referrals, and viral impact"
        canonical="/viral-dashboard"
      />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Your Viral Growth Dashboard</h1>
          <p style={styles.subtitle}>Track your impact on the car reliability community</p>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading your metrics...</div>
        ) : metrics ? (
          <>
            {/* Main KPIs */}
            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.totalShares}</div>
                <div style={styles.kpiLabel}>Total Shares</div>
                <div style={styles.kpiChange}>+{metrics.sharesThisWeek} this week</div>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.viralCoefficient.toFixed(2)}x</div>
                <div style={styles.kpiLabel}>Viral Coefficient</div>
                <div style={styles.kpiChange}>{metrics.viralCoefficient >= 4 ? '🔥 Excellent' : 'Good'}</div>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.referralConversions}</div>
                <div style={styles.kpiLabel}>Referral Conversions</div>
                <div style={styles.kpiChange}>{metrics.referralConversions > 0 ? '✅ Active' : 'Get started'}</div>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.challengeWins}</div>
                <div style={styles.kpiLabel}>Challenge Wins</div>
                <div style={styles.kpiChange}>Rank: #{metrics.leaderboardRank}</div>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.badges?.length || 0}</div>
                <div style={styles.kpiLabel}>Badges Earned</div>
                <div style={styles.kpiChange}>Keep growing!</div>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{metrics.totalPoints}</div>
                <div style={styles.kpiLabel}>Total Points</div>
                <div style={styles.kpiChange}>Level {metrics.level}</div>
              </div>
            </div>

            {/* Share Breakdown */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📱 Shares by Platform</h2>
              <div style={styles.platformGrid}>
                {[
                  { name: 'TikTok', shares: metrics.sharesByPlatform.tiktok, icon: '♪' },
                  { name: 'Twitter/X', shares: metrics.sharesByPlatform.twitter, icon: '𝕏' },
                  { name: 'Reddit', shares: metrics.sharesByPlatform.reddit, icon: 'ⓡ' },
                  { name: 'Facebook', shares: metrics.sharesByPlatform.facebook, icon: 'f' },
                  { name: 'Instagram', shares: metrics.sharesByPlatform.instagram, icon: '◼' },
                ].map((platform) => (
                  <div key={platform.name} style={styles.platformCard}>
                    <div style={styles.platformIcon}>{platform.icon}</div>
                    <div style={styles.platformName}>{platform.name}</div>
                    <div style={styles.platformShares}>{platform.shares}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            {metrics.badges && metrics.badges.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🎖️ Your Badges</h2>
                <div style={styles.badgesGrid}>
                  {metrics.badges.map((badge) => (
                    <div key={badge.name} style={styles.badgeCard}>
                      <div style={styles.badgeIcon}>{badge.icon}</div>
                      <div style={styles.badgeName}>{badge.name}</div>
                      <div style={styles.badgeEarned}>Earned {badge.earnedDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge Performance */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🏆 Challenge Performance</h2>
              <div style={styles.performanceGrid}>
                <div style={styles.performanceCard}>
                  <div style={styles.perfLabel}>Submissions</div>
                  <div style={styles.perfValue}>{metrics.challengeSubmissions}</div>
                </div>
                <div style={styles.performanceCard}>
                  <div style={styles.perfLabel}>Avg Score</div>
                  <div style={styles.perfValue}>{metrics.averageChallengeScore}/100</div>
                </div>
                <div style={styles.performanceCard}>
                  <div style={styles.perfLabel}>Win Rate</div>
                  <div style={styles.perfValue}>{metrics.challengeWinRate}%</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>⚡ Next Steps</h2>
              <div style={styles.actionsGrid}>
                <Link href="/search">
                  <a style={styles.actionCard}>
                    <div style={styles.actionIcon}>🔍</div>
                    <div style={styles.actionTitle}>Search a Vehicle</div>
                    <div style={styles.actionDesc}>Find and share reliable cars</div>
                  </a>
                </Link>

                <Link href="/challenges">
                  <a style={styles.actionCard}>
                    <div style={styles.actionIcon}>🍋</div>
                    <div style={styles.actionTitle}>Join Challenge</div>
                    <div style={styles.actionDesc}>Hunt for lemons and earn rewards</div>
                  </a>
                </Link>

                <Link href="/profile">
                  <a style={styles.actionCard}>
                    <div style={styles.actionIcon}>👤</div>
                    <div style={styles.actionTitle}>View Profile</div>
                    <div style={styles.actionDesc}>Check your achievements</div>
                  </a>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.empty}>
            <p>Unable to load metrics. Try again later.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '40px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#0070f3',
    marginBottom: '8px',
  },
  kpiLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  kpiChange: {
    fontSize: '13px',
    color: '#999',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
  },
  platformCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  platformIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  platformName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  platformShares: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  badgeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  badgeIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  badgeName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  badgeEarned: {
    fontSize: '12px',
    color: '#999',
  },
  performanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  performanceCard: {
    backgroundColor: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  perfLabel: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '8px',
  },
  perfValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  actionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '24px',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  actionIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a202c',
  },
  actionDesc: {
    fontSize: '13px',
    color: '#666',
  },
  link: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
    revalidate: 3600,
  };
}