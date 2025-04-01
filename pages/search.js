// pages/search.js - Car search page
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Search() {
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/car-reliability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reliability data');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Search Vehicle Reliability">
      <h1>Search Vehicle Reliability</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1980"
            max="2025"
            required
            placeholder="e.g. 2018"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="make">Make</label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            placeholder="e.g. Toyota"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            placeholder="e.g. Camry"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mileage">Mileage</label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            max="500000"
            required
            placeholder="e.g. 50000"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <p className="error">{error}</p>}
      
      {results && (
        <div className="results">
          <h2>Results for {formData.year} {formData.make} {formData.model}</h2>
          
          <div className="score-card">
            <h3>Overall Reliability Score</h3>
            <div className="score">
              <span className="score-value">{results.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
          
          <div className="categories">
            <h3>Category Scores</h3>
            <div className="category-grid">
              <div className="category">
                <h4>Engine</h4>
                <div className="category-score">{results.categories.engine}/100</div>
              </div>
              <div className="category">
                <h4>Transmission</h4>
                <div className="category-score">{results.categories.transmission}/100</div>
              </div>
              
              {results.isPremium ? (
                <>
                  <div className="category">
                    <h4>Electrical System</h4>
                    <div className="category-score">{results.categories.electricalSystem}/100</div>
                  </div>
                  <div className="category">
                    <h4>Brakes</h4>
                    <div className="category-score">{results.categories.brakes}/100</div>
                  </div>
                  <div className="category">
                    <h4>Suspension</h4>
                    <div className="category-score">{results.categories.suspension}/100</div>
                  </div>
                  <div className="category">
                    <h4>Fuel System</h4>
                    <div className="category-score">{results.categories.fuelSystem}/100</div>
                  </div>
                </>
              ) : (
                <div className="premium-prompt">
                  <p>Upgrade to premium for full category breakdowns</p>
                </div>
              )}
            </div>
          </div>
          
          {results.isPremium && results.commonIssues && results.commonIssues.length > 0 && (
            <div className="common-issues">
              <h3>Common Issues</h3>
              <ul>
                {results.commonIssues.map((issue, index) => (
                  <li key={index}>
                    <strong>{issue.description}</strong>
                    <div>Cost to Fix: {issue.costToFix}</div>
                    <div>Occurrence: {issue.occurrence}</div>
                    <div>Typical Mileage: {issue.mileage}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="analysis">
            <h3>Analysis</h3>
            <p>{results.aiAnalysis}</p>
            
            {!results.isPremium && (
              <div className="upgrade-prompt">
                <p>Upgrade to premium for full AI analysis and detailed reports.</p>
                <Link href="/pricing" className="upgrade-button">
                  Go Premium
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        h1 {
          margin-bottom: 2rem;
        }
        
        .search-form {
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #0060df;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .error {
          color: red;
          margin-bottom: 1rem;
        }
        
        .results {
          margin-top: 2rem;
        }
        
        .score-card {
          background-color: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .score {
          font-size: 3rem;
          font-weight: bold;
          color: #0070f3;
        }
        
        .score-max {
          font-size: 1.5rem;
          color: #666;
        }
        
        .categories {
          margin-bottom: 2rem;
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .category {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
        }
        
        .category h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .category-score {
          font-size: 1.25rem;
          font-weight: bold;
          color: #0070f3;
        }
        
        .premium-prompt, .upgrade-prompt {
          background-color: #fffbea;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          grid-column: 1 / -1;
        }
        
        .common-issues {
          margin-bottom: 2rem;
        }
        
        .common-issues ul {
          list-style-type: none;
          padding: 0;
        }
        
        .common-issues li {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .analysis {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
        }
        
        .upgrade-prompt {
          margin-top: 1rem;
        }
        
        .upgrade-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          font-weight: 500;
          margin-top: 0.5rem;
          text-decoration: none;
        }
        
        .upgrade-button:hover {
          background-color: #0060df;
        }
      `}</style>
    </Layout>
  );
}