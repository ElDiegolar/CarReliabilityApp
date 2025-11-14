// components/LemonHuntChallenge.js - Weekly challenges with leaderboards
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';
import { trackMicroConversion } from '../lib/analytics';
import Link from 'next/link';

const LemonHuntChallenge = ({ vehicleData, searchParams, reliabilityScore }) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetchChallenge();
    fetchLeaderboard();
  }, []);

  const fetchChallenge = async () => {
    try {
      const response = await fetch('/api/challenges/current');
      if (response.ok) {
        const data = await response.json();
        setChallenge(data);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/challenges/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitToChallenge = async () => {
    trackMicroConversion('challenge_submitted', 'lemon_hunt');

    if (!user) {
      alert('Please log in to submit to the challenge');
      return;
    }

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: searchParams.year,
            make: searchParams.make,
            model: searchParams.model,
            mileage: searchParams.mileage,
            score: reliabilityScore
          },
          story: 'Found this potential lemon using Lemnaed!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitted(true);
        setPoints(data.points || 100);
      }
    } catch (error) {
      console.error('Error submitting to challenge:', error);
    }
  };

  const shareChallenge = () => {
    trackMicroConversion('challenge_shared', 'lemon_hunt');
    const text = `🍋 I'm hunting for lemons on Lemnaed! Bet you can't find a worse car deal. #LemonHunt`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return <div style={styles.loading}>Loading challenge...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🍋 Weekly Lemon Hunt Challenge</h3>
        <p style={styles.subtitle}>Find the worst deal, get rewarded!</p>
      </div>

      {challenge && (
        <div style={styles.challengeBox}>
          <div style={styles.challengeContent}>
            <h4 style={styles.challengeTitle}>{challenge.title}</h4>
            <p style={styles.challengeDesc}>{challenge.description}</p>
            <div style={styles.challengeMeta}>
              <span>👥 {challenge.participantCount} Hunters</span>
              <span>🏆 ${challenge.prizeAmount} Prize</span>
              <span>⏰ Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {!submitted ? (
        <div style={styles.actionSection}>
          <button
            onClick={submitToChallenge}
            disabled={!user}
            style={{
              ...styles.submitBtn,
              opacity: user ? 1 : 0.5,
              cursor: user ? 'pointer' : 'not-allowed',
            }}
          >
            {user ? '📤 Submit This Car' : 'Sign in to Submit'}
          </button>
          <button onClick={shareChallenge} style={styles.shareBtn}>
            📢 Share Challenge
          </button>
        </div>
      ) : (
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✅</div>
          <div style={styles.successText}>Submitted!</div>
          <div style={styles.pointsEarned}>+{points} points earned</div>
        </div>
      )}

      <div style={styles.leaderboardSection}>
        <h4 style={styles.leaderboardTitle}>🏆 This Week's Top Hunters</h4>
        <div style={styles.leaderboardList}>
          {leaderboard.slice(0, 5).map((hunter, idx) => (
            <div key={idx} style={styles.leaderboardItem}>
              <div style={styles.rank}>#{idx + 1}</div>
              <div style={styles.hunterInfo}>
                <div style={styles.hunterName}>{hunter.username}</div>
                <div style={styles.hunterCar}>
                  {hunter.lastCar?.year} {hunter.lastCar?.make} {hunter.lastCar?.model}
                </div>
              </div>
              <div style={styles.hunterPoints}>{hunter.points}pts</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.badgeSection}>
        <h4 style={styles.badgeTitle}>🎖️ Earn Badges</h4>
        <div style={styles.badgesGrid}>
          <div style={styles.badge}>
            <div style={styles.badgeIcon}>🍋</div>
            <div style={styles.badgeName}>Lemon Spotter</div>
            <div style={styles.badgeDesc}>Find 5 lemons</div>
          </div>
          <div style={styles.badge}>
            <div style={styles.badgeIcon}>👑</div>
            <div style={styles.badgeName}>Top Hunter</div>
            <div style={styles.badgeDesc}>Win weekly challenge</div>
          </div>
          <div style={styles.badge}>
            <div style={styles.badgeIcon}>🔥</div>
            <div style={styles.badgeName}>On Fire</div>
            <div style={styles.badgeDesc}>5 submissions in a week</div>
          </div>
          <div style={styles.badge}>
            <div style={styles.badgeIcon}>🧠</div>
            <div style={styles.badgeName}>Car Whisperer</div>
            <div style={styles.badgeDesc}>100% accuracy rate</div>
          </div>
        </div>
      </div>

      <div style={styles.rulesBox}>
        <h5 style={styles.rulesTitle}>📋 Challenge Rules</h5>
        <ul style={styles.rulesList}>
          <li>Submit a vehicle score using Lemnaed</li>
          <li>Lowest reliable score wins ($100 Amazon GC)</li>
          <li>Duplicate cars don't count</li>
          <li>Top 100 submissions get 50 bonus points</li>
        </ul>
      </div>

      <Link href="/challenges" style={styles.viewAllLink}>
        View all challenges →
      </Link>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#fce4ec',
    borderRadius: '12px',
    marginTop: '24px',
    border: '2px solid #e91e63',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#c2185b',
  },
  subtitle: {
    fontSize: '14px',
    color: '#d81b60',
    marginBottom: '0',
  },
  challengeBox: {
    backgroundColor: '#fff',
    border: '2px solid #e91e63',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  challengeContent: {},
  challengeTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '8px',
  },
  challengeDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  challengeMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#999',
    flexWrap: 'wrap',
  },
  actionSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  submitBtn: {
    padding: '14px',
    backgroundColor: '#e91e63',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  shareBtn: {
    padding: '14px',
    backgroundColor: '#fff',
    color: '#e91e63',
    border: '2px solid #e91e63',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  successBox: {
    backgroundColor: '#fff',
    border: '2px solid #4caf50',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a202c',
  },
  pointsEarned: {
    fontSize: '18px',
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  leaderboardSection: {
    marginBottom: '20px',
  },
  leaderboardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1a202c',
  },
  leaderboardList: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    gap: '12px',
  },
  rank: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e91e63',
    minWidth: '40px',
  },
  hunterInfo: {
    flex: 1,
  },
  hunterName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a202c',
  },
  hunterCar: {
    fontSize: '12px',
    color: '#999',
  },
  hunterPoints: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#e91e63',
  },
  badgeSection: {
    marginBottom: '20px',
  },
  badgeTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1a202c',
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  badge: {
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  badgeIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  badgeName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a202c',
  },
  badgeDesc: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
  },
  rulesBox: {
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  rulesTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '12px',
  },
  rulesList: {
    margin: '0',
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  },
  viewAllLink: {
    display: 'block',
    textAlign: 'center',
    color: '#e91e63',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '16px',
    fontSize: '14px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
};

export default LemonHuntChallenge;