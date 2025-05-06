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
        }
        
        .selection-instructions {
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .selection-instructions h3 {
          margin-top: 0;
          color: #0070f3;
        }
        
        .selection-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          background-color: white;
          transition: all 0.2s;
        }
        
        .selection-item:hover {
          background-color: #f9f9f9;
        }
        
        .selection-item.selected {
          background-color: #e5f1ff;
          border: 1px solid #0070f3;
        }
        
        .selection-item input {
          margin-right: 1rem;
        }
        
        .vehicle-info {
          display: flex;
          flex-direction: column;
        }
        
        .year {
          font-weight: bold;
        }
        
        .compare-button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          margin-top: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .compare-button:hover {
          background-color: #0060df;
        }
        
        .compare-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}