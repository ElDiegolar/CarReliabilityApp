// components/AuthDebugger.js - Debugging component for authentication (use only in development)
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthDebugger() {
  const { user, isAuthenticated, getToken } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({ valid: false, checking: true });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          setTokenInfo({ valid: false, checking: false, error: 'No token found' });
          return;
        }
        
        // Verify token with backend
        const response = await fetch('/api/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        setTokenInfo({ 
          valid: data.valid, 
          checking: false,
          userId: data.userId,
          error: data.error
        });
      } catch (error) {
        setTokenInfo({ 
          valid: false, 
          checking: false,
          error: error.message 
        });
      }
    };
    
    verifyToken();
  }, [getToken]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="auth-debugger">
      <div className="header" onClick={() => setExpanded(!expanded)}>
        <h3>Auth Debugger {expanded ? '▼' : '►'}</h3>
        <div className={`status ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`}>
          {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </div>
      </div>
      
      {expanded && (
        <div className="content">
          <div className="section">
            <h4>Auth Context</h4>
            <div><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
            <div><strong>User:</strong> {user ? JSON.stringify(user) : 'null'}</div>
            <div><strong>Token exists:</strong> {getToken() ? 'true' : 'false'}</div>
          </div>
          
          <div className="section">
            <h4>Token Verification</h4>
            {tokenInfo.checking ? (
              <div>Checking token...</div>
            ) : (
              <>
                <div><strong>Valid:</strong> {tokenInfo.valid ? 'true' : 'false'}</div>
                {tokenInfo.userId && <div><strong>User ID:</strong> {tokenInfo.userId}</div>}
                {tokenInfo.error && <div><strong>Error:</strong> {tokenInfo.error}</div>}
              </>
            )}
          </div>
          
          <div className="section">
            <h4>Actions</h4>
            <button 
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.reload();
              }}
            >
              Clear Token & Reload
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .auth-debugger {
          position: fixed;
          bottom: 0;
          right: 20px;
          width: 300px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
          font-family: monospace;
          font-size: 12px;
          z-index: 9999;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #e9ecef;
          cursor: pointer;
          border-radius: 6px 6px 0 0;
        }
        
        .header h3 {
          margin: 0;
          font-size: 14px;
        }
        
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status.authenticated {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status.unauthenticated {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .content {
          padding: 12px;
          background-color: white;
          border-top: 1px solid #dee2e6;
        }
        
        .section {
          margin-bottom: 12px;
        }
        
        .section h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
        }
        
        .section div {
          margin-bottom: 4px;
        }
        
        button {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        button:hover {
          background-color: #5a6268;
        }
      `}</style>
    </div>
  );
}