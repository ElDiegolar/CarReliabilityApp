// pages/saved-vehicles.js with integrated comparison selector
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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

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
      
      // If deleted vehicle was selected for comparison, remove it
      if (selectedVehicles.includes(id)) {
        setSelectedVehicles(selectedVehicles.filter(vehicleId => vehicleId !== id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const toggleVehicleSelection = (vehicleId) => {
    if (!comparisonMode) return;
    
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      // Limit to 3 selections
      if (selectedVehicles.length < 3) {
        setSelectedVehicles([...selectedVehicles, vehicleId]);
      } else {
        // If already at limit, show alert or notification
        alert(t('comparison.maxThreeVehicles', 'You can compare up to 3 vehicles at a time'));
      }
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    // Clear selections when exiting comparison mode
    if (comparisonMode) {
      setSelectedVehicles([]);
    }
  };

  const handleCompare = () => {
    if (selectedVehicles.length === 0) {
      alert(t('comparison.selectAtLeastOne', 'Please select at least one vehicle to compare'));
      return;
    }
    
    router.push({
      pathname: '/vehicle-comparison',
      query: { ids: selectedVehicles.join(',') }
    });
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
            <>
              <div className="action-bar">
                <button 
                  className={`toggle-button ${comparisonMode ? 'active' : ''}`}
                  onClick={toggleComparisonMode}
                >
                  {comparisonMode ? 
                    t('savedVehicles.exitComparisonMode', 'Exit Comparison Mode') : 
                    t('savedVehicles.compareVehicles', 'Compare Vehicles')}
                </button>
                
                {comparisonMode && (
                  <div className="comparison-status">
                    <span className="selected-count">
                      {selectedVehicles.length}/3 {t('comparison.vehiclesSelected', 'vehicles selected')}
                    </span>
                    <button 
                      className="compare-button"
                      disabled={selectedVehicles.length === 0}
                      onClick={handleCompare}
                    >
                      {t('comparison.compareSelected', 'Compare Selected')}
                    </button>
                  </div>
                )}
              </div>
            
              <div className={`vehicles-list ${comparisonMode ? 'comparison-mode' : ''}`}>
                <div className="vehicle-header">
                  {comparisonMode && (
                    <div className="select-col">
                      {t('comparison.select', 'Select')}
                    </div>
                  )}
                  <div className="vehicle-col">{t('savedVehicles.vehicle')}</div>
                  <div className="mileage-col">{t('savedVehicles.mileage')}</div>
                  <div className="saved-col">{t('savedVehicles.saved')}</div>
                  <div className="score-col">{t('savedVehicles.score')}</div>
                  <div className="actions-col">{t('savedVehicles.actions')}</div>
                </div>
                
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    className={`vehicle-item ${comparisonMode && selectedVehicles.includes(vehicle.id) ? 'selected' : ''}`}
                    onClick={() => comparisonMode && toggleVehicleSelection(vehicle.id)}
                  >
                    {comparisonMode && (
                      <div className="select-col">
                        <input 
                          type="checkbox" 
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={() => {}} // Handled by the div onClick
                          onClick={(e) => e.stopPropagation()} // Prevent double toggle
                          aria-label={`Select ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        />
                      </div>
                    )}
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
                        onClick={(e) => comparisonMode && e.preventDefault()} // Prevent navigation in comparison mode
                      >
                        {t('savedVehicles.view')}
                      </Link>
                      <button 
                        className="action-button delete"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row selection
                          handleDelete(vehicle.id);
                        }}
                        disabled={deleteId === vehicle.id}
                      >
                        {deleteId === vehicle.id ? t('savedVehicles.deleting') : t('savedVehicles.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {comparisonMode && selectedVehicles.length > 0 && (
                <div className="comparison-footer">
                  <button className="compare-now-button" onClick={handleCompare}>
                    {t('comparison.compareNow', 'Compare Now')} ({selectedVehicles.length})
                  </button>
                </div>
              )}
            </>
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
          
          .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }
          
          .toggle-button {
            padding: 0.7rem 1.2rem;
            background-color: #f5f5f5;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          
          .toggle-button::before {
            content: "\\2B";  /* Unicode plus symbol */
            margin-right: 0.5rem;
            font-size: 1.2rem;
            line-height: 1;
          }
          
          .toggle-button.active {
            background-color: #0070f3;
            color: white;
            border-color: #0070f3;
          }
          
          .toggle-button.active::before {
            content: "\\2212";  /* Unicode minus symbol */
          }
          
          .toggle-button:hover {
            background-color: ${comparisonMode ? '#0060df' : '#e5e5e5'};
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, ${comparisonMode ? '0.1' : '0.05'});
          }
          
          .comparison-status {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .selected-count {
            background-color: #edf2f7;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #4a5568;
          }
          
          .compare-button {
            padding: 0.5rem 1rem;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .compare-button:hover {
            background-color: #0060df;
          }
          
          .compare-button:disabled {
            background-color: #cbd5e0;
            cursor: not-allowed;
          }
          
          .vehicles-list {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            margin-bottom: 1.5rem;
          }
          
          .vehicles-list.comparison-mode .vehicle-item {
            cursor: pointer;
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
            transition: all 0.2s;
          }
          
          .vehicle-item:last-child {
            border-bottom: none;
          }
          
          .vehicle-item:hover {
            background-color: #f9fafb;
          }
          
          .vehicle-item.selected {
            background-color: #e5f1ff;
            border-left: 3px solid #0070f3;
          }
          
          .select-col {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            flex-shrink: 0;
          }
          
          .select-col input {
            width: 18px;
            height: 18px;
            cursor: pointer;
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
          
          .comparison-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #fff;
            padding: 1rem;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 10;
            display: flex;
            justify-content: center;
          }
          
          .compare-now-button {
            padding: 0.75rem 2rem;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0, 112, 243, 0.2);
          }
          
          .compare-now-button:hover {
            background-color: #0060df;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 112, 243, 0.3);
          }
          
          @media (max-width: 768px) {
            .vehicle-header {
              display: none;
            }
            
            .vehicle-item {
              flex-direction: column;
              padding: 1rem;
            }
            
            .vehicle-item.selected {
              border-left: none;
              border-top: 3px solid #0070f3;
            }
            
            .select-col {
              width: 100%;
              justify-content: flex-start;
              margin-bottom: 0.5rem;
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
            
            .action-bar {
              flex-direction: column;
              align-items: stretch;
            }
            
            .comparison-status {
              flex-direction: column;
              align-items: stretch;
              gap: 0.5rem;
            }
            
            .selected-count {
              text-align: center;
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