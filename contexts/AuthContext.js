// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if token exists and is valid on load
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await fetch('/api/verify-token', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.valid) {
              // Fetch user data
              const profileResponse = await fetch('/api/profile', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setUser(profileData.user);
              } else {
                // If profile fetch fails, clear token
                localStorage.removeItem('authToken');
                setUser(null);
              }
            } else {
              // If token is invalid, clear it
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } else {
            // If token verification fails, clear token
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user state
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user state
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear token
    localStorage.removeItem('authToken');
    
    // Clear user state
    setUser(null);
    
    // Redirect to home
    router.push('/');
  };

  const getToken = () => {
    // Get token from localStorage
    return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}