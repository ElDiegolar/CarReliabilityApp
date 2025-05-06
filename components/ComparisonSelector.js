// components/ComparisonSelector.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export default function ComparisonSelector({ vehicles }) {
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const router = useRouter();
  const { t } = useTranslation('common');
  
  const toggleVehicleSelection = (vehicleId) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      // Limit to 3 selections
      if (selectedVehicles.length < 3) {
        setSelectedVehicles([...selectedVehicles, vehicleId]);
      }
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
  
  return (
    <div className="comparison-selector">
      <div className="selection-instructions">
        <h3>{t('comparison.compareVehicles', 'Compare Vehicles')}</h3>
        <p>{t('comparison.selectUpToThree', 'Select up to 3 vehicles to compare')}</p>
        <p>{t('comparison.selectedCount', 'Selected')}: {selectedVehicles.length}/3</p>
      </div>
      
      {vehicles.map(vehicle => (
        <div 
          key={vehicle.id} 
          className={`selection-item ${selectedVehicles.includes(vehicle.id) ? 'selected' : ''}`}
          onClick={() => toggleVehicleSelection(vehicle.id)}
        >
          <input 
            type="checkbox" 
            checked={selectedVehicles.includes(vehicle.id)}
            onChange={() => {}} // Handled by the div onClick
            aria-label={`Select ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          />
          <div className="vehicle-info">
            <span className="year">{vehicle.year}</span>
            <span className="make-model">{vehicle.make} {vehicle.model}</span>
          </div>
        </div>
      ))}
      
      <button 
        className="compare-button" 
        disabled={selectedVehicles.length === 0}
        onClick={handleCompare}
      >
        {t('comparison.compareSelected', 'Compare Selected')}
      </button>
      
      <style jsx>{`
  .comparison-selector {
    background-color: #f0f7ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .selection-instructions {
    margin-bottom: 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(0, 112, 243, 0.2);
    padding-bottom: 1rem;
  }
  
  .selection-instructions h3 {
    margin-top: 0;
    color: #0070f3;
    font-size: 1.2rem;
  }
  
  .selection-instructions p {
    margin: 0.5rem 0;
    color: #4a5568;
  }
  
  .selection-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    background-color: white;
    transition: all 0.2s;
    border: 1px solid #edf2f7;
  }
  
  .selection-item:hover {
    background-color: #f9f9f9;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .selection-item.selected {
    background-color: #e5f1ff;
    border: 1px solid #0070f3;
  }
  
  .selection-item input {
    margin-right: 1rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .vehicle-info {
    display: flex;
    flex-direction: column;
  }
  
  .year {
    font-weight: bold;
    font-size: 1.1rem;
    color: #2d3748;
  }
  
  .make-model {
    margin-top: 0.25rem;
    color: #4a5568;
  }
  
  .compare-button {
    display: block;
    width: 100%;
    padding: 0.85rem;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 6px;
    margin-top: 1.5rem;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 112, 243, 0.2);
  }
  
  .compare-button:hover {
    background-color: #0060df;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 112, 243, 0.3);
  }
  
  .compare-button:active {
    transform: translateY(0);
  }
  
  .compare-button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 640px) {
    .comparison-selector {
      padding: 1rem;
    }
    
    .selection-item {
      padding: 0.6rem 0.75rem;
    }
    
    .year {
      font-size: 1rem;
    }
  }
`}</style>
    </div>
  );
}