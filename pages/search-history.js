// pages/search-history.js - User search history page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function SearchHistory() {
  const { getToken } = useAuth();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const token = getToken();
        
        const response = await fetch('/api/user/searches', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load search history');
        }
        
        const data = await response.json();
        setSearches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchHistory();
  }, [getToken]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ProtectedRoute>
      <Layout title="Your Search History">
        <div className="history-container">
          <h1>Your Search History</h1>
          
          {loading ? (
            <div className="loading">Loading search history...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : searches.length === 0 ? (
            <div className="empty-state">
              <p>You haven't searched for any vehicles yet.</p>
              <Link href="/search" className="button primary">
                Search Now
              </Link>
            </div>
          ) : (
            <div className="search-list">
              <div className="search-header">
                <div className="vehicle-col">Vehicle</div>
                <div className="mileage-col">Mileage</div>
                <div className="date-col">Date</div>
                <div className="actions-col">Actions</div>
              </div>
              
              {searches.map((search) => (
                <div key={search.id} className="search-item">
                  <div className="vehicle-col">
                    <span className="year">{search.year}</span>
                    <span className="make">{search.make}</span>
                    <span className="model">{search.model}</span>
                  </div>
                  <div className="mileage-col">
                    {search.mileage.toLocaleString()} miles
                  </div>
                  <div className="date-col">
                    {formatDate(search.created_at)}
                  </div>
                  <div className="actions-col">
                    <Link 
                      href={`/search?year=${search.year}&make=${search.make}&model=${search.model}&mileage=${search.mileage}`}
                      className="action-button"
                    >
                      Search Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <style jsx>{`
          .history-container {
            max-width: 900px;
            margin: 0 auto;
          }
          
          h1 {
            margin-bottom: 2rem;
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
          
          .search-list {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          .search-header {
            display: flex;
            padding: 1rem;
            background-color: #f5f5f5;
            font-weight: bold;
            border-bottom: 1px solid #eaeaea;
          }
          
          .search-item {
            display: flex;
            padding: 1rem;
            border-bottom: 1px solid #eaeaea;
            transition: background-color 0.2s;
          }
          
          .search-item:last-child {
            border-bottom: none;
          }
          
          .search-item:hover {
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
          
          .date-col {
            flex: 1.5;
            display: flex;
            align-items: center;
          }
          
          .actions-col {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
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
          
          .action-button {
            display: inline-block;
            padding: 0.5rem 0.75rem;
            background-color: #f5f5f5;
            color: #0070f3;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: background-color 0.2s;
          }
          
          .action-button:hover {
            background-color: #e5f1ff;
          }
          
          @media (max-width: 768px) {
            .search-header {
              display: none;
            }
            
            .search-item {
              flex-direction: column;
              padding: 1rem;
            }
            
            .vehicle-col, .mileage-col, .date-col, .actions-col {
              width: 100%;
              padding: 0.5rem 0;
            }
            
            .actions-col {
              justify-content: flex-start;
              margin-top: 0.5rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}