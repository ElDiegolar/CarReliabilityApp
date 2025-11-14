// pages/challenges.js - Weekly challenges and competitions page
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function Challenges() {
  const { t } = useTranslation('common');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/list');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Challenges & Competitions">
      <SEO
        title="Car Reliability Challenges - Win Rewards"
        description="Join weekly Lemon Hunt challenges, share your finds, and earn rewards"
        canonical="/challenges"
      />

      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>🏆 Weekly Car Challenges</h1>
          <p style={styles.subtitle}>Hunt for lemons, earn badges, and win prizes!</p>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyText}>No active challenges right now. Check back soon!</div>
          </div>
        ) : (
          <div style={styles.challengesGrid}>
            {challenges.map((challenge) => (
              <div key={challenge.id} style={styles.challengeCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{challenge.title}</h3>
                  <div style={styles.cardStatus}>
                    {challenge.status === 'active' ? '🟢 Active' : '⏳ Upcoming'}
                  </div>
                </div>

                <p style={styles.cardDesc}>{challenge.description}</p>

                <div style={styles.cardStats}>
                  <div style={styles.stat}>
                    <div style={styles.statValue}>{challenge.participantCount}</div>
                    <div style={styles.statLabel}>Hunters</div>
                  </div>
                  <div style={styles.stat}>
                    <div style={styles.statValue}>${challenge.prizeAmount}</div>
                    <div style={styles.statLabel}>Prize Pool</div>
                  </div>
                  <div style={styles.stat}>
                    <div style={styles.statValue}>{challenge.daysRemaining}d</div>
                    <div style={styles.statLabel}>Remaining</div>
                  </div>
                </div>

                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${(challenge.participantCount / 1000) * 100}%`
                    }}
                  />
                </div>

                <div style={styles.rewardBadges}>
                  {challenge.rewards?.map((reward, idx) => (
                    <div key={idx} style={styles.badge}>
                      {reward.emoji} {reward.name}
                    </div>
                  ))}
                </div>

                <Link href={`/challenges/${challenge.id}`}>
                  <a style={styles.viewBtn}>View Challenge →</a>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div style={styles.howItWorks}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.stepsGrid}>
            <div style={styles.step}>
              <div style={styles.stepNum}>1</div>
              <div style={styles.stepTitle}>Search a Car</div>
              <div style={styles.stepDesc}>Use Lemnaed to check any vehicle's reliability</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>2</div>
              <div style={styles.stepTitle}>Submit to Challenge</div>
              <div style={styles.stepDesc}>Lower scores = more points!</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>3</div>
              <div style={styles.stepTitle}>Earn Rewards</div>
              <div style={styles.stepDesc}>Win badges, points, and cash prizes</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>4</div>
              <div style={styles.stepTitle}>Share & Compete</div>
              <div style={styles.stepDesc}>Challenge your network and climb the leaderboard</div>
            </div>
          </div>
        </div>

        <div style={styles.badgesSection}>
          <h2 style={styles.sectionTitle}>🎖️ Earn These Badges</h2>
          <div style={styles.badgesGrid}>
            {[
              { emoji: '🍋', name: 'Lemon Spotter', desc: 'Find 5 lemons' },
              { emoji: '👑', name: 'Top Hunter', desc: 'Win weekly challenge' },
              { emoji: '🔥', name: 'On Fire', desc: '5 submissions/week' },
              { emoji: '🧠', name: 'Car Whisperer', desc: '100% accuracy' },
              { emoji: '🎯', name: 'Sharpshooter', desc: '10 wins total' },
              { emoji: '💎', name: 'Elite Hunter', desc: 'Reach 5000 points' },
            ].map((badge, idx) => (
              <div key={idx} style={styles.badgeItem}>
                <div style={styles.badgeEmoji}>{badge.emoji}</div>
                <div style={styles.badgeName}>{badge.name}</div>
                <div style={styles.badgeReq}>{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .challenges-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .badges-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '40px 20px',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: '#fff',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '20px',
    opacity: 0.9,
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  },
  emptyText: {
    fontSize: '18px',
  },
  challengesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  challengeCard: {
    backgroundColor: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0',
  },
  cardStatus: {
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  cardStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  stat: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.3s',
  },
  rewardBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  badge: {
    fontSize: '12px',
    backgroundColor: '#f0f0f0',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  viewBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  howItWorks: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    textAlign: 'center',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  step: {
    textAlign: 'center',
  },
  stepNum: {
    width: '60px',
    height: '60px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  stepDesc: {
    fontSize: '14px',
    color: '#666',
  },
  badgesSection: {
    marginBottom: '40px',
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  badgeItem: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  badgeEmoji: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  badgeName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  badgeReq: {
    fontSize: '13px',
    color: '#666',
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