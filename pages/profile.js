// pages/profile.js - User profile page with upgrade functionality and translations
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add these console logs to debug
  console.log('Current locale:', router.locale);
  console.log('i18n initialized:', i18n.isInitialized);
  console.log('i18n language:', i18n.language);
  console.log('Translation test "profile.title":', t('profile.title'));
  console.log('Raw translation test:', i18n.t('profile.title'));
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const token = getToken();
        
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load profile data');
        }
        
        const data = await response.json();
        
        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, getToken]);

  // Handler for upgrading to premium
  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <ProtectedRoute>
      <Layout title={t('profile.title')}>
        <div className="profile-container">
          <h1>{t('profile.title')}</h1>
          
          {loading ? (
            <div className="loading">{t('profile.loading')}</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="profile-content">
              <div className="profile-section">
                <h2>{t('profile.accountInfo')}</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>{t('profile.email')}</label>
                    <div>{user?.email}</div>
                  </div>
                  <div className="info-item">
                    <label>{t('profile.memberSince')}</label>
                    <div>{user?.created_at ? new Date(user.created_at).toLocaleDateString(router.locale) : 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>{t('profile.subscription')}</h2>
                {subscription ? (
                  <div className="subscription-details">
                    <div className="subscription-badge">
                      {subscription.plan.toUpperCase()} MEMBER
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{t('profile.plan')}</label>
                        <div>{subscription.plan}</div>
                      </div>
                      <div className="info-item">
                        <label>{t('profile.status')}</label>
                        <div className={`status ${subscription.status}`}>
                          {subscription.status}
                        </div>
                      </div>
                      <div className="info-item">
                        <label>{t('profile.renewalDate')}</label>
                        <div>
                          {subscription.expires_at
                            ? new Date(subscription.expires_at).toLocaleDateString(router.locale)
                            : t('profile.noExpiration')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="subscription-actions">
                      <button className="button secondary">{t('profile.manageSubscription')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="subscription-prompt">
                    <p>{t('profile.noSubscription')}</p>
                    <p>{t('profile.upgradePrompt')}</p>
                    <button 
                      className="button primary"
                      onClick={handleUpgrade}
                    >
                      {t('profile.upgradePremium')}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="profile-section">
                <h2>{t('profile.accountSettings')}</h2>
                <div className="settings-buttons">
                  <button className="button secondary">{t('profile.changePassword')}</button>
                  <button className="button danger">{t('profile.deleteAccount')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <style jsx>{`
          .profile-container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1 {
            margin-bottom: 2rem;
          }
          
          .loading, .error {
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
          }
          
          .loading {
            background-color: #f5f5f5;
          }
          
          .error {
            background-color: #fff5f5;
            color: #e53e3e;
          }
          
          .profile-section {
            background-color: #fff;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
          }
          
          .profile-section h2 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #eaeaea;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .info-item {
            margin-bottom: 1rem;
          }
          
          .info-item label {
            display: block;
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.25rem;
          }
          
          .subscription-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: #0070f3;
            color: white;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 1.5rem;
          }
          
          .status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            text-transform: capitalize;
          }
          
          .status.active {
            background-color: #e6fffa;
            color: #0d9488;
          }
          
          .status.inactive {
            background-color: #fff5f5;
            color: #e53e3e;
          }
          
          .subscription-prompt {
            text-align: center;
            padding: 1.5rem;
            background-color: #f9fafb;
            border-radius: 4px;
          }
          
          .subscription-actions, .settings-buttons {
            margin-top: 1.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }
          
          .button {
            padding: 0.75rem 1rem;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }
          
          .button.primary {
            background-color: #0070f3;
            color: white;
          }
          
          .button.primary:hover {
            background-color: #0060df;
          }
          
          .button.secondary {
            background-color: #f5f5f5;
            color: #333;
          }
          
          .button.secondary:hover {
            background-color: #eaeaea;
          }
          
          .button.danger {
            background-color: #fff5f5;
            color: #e53e3e;
          }
          
          .button.danger:hover {
            background-color: #fee2e2;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}

// This function gets called at build time on server-side
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}