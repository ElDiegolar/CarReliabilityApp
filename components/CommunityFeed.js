// components/CommunityFeed.js - User-generated content and trending challenges
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../contexts/AuthContext';
import { trackMicroConversion } from '../lib/analytics';

const CommunityFeed = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('trending'); // 'trending', 'recent', 'my-network'
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchCommunityPosts();
  }, [filter]);

  const fetchCommunityPosts = async () => {
    try {
      const response = await fetch(`/api/community/posts?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = (postId) => {
    trackMicroConversion('post_liked', 'community_feed');
    setLikedPosts(new Set([...likedPosts, postId]));
  };

  const sharePost = (post) => {
    trackMicroConversion('post_shared', 'community_feed');
    const text = `Check out this ${post.vehicle.year} ${post.vehicle.make} ${post.vehicle.model} - Score: ${post.score}/100\n\n"${post.caption}"\n\nFind similar deals on lemnaed.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const commentOnPost = (postId) => {
    trackMicroConversion('post_commented', 'community_feed');
    console.log('Comment on post:', postId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🌐 Community Feed</h3>
        <p style={styles.subtitle}>See what other car hunters are finding</p>
      </div>

      <div style={styles.filterTabs}>
        {['trending', 'recent', 'my-network'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              ...styles.filterTab,
              ...(filter === tab ? styles.filterTabActive : {})
            }}
          >
            {tab === 'trending' && '🔥 Trending'}
            {tab === 'recent' && '⏰ Recent'}
            {tab === 'my-network' && '👥 My Network'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading community posts...</div>
      ) : posts.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🦗</div>
          <div style={styles.emptyText}>No posts yet. Be the first to share!</div>
        </div>
      ) : (
        <div style={styles.postsList}>
          {posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <div style={styles.postHeader}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>{post.user.avatar || '👤'}</div>
                  <div>
                    <div style={styles.username}>{post.user.username}</div>
                    <div style={styles.timestamp}>{post.timeAgo}</div>
                  </div>
                </div>
                <div style={styles.score}>
                  <div style={{ ...styles.scoreValue, color: post.score >= 80 ? '#4caf50' : post.score >= 60 ? '#ff9800' : '#f44336' }}>
                    {post.score}/100
                  </div>
                </div>
              </div>

              <div style={styles.postContent}>
                <div style={styles.vehicleTitle}>
                  {post.vehicle.year} {post.vehicle.make} {post.vehicle.model}
                </div>
                <div style={styles.caption}>{post.caption}</div>

                {post.image && (
                  <img src={post.image} alt="car" style={styles.postImage} />
                )}

                <div style={styles.tags}>
                  {post.tags?.map((tag) => (
                    <span key={tag} style={styles.tag}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div style={styles.postStats}>
                <span>❤️ {post.likes} Likes</span>
                <span>💬 {post.comments} Comments</span>
                <span>🔄 {post.shares} Shares</span>
              </div>

              <div style={styles.postActions}>
                <button
                  onClick={() => likePost(post.id)}
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: likedPosts.has(post.id) ? '#f44336' : '#fff'
                  }}
                >
                  {likedPosts.has(post.id) ? '❤️' : '🤍'} Like
                </button>
                <button
                  onClick={() => commentOnPost(post.id)}
                  style={styles.actionBtn}
                >
                  💬 Comment
                </button>
                <button
                  onClick={() => sharePost(post)}
                  style={styles.actionBtn}
                >
                  🔄 Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .filter-tabs {
            flex-direction: column;
          }
          .post-stats {
            flex-wrap: wrap;
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
  filterTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterTab: {
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  filterTabActive: {
    backgroundColor: '#0070f3',
    color: '#fff',
    borderColor: '#0070f3',
  },
  loading: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#666',
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    color: '#999',
    fontSize: '16px',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  post: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  avatar: {
    fontSize: '32px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '50%',
  },
  username: {
    fontWeight: '600',
    color: '#1a202c',
    fontSize: '14px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
  },
  score: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  postContent: {
    marginBottom: '16px',
  },
  vehicleTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '8px',
  },
  caption: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  postImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#0070f3',
    fontWeight: '500',
  },
  postStats: {
    display: 'flex',
    gap: '20px',
    padding: '12px 0',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
  },
  postActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
};

export default CommunityFeed;