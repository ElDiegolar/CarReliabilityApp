// pages/vehicle-comparison.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function VehicleComparison() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchVehiclesForComparison = async () => {
      if (!router.isReady) return;
      
      const { ids } = router.query;
      if (!ids) {
        setError('No vehicles selected for comparison');
        setLoading(false);
        return;
      }
      
      const vehicleIds = ids.split(',');
      
      try {
        const token = getToken();
        
        if (!token) {
          throw new Error(t('comparison.authRequired'));
        }
        
        const response = await fetch('/api/saved-vehicles/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ vehicleIds })
        });
        
        if (!response.ok) {
          throw new Error(t('comparison.fetchFailed'));
        }
        
        const data = await response.json();
        setVehicles(data.vehicles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehiclesForComparison();
  }, [router.isReady, router.query, getToken, t]);
  
  return (
    <ProtectedRoute>
      <Layout title={t('comparison.title', 'Vehicle Comparison')}>
        <div className="comparison-container">
          <h1>{t('comparison.title', 'Vehicle Comparison')}</h1>
          
          <Link href="/saved-vehicles" className="back-link">
            ← {t('comparison.backToSaved', 'Back to Saved Vehicles')}
          </Link>
          
          {loading ? (
            <div className="loading">{t('comparison.loading', 'Loading comparison data...')}</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <p>{t('comparison.noVehicles', 'No vehicles found for comparison')}</p>
              <Link href="/saved-vehicles" className="button primary">
                {t('comparison.selectVehicles', 'Select Vehicles')}
              </Link>
            </div>
          ) : (
            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>{t('comparison.criteria', 'Criteria')}</th>
                    {vehicles.map(vehicle => (
                      <th key={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Basic Info */}
                  <tr className="section-header">
                    <td colSpan={vehicles.length + 1}>{t('comparison.basicInfo', 'Basic Information')}</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.mileage', 'Mileage')}</td>
                    {vehicles.map(vehicle => (
                      <td key={vehicle.id}>
                        {vehicle.mileage ? vehicle.mileage.toLocaleString() : '0'} {t('comparison.miles', 'miles')}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Reliability Scores */}
                  <tr className="section-header">
                    <td colSpan={vehicles.length + 1}>{t('comparison.reliabilityScores', 'Reliability Scores')}</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.overallScore', 'Overall Score')}</td>
                    {vehicles.map(vehicle => (
                      <td key={vehicle.id} className="score-cell">
                        <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.overallScore)}`}>
                          {vehicle.reliability_data?.overallScore || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  
                  {/* Engine Score */}
                  <tr>
                    <td>{t('comparison.engine', 'Engine')}</td>
                    {vehicles.map(vehicle => (
                      <td key={vehicle.id} className="score-cell">
                        <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.engine)}`}>
                          {vehicle.reliability_data?.categories?.engine || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  
                  {/* Transmission Score */}
                  <tr>
                    <td>{t('comparison.transmission', 'Transmission')}</td>
                    {vehicles.map(vehicle => (
                      <td key={vehicle.id} className="score-cell">
                        <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.transmission)}`}>
                          {vehicle.reliability_data?.categories?.transmission || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  
                  {/* Only show these if at least one vehicle has premium data */}
                  {vehicles.some(v => v.reliability_data?.isPremium) && (
                    <>
                      <tr>
                        <td>{t('comparison.electrical', 'Electrical System')}</td>
                        {vehicles.map(vehicle => (
                          <td key={vehicle.id} className="score-cell">
                            {vehicle.reliability_data?.isPremium ? (
                              <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.electricalSystem)}`}>
                                {vehicle.reliability_data?.categories?.electricalSystem || 'N/A'}
                              </span>
                            ) : (
                              <span className="premium-locked">Premium only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>{t('comparison.brakes', 'Brakes')}</td>
                        {vehicles.map(vehicle => (
                          <td key={vehicle.id} className="score-cell">
                            {vehicle.reliability_data?.isPremium ? (
                              <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.brakes)}`}>
                                {vehicle.reliability_data?.categories?.brakes || 'N/A'}
                              </span>
                            ) : (
                              <span className="premium-locked">Premium only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>{t('comparison.suspension', 'Suspension')}</td>
                        {vehicles.map(vehicle => (
                          <td key={vehicle.id} className="score-cell">
                            {vehicle.reliability_data?.isPremium ? (
                              <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.suspension)}`}>
                                {vehicle.reliability_data?.categories?.suspension || 'N/A'}
                              </span>
                            ) : (
                              <span className="premium-locked">Premium only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>{t('comparison.fuelSystem', 'Fuel System')}</td>
                        {vehicles.map(vehicle => (
                          <td key={vehicle.id} className="score-cell">
                            {vehicle.reliability_data?.isPremium ? (
                              <span className={`score-badge ${getScoreClass(vehicle.reliability_data?.categories?.fuelSystem)}`}>
                                {vehicle.reliability_data?.categories?.fuelSystem || 'N/A'}
                              </span>
                            ) : (
                              <span className="premium-locked">Premium only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                  
                  {/* Common Issues Section */}
                  {vehicles.some(v => v.reliability_data?.isPremium && v.reliability_data?.commonIssues?.length > 0) && (
                    <>
                      <tr className="section-header">
                        <td colSpan={vehicles.length + 1}>{t('comparison.commonIssues', 'Common Issues')}</td>
                      </tr>
                      <tr>
                        <td>{t('comparison.reportedIssues', 'Reported Issues')}</td>
                        {vehicles.map(vehicle => (
                          <td key={vehicle.id}>
                            {vehicle.reliability_data?.isPremium && vehicle.reliability_data?.commonIssues?.length > 0 ? (
                              <ul className="issues-list">
                                {vehicle.reliability_data.commonIssues.slice(0, 2).map((issue, idx) => (
                                  <li key={idx}>{issue.description}</li>
                                ))}
                                {vehicle.reliability_data.commonIssues.length > 2 && (
                                  <li className="more-issues">
                                    +{vehicle.reliability_data.commonIssues.length - 2} more issues
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <span className="premium-locked">Premium only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                  
                {/* Actions section */}
                <tr className="section-header">
                    <td colSpan={vehicles.length + 1}>{t('comparison.actions', 'Actions')}</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.viewDetails', 'View Details')}</td>
                    {vehicles.map(vehicle => (
                      <td key={vehicle.id}>
                        <Link 
                          href={`/search?year=${vehicle.year}&make=${vehicle.make}&model=${vehicle.model}&mileage=${vehicle.mileage || 0}&fromSaved=true&savedId=${vehicle.id}`}
                          className="action-link"
                        >
                          {t('comparison.viewReport', 'View Full Report')}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add a PDF export button for premium users */}
          {vehicles.length > 0 && vehicles.some(v => v.reliability_data?.isPremium) && (
            <div className="export-section">
              <button className="export-button" onClick={() => alert('PDF Export would be implemented here')}>
                {t('comparison.exportPdf', 'Export Comparison as PDF')}
              </button>
              <p className="premium-note">{t('comparison.premiumFeature', 'Premium feature')}</p>
            </div>
          )}
        </div>
        
        <style jsx>{`
          .comparison-container {
            max-width: 1000px;
            margin: 0 auto;
          }
          
          h1 {
            margin-bottom: 1rem;
          }
          
          .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            color: #0070f3;
            text-decoration: none;
          }
          
          .back-link:hover {
            text-decoration: underline;
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
          
          .comparison-table-container {
            overflow-x: auto;
            margin-bottom: 2rem;
          }
          
          .comparison-table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }
          
          .comparison-table th,
          .comparison-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eaeaea;
          }
          
          .comparison-table th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          
          .comparison-table th:first-child,
          .comparison-table td:first-child {
            background-color: #f9f9f9;
            font-weight: 500;
            white-space: nowrap;
            position: sticky;
            left: 0;
            border-right: 1px solid #eaeaea;
          }
          
          .section-header td {
            background-color: #e5f1ff;
            color: #0070f3;
            font-weight: 600;
            padding: 0.5rem 1rem;
          }
          
          .score-cell {
            text-align: center;
          }
          
          .score-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: bold;
            color: white;
          }
          
          .score-high {
            background-color: #38a169;
          }
          
          .score-medium {
            background-color: #dd6b20;
          }
          
          .score-low {
            background-color: #e53e3e;
          }
          
          .premium-locked {
            color: #718096;
            font-style: italic;
            font-size: 0.9rem;
          }
          
          .issues-list {
            padding-left: 1.2rem;
            margin: 0;
          }
          
          .issues-list li {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          
          .more-issues {
            color: #718096;
            font-style: italic;
          }
          
          .action-link {
            display: inline-block;
            padding: 0.5rem 0.75rem;
            background-color: #f5f5f5;
            color: #0070f3;
            border-radius: 4px;
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .action-link:hover {
            background-color: #e5f1ff;
          }
          
          .export-section {
            margin-top: 2rem;
            text-align: center;
          }
          
          .export-button {
            padding: 0.75rem 1.5rem;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .export-button:hover {
            background-color: #0060df;
          }
          
          .premium-note {
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #718096;
          }
          
          @media (max-width: 768px) {
            .comparison-container {
              padding: 0 1rem;
            }
            
            .comparison-table th,
            .comparison-table td {
              padding: 0.75rem 0.5rem;
              font-size: 0.9rem;
            }
            
            .back-link {
              margin-bottom: 1.5rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}

// Helper function to determine score class
function getScoreClass(score) {
  if (!score) return '';
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
}

// Server-side props
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
    return {
      props: {},
    };
  }
}