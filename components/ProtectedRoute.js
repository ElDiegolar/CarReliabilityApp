// components/ProtectedRoute.js - Route protection component
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, getToken } = useAuth();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          setVerified(false);
          redirectToLogin();
          return;
        }
        
        // Verify token validity with backend
        const response = await fetch('/api/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setVerified(true);
        } else {
          // Token is invalid
          setVerified(false);
          redirectToLogin();
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setVerified(false);
        redirectToLogin();
      } finally {
        setVerifying(false);
      }
    };
    
    const redirectToLogin = () => {
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
    };

    // If auth context is still loading, wait for it
    if (!loading) {
      if (!isAuthenticated) {
        // If auth context says not authenticated, redirect immediately
        redirectToLogin();
      } else {
        // Otherwise verify the token with the backend
        verifyToken();
      }
    }
  }, [isAuthenticated, loading, router, getToken]);

  // Show loading state
  if (loading || verifying) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying your authentication...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
          }
          
          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0070f3;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If authenticated and verified, render children
  return isAuthenticated && verified ? children : null;
}