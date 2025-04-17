// pages/saved-vehicles.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function SavedVehicles() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState({ plan: 'free', limit: 5 });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchSavedVehicles = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          throw new Error(t('savedVehicles.authRequired'));
        }
        
        const response = await fetch('/api/saved-vehicles/get', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(t('savedVehicles.authRequired'));
          }
          throw new Error(t('savedVehicles.loadFailed'));
        }
        
        const data = await response.json();
        setVehicles(data.savedVehicles);
        setSubscription(data.subscription);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedVehicles();
  }, [getToken, t]);

  const handleDelete = async (id) => {
    try {
      setDeleteId(id);
      const token = getToken();
      
      const response = await fetch(`/api/saved-vehicles/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete saved vehicle');
      }
      
      // Remove the deleted vehicle from the state
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      
      return new Date(dateString).toLocaleDateString(router.locale, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return t('savedVehicles.invalidDate');
    }
  };

  return (
    <ProtectedRoute>
      <Layout title={t('savedVehicles.title')}>
        <div className="saved-vehicles-container">
          <h1>{t('savedVehicles.title')}</h1>
          
          {subscription && subscription.limit && (
            <div className="subscription-note">
              <p>{t('savedVehicles.limitedPlan', { limit: subscription.limit })}</p>
              <Link href="/pricing" className="upgrade-link">
                {t('savedVehicles.upgradeForMore')}
              </Link>
            </div>
          )}
          
          {loading ? (
            <div className="loading">{t('savedVehicles.loading')}</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <p>{t('savedVehicles.noVehicles')}</p>
              <Link href="/search" className="button primary">
                {t('savedVehicles.searchNow')}
              </Link>
            </div>
          ) : (
            <div className="vehicles-list">
              <div className="vehicle-header">
                <div className="vehicle-col">{t('savedVehicles.vehicle')}</div>
                <div className="mileage-col">{t('savedVehicles.mileage')}</div>
                <div className="saved-col">{t('savedVehicles.saved')}</div>
                <div className="score-col">{t('savedVehicles.score')}</div>
                <div className="actions-col">{t('savedVehicles.actions')}</div>
              </div>
              
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-item">
                  <div className="vehicle-col">
                    <span className="year">{vehicle.year}</span>
                    <span className="make">{vehicle.make}</span>
                    <span className="model">{vehicle.model}</span>
                  </div>
                  <div className="mileage-col">
                    {vehicle.mileage ? vehicle.mileage.toLocaleString() : '0'} {t('savedVehicles.miles')}
                  </div>
                  <div className="saved-col">
                    {formatDate(vehicle.saved_at)}
                  </div>
                  <div className="score-col">
                    <div className="score-badge">
                      {vehicle.reliability_data?.overallScore || 'N/A'}
                    </div>
                  </div>
                  <div className="actions-col">
                    <Link 
                      href={`/search?year=${vehicle.year}&make=${vehicle.make}&model=${vehicle.model}&mileage=${vehicle.mileage || 0}&fromSaved=true&savedId=${vehicle.id}`}
                      className="action-button view"
                    >
                      {t('savedVehicles.view')}
                    </Link>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={deleteId === vehicle.id}
                    >
                      {deleteId === vehicle.id ? t('savedVehicles.deleting') : t('savedVehicles.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <style jsx>{`
          .saved-vehicles-container {
            max-width: 900px;
            margin: 0 auto;
          }
          
          h1 {
            margin-bottom: 2rem;
          }
          
          .subscription-note {
            background-color: #f0f7ff;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
          }
          
          .subscription-note p {
            margin: 0;
            color: #0070f3;
          }
          
          .upgrade-link {
            color: #0070f3;
            text-decoration: underline;
            font-weight: 500;
          }
          
          .loading, .error, .empty-state {
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 1rem;
          }
          
          .loading {
            background-color: #f5f5f5;
          }
          
          .error {
            background-color: #fff5f5;
            color: #e53e3e;
          }
          
          .empty-state {
            background-color: #f5f5f5;
            padding: 3rem;
          }
          
          .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 1rem;
            transition: all 0.2s;
          }
          
          .button.primary {
            background-color: #0070f3;
            color: white;
          }
          
          .button.primary:hover {
            background-color: #0060df;
          }
          
          .vehicles-list {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          .vehicle-header {
            display: flex;
            padding: 1rem;
            background-color: #f5f5f5;
            font-weight: bold;
            border-bottom: 1px solid #eaeaea;
          }
          
          .vehicle-item {
            display: flex;
            padding: 1rem;
            border-bottom: 1px solid #eaeaea;
            transition: background-color 0.2s;
          }
          
          .vehicle-item:last-child {
            border-bottom: none;
          }
          
          .vehicle-item:hover {
            background-color: #f9fafb;
          }
          
          .vehicle-col {
            flex: 2;
            display: flex;
            flex-direction: column;
          }
          
          .mileage-col {
            flex: 1;
            display: flex;
            align-items: center;
          }
          
          .saved-col {
            flex: 1.5;
            display: flex;
            align-items: center;
          }
          
          .score-col {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .actions-col {
            flex: 1.5;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.5rem;
          }
          
          .year {
            font-weight: bold;
          }
          
          .make {
            margin-top: 0.25rem;
          }
          
          .model {
            margin-top: 0.25rem;
            color: #666;
          }
          
          .score-badge {
            background-color: #0070f3;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
          }
          
          .action-button {
            display: inline-block;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: background-color 0.2s;
            cursor: pointer;
            border: none;
          }
          
          .action-button.view {
            background-color: #f5f5f5;
            color: #0070f3;
            text-decoration: none;
          }
          
          .action-button.view:hover {
            background-color: #e5f1ff;
          }
          
          .action-button.delete {
            background-color: #fff5f5;
            color: #e53e3e;
          }
          
          .action-button.delete:hover {
            background-color: #fee2e2;
          }
          
          .action-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          @media (max-width: 768px) {
            .vehicle-header {
              display: none;
            }
            
            .vehicle-item {
              flex-direction: column;
              padding: 1rem;
            }
            
            .vehicle-col, .mileage-col, .saved-col, .score-col, .actions-col {
              width: 100%;
              padding: 0.5rem 0;
            }
            
            .score-col {
              justify-content: flex-start;
            }
            
            .actions-col {
              justify-content: flex-start;
              margin-top: 0.5rem;
            }
            
            .subscription-note {
              flex-direction: column;
              text-align: center;
            }
            
            .subscription-note p {
              margin-bottom: 1rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}

// This function gets called at build time on server-side
export async function getServerSideProps({ locale }) {
  try {
    const translations = await serverSideTranslations(locale || 'en', ['common']);
    return {
      props: {
        ...translations,
      },
    };
  } catch (error) {
    console.error('Error loading translations:', error);
    // Return minimal props to prevent page failure
    return {
      props: {},
    };
  }
}