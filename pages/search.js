// pages/search.js - Modified to include specifications section
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import SaveSearchButton from '../components/SaveSearchButton';
import DownloadPdfButton from '../components/DownloadPdfButton';
import CarTimeline from '../components/CarTimeline';

export default function Search() {
  const { t } = useTranslation('common');
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { year: queryYear, make: queryMake, model: queryModel, mileage: queryMileage, fromSaved, savedId } = router.query;

  const apiRequestInProgress = useRef(false);
  const hasAutoSubmitted = useRef(false);

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [carImageUrl, setCarImageUrl] = useState(null);
  const [specifications, setSpecifications] = useState(null);

  // Function to convert miles to kilometers
  const milesToKilometers = (miles) => {
    return Math.round(miles * 1.60934);
  };

  
  const fetchCarImage = async (year, make, model) => {
    try {
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: `${year} ${make} ${model}` })
      });

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        setCarImageUrl(data.images[0].imageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch car image:', error);
    }
  };

  // Load vehicle data from URL parameters or saved vehicle
  useEffect(() => {
    const loadSavedVehicle = async () => {
      if (!savedId || !user || apiRequestInProgress.current) return;
      apiRequestInProgress.current = true;

      try {
        const token = getToken();
        const response = await fetch(`/api/saved-vehicles/get-one?id=${savedId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const vehicle = data.savedVehicle;
          
          if (vehicle?.reliability_data) {
            console.log('Loaded saved vehicle:', vehicle);
            
            // Apply premium status if user is premium
            if (isPremium) vehicle.reliability_data.isPremium = true;
            setResults(vehicle.reliability_data);
            
            // Handle specifications data from saved vehicle
            if (vehicle.specifications_data) {
              console.log('Loaded specifications data from saved vehicle');
              setSpecifications(vehicle.specifications_data);
            }
            
            // Handle timeline data from saved vehicle
            if (vehicle.timeline_data && Array.isArray(vehicle.timeline_data) && vehicle.timeline_data.length > 0) {
              console.log(`Loaded ${vehicle.timeline_data.length} timeline items from saved vehicle`);
              setTimelineData(vehicle.timeline_data);
            }
      // Set car image URL if provided in the response inside handle submit
      fetchCarImage(vehicle.year, vehicle.make, vehicle.model);

            setShowSearchForm(false);
            return;
          }
        } else {
          console.error('Error loading saved vehicle:', await response.text());
        }
      } catch (err) {
        console.error('Error loading saved vehicle:', err);
      } finally {
        apiRequestInProgress.current = false;
      }

      // If saved vehicle loading fails, attempt auto-submission with query params
      if (queryYear && queryMake && queryModel && queryMileage && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        handleSubmit(null, true);
      }
    };

    // Set form data from URL parameters
    if (queryYear || queryMake || queryModel || queryMileage) {
      setFormData({
        year: queryYear || '',
        make: queryMake || '',
        model: queryModel || '',
        mileage: queryMileage || ''
      });
    }

    // Handle loading logic based on URL parameters
    if (fromSaved === 'true' && savedId) {
      loadSavedVehicle();
    } else if (queryYear && queryMake && queryModel && queryMileage && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleSubmit(null, true);
    }
  }, [queryYear, queryMake, queryModel, queryMileage, fromSaved, savedId, user, getToken, isPremium]);

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      try {
        const token = getToken();
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        console.log('User subscription data:', data.subscription);
        setSubscription(data.subscription);
        setIsPremium(!!data.subscription);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };
    
    checkSubscription();
  }, [user, getToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetSearch = () => {
    setResults(null);
    setTimelineData([]);
    setCarImageUrl(null);
    setSpecifications(null);
    setShowSearchForm(true);
    router.replace('/search', undefined, { shallow: true });
    setFormData({ year: '', make: '', model: '', mileage: '' });
    hasAutoSubmitted.current = false;
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    if (apiRequestInProgress.current) return;

    apiRequestInProgress.current = true;
    setLoading(true);
    setError('');

    if (!isAutoSubmit) {
      setResults(null);
      setTimelineData([]);
      setCarImageUrl(null);
      setSpecifications(null);
    }

    try {
      const body = {
        ...formData,
        locale: router.locale,
        ...(user && { userId: user.id }),
        ...(subscription?.access_token && { premiumToken: subscription.access_token })
      };

      console.log('Sending reliability data request:', body);
      
      const res = await fetch('/api/car-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API error response:', errorData);
        throw new Error('Failed to fetch reliability data');
      }

      const data = await res.json();
      console.log('Received reliability data:', data);
      
      // Check for specifications data in the response
      if (data.specifications) {
        console.log('Received specifications data from API');
        setSpecifications(data.specifications);
      }
      
      // Check for timeline data in the response
      if (data.timeline && Array.isArray(data.timeline)) {
        console.log(`Received ${data.timeline.length} timeline items from API`);
        setTimelineData(data.timeline);
        
        // Remove timeline from data before setting results to maintain backward compatibility
        const { timeline, ...reliabilityData } = data;
        setResults(reliabilityData);
      } else {
        setResults(data);
      }
      
      // Apply premium flag if user is premium
      if (isPremium && results) {
        setResults(prev => ({ ...prev, isPremium: true }));
      }
      
      setShowSearchForm(false);

    // Set car image URL if provided in the response inside handle submit
    fetchCarImage(formData.year, formData.make, formData.model);


      // Update URL if not auto-submitted
      if (!isAutoSubmit) {
        router.push({
          pathname: router.pathname,
          query: {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            mileage: formData.mileage
          }
        }, undefined, { shallow: true });
      }
    } catch (err) {
      console.error('Error fetching reliability data:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      apiRequestInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <Layout title={t('search.title')}>
      <h1>{t('search.title')}</h1>

      {isPremium && (
        <div className="premium-badge">{t('search.premiumUser')}</div>
      )}

      {!showSearchForm && (
        <button onClick={() => setShowSearchForm(true)} className="reopen-button">
          {t('search.showForm') || 'Modify Search'}
        </button>
      )}

      {showSearchForm && (
        <form onSubmit={handleSubmit} className="search-form">
          {['year', 'make', 'model', 'mileage'].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>{t(`search.${field}`) || field}</label>
              <input
                type={field === 'mileage' || field === 'year' ? 'number' : 'text'}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                placeholder={t(`search.${field}Placeholder`) || `Enter ${field}`}
              />
              {field === 'mileage' && formData.mileage && (
                <div className="unit-converter">
                  {milesToKilometers(formData.mileage).toLocaleString()} km
                </div>
              )}
            </div>
          ))}

          <div className="form-actions">
            {results && (
              <button type="button" onClick={resetSearch} className="reset-button">
                {t('search.reset') || 'Reset'}
              </button>
            )}
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <span className="spinner" /> : t('search.searchButton') || 'Search'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      {/* Specifications section with image and details */}
      {carImageUrl && specifications && results && (
        <div className="specifications-section">
          <h2>{t('search.specifications') || 'Vehicle Specifications'}</h2>
          <div className="specifications-container">
            <div className="image-container">
              <img src={carImageUrl} alt={`${formData.year} ${formData.make} ${formData.model}`} />
            </div>
            <div className="specs-table-container">
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th colSpan="2" className="specs-header">{t('search.engineSpecs') || 'Engine'}</th>
                  </tr>
                  <tr>
                    <td>{t('search.engineType') || 'Type'}</td>
                    <td>{specifications.engine.type}</td>
                  </tr>
                  <tr>
                    <td>{t('search.displacement') || 'Displacement'}</td>
                    <td>{specifications.engine.displacement}</td>
                  </tr>
                  <tr>
                    <td>{t('search.horsepower') || 'Horsepower'}</td>
                    <td>{specifications.engine.horsepower}</td>
                  </tr>
                  <tr>
                    <td>{t('search.torque') || 'Torque'}</td>
                    <td>{specifications.engine.torque}</td>
                  </tr>
                  <tr>
                    <th colSpan="2" className="specs-header">{t('search.drivetrainSpecs') || 'Drivetrain'}</th>
                  </tr>
                  <tr>
                    <td>{t('search.transmission') || 'Transmission'}</td>
                    <td>{specifications.transmission}</td>
                  </tr>
                  <tr>
                    <td>{t('search.drivetrain') || 'Drive Type'}</td>
                    <td>{specifications.drivetrain}</td>
                  </tr>
                  <tr>
                    <th colSpan="2" className="specs-header">{t('search.dimensions') || 'Dimensions'}</th>
                  </tr>
                  <tr>
                    <td>{t('search.length') || 'Length'}</td>
                    <td>{specifications.dimensions.length}</td>
                  </tr>
                  <tr>
                    <td>{t('search.width') || 'Width'}</td>
                    <td>{specifications.dimensions.width}</td>
                  </tr>
                  <tr>
                    <td>{t('search.height') || 'Height'}</td>
                    <td>{specifications.dimensions.height}</td>
                  </tr>
                  <tr>
                    <td>{t('search.wheelbase') || 'Wheelbase'}</td>
                    <td>{specifications.dimensions.wheelbase}</td>
                  </tr>
                  <tr>
                    <th colSpan="2" className="specs-header">{t('search.other') || 'Other Specifications'}</th>
                  </tr>
                  <tr>
                    <td>{t('search.weight') || 'Weight'}</td>
                    <td>{specifications.weight}</td>
                  </tr>
                  <tr>
                    <td>{t('search.seatingCapacity') || 'Seating Capacity'}</td>
                    <td>{specifications.seatingCapacity}</td>
                  </tr>
                  {isPremium && (
                    <>
                      <tr>
                        <td>{t('search.cargoCapacity') || 'Cargo Capacity'}</td>
                        <td>{specifications.cargoCapacity}</td>
                      </tr>
                      <tr>
                        <th colSpan="2" className="specs-header">{t('search.fuelEconomy') || 'Fuel Economy'}</th>
                      </tr>
                      <tr>
                        <td>{t('search.cityMPG') || 'City'}</td>
                        <td>{specifications.fuelEconomy.city}</td>
                      </tr>
                      <tr>
                        <td>{t('search.highwayMPG') || 'Highway'}</td>
                        <td>{specifications.fuelEconomy.highway}</td>
                      </tr>
                      <tr>
                        <td>{t('search.combinedMPG') || 'Combined'}</td>
                        <td>{specifications.fuelEconomy.combined}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              
              {!isPremium && (
                <div className="specs-premium-prompt">
                  <p>{t('search.upgradeFullSpecs') || 'Upgrade to premium for complete specifications'}</p>
                  <Link href="/pricing" className="upgrade-button">
                    {t('search.goPremium') || 'Go Premium'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="results">
          <h2>
            {t('search.resultsFor') || 'Results for'} {formData.year} {formData.make} {formData.model}
          </h2>
          
          <div className="vehicle-info">
            <p className="mileage-info">
              {t('search.mileage') || 'Mileage'}: {parseInt(formData.mileage).toLocaleString()} {t('search.miles') || 'miles'} 
              <span className="kilometers">({milesToKilometers(formData.mileage).toLocaleString()} km)</span>
            </p>
          </div>
          
          <div className="score-card">
            <h3>{t('search.overallScore') || 'Overall Reliability Score'}</h3>
            <div className="score">
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>

          <div className="action-buttons">
            {user && (
              <SaveSearchButton
                vehicleData={results}
                searchParams={formData}
                timelineData={timelineData}
                specificationsData={specifications}
                savedId={savedId}
              />
            )}
            <DownloadPdfButton
              vehicleData={results}
              searchParams={formData}
              timelineData={timelineData}
              specificationsData={specifications}
            />
          </div>

          {/* Category Scores */}
          <div className="categories">
            <h3>{t('search.categoryScores') || 'Category Scores'}</h3>
            <div className="category-grid">
              {/* RevCounterGauge for each category */}
              {results.categories && (
                <>
                  <RevCounterGauge value={results.categories.engine} label={t('search.engine') || 'Engine'} />
                  <RevCounterGauge value={results.categories.transmission} label={t('search.transmission') || 'Transmission'} />
                  {results.isPremium && (
                    <>
                      <RevCounterGauge value={results.categories.electricalSystem} label={t('search.electrical') || 'Electrical System'} />
                      <RevCounterGauge value={results.categories.brakes} label={t('search.brakes') || 'Brakes'} />
                      <RevCounterGauge value={results.categories.suspension} label={t('search.suspension') || 'Suspension'} />
                      <RevCounterGauge value={results.categories.fuelSystem} label={t('search.fuelSystem') || 'Fuel System'} />
                    </>
                  )}
                </>
              )}
                <div className="premium-prompt">
                  <p>{t('search.upgradeFull') || 'Upgrade to premium for full category breakdowns'}</p>
                  <Link href="/pricing" className="upgrade-button">
                    {t('search.goPremium') || 'Go Premium'}
                  </Link>
                </div>
              
            </div>
          </div>

          {/* Common Issues - Only show for premium users and if there are issues */}
          {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
            <div className="common-issues">
              <h3>{t('search.commonIssues') || 'Common Issues'}</h3>
              <ul>
                {results.commonIssues.map((issue, index) => {
                  const { description, costToFix, occurrence, mileage } = issue;

                  // Skip if any of the fields are undefined
                  if (
                    description === undefined ||
                    costToFix === undefined ||
                    occurrence === undefined ||
                    mileage === undefined
                  ) {
                    return null;
                  }

                  // Check if mileage contains numeric values to convert
                  let mileageText = mileage;
                  if (typeof mileage === 'string') {
                    // Try to extract numbers from the mileage string
                    const mileageMatch = mileage.match(/(\d[\d,]*)/g);
                    if (mileageMatch) {
                      // Replace each number with its equivalent in miles and kilometers
                      mileageText = mileage.replace(/(\d[\d,]*)/g, (match) => {
                        const numericValue = parseInt(match.replace(/,/g, ''));
                        if (!isNaN(numericValue)) {
                          return `${numericValue.toLocaleString()} miles (${milesToKilometers(numericValue).toLocaleString()} km)`;
                        }
                        return match;
                      });
                    }
                  }

                  return (
                    <li key={index}>
                      <strong>{description}</strong>
                      <div>{t('search.costToFix') || 'Cost to Fix'}: {costToFix}</div>
                      <div>{t('search.occurrence') || 'Occurrence'}: {occurrence}</div>
                      <div>{t('search.typicalMileage') || 'Typical Mileage'}: {mileageText}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* AI Analysis */}
          <div className="analysis">
            <h3>{t('search.analysis') || 'Analysis'}</h3>
            <p>{results.aiAnalysis}</p>

            {!results.isPremium && (
              <div className="upgrade-prompt">
                <p>{t('search.upgradePrompt') || 'Upgrade to premium for full AI analysis and detailed reports.'}</p>
                <Link href="/pricing" className="upgrade-button">
                  {t('search.goPremium') || 'Go Premium'}
                </Link>
              </div>
            )}
          </div>
          
          {/* Use CarTimeline component with the data we already have */}
          {isPremium && timelineData && timelineData.length > 0 && (
            <div className="timeline-section">
              <h3>{t('search.timeline') || 'Vehicle Timeline'}</h3>
              <CarTimeline 
                year={formData.year}
                make={formData.make}
                model={formData.model}
                isPremium={isPremium}
                timelineData={timelineData}
                // No need for onTimelineLoaded since we already have the data
              />
            </div>
          )}

          {user && (
            <div className="search-actions">
              <Link href="/search-history" className="view-history-button">
                {t('search.viewSearchHistory') || 'View Search History'}
              </Link>
              <Link href="/saved-vehicles" className="view-saved-button">
                {t('search.viewSavedVehicles') || 'View Saved Vehicles'}
              </Link>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        h1 {
          margin-bottom: 2rem;
        }

        .premium-badge {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-weight: bold;
        }

        .reopen-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reopen-button:hover {
          background-color: #e5e5e5;
        }

        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }
        
        .unit-converter {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #666;
          font-style: italic;
        }
        
        .vehicle-info {
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .mileage-info {
          font-size: 1.1rem;
          color: #333;
        }
        
        .kilometers {
          margin-left: 0.5rem;
          color: #666;
        }
        
        .timeline-section {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .timeline-section h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        input {
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.15);
        }
        
        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .reset-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background-color: #e5e5e5;
        }
        
        .search-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .search-button:hover {
          background-color: #005fc2;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #fff;
          border-top: 3px solid #0070f3;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error {
          color: red;
          padding: 1rem;
          background-color: #fff5f5;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #e53e3e;
        }
        
        .specifications-section {
          background-color: #fff;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .specifications-section h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.75rem;
          text-align: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }
        
        .specifications-container {
          display: flex;
          flex-direction: row;
          gap: 2rem;
        }
        
        .image-container {
          flex: 1;
          min-width: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .image-container img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          object-fit: cover;
        }
        
        .specs-table-container {
          flex: 1;
          min-width: 0;
        }
        
        .specs-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        
        .specs-table th, .specs-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .specs-table th {
          font-weight: 600;
          color: #333;
        }
        
        .specs-header {
          background-color: #f5f8ff;
          color: #0070f3 !important;
          font-weight: bold;
          text-align: left;
          padding: 0.75rem 1rem;
        }
        
        .specs-premium-prompt {
          background-color: #f0f7ff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          margin-top: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .results {
          margin-top: 2rem;
        }
        
        .results h2 {
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.75rem;
          text-align: center;
        }

        .score-card {
          background-color: #f9fafb;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .score-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }

        .score {
          font-size: 3rem;
          font-weight: bold;
          color: #0070f3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-max {
          font-size: 1.5rem;
          color: #666;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .categories, .common-issues, .analysis {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .categories h3, .common-issues h3, .analysis h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .category {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .category:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .category h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #444;
        }

        .category-score {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0070f3;
        }

        .premium-prompt, .upgrade-prompt {
          background-color: #f0f7ff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          grid-column: 1 / -1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-top: 1rem;
        }

        .common-issues ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .common-issues li {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .common-issues li strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #333;
          font-size: 1.1rem;
        }
        
        .common-issues li div {
          margin-bottom: 0.5rem;
          color: #555;
        }

        .analysis {
          padding: 2rem;
        }
        
        .analysis p {
          line-height: 1.6;
          color: #444;
          margin-top: 0;
        }

        .upgrade-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 1rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .upgrade-button:hover {
          background-color: #0060df;
        }

        .search-actions {
          margin-top: 3rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .view-history-button, .view-saved-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f5f5f5;
          color: #0070f3;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .view-history-button:hover, .view-saved-button:hover {
          background-color: #e5f1ff;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(255, 255, 255, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          flex-direction: column;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 6px solid #ccc;
          border-top: 6px solid #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .search-form {
            grid-template-columns: 1fr;
          }
          
          .specifications-container {
            flex-direction: column;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .search-actions {
            flex-direction: column;
          }
          
          .view-history-button, .view-saved-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>{t('search.loadingMessage') || 'Loading...'}</span>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}