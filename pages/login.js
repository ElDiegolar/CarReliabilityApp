// pages/login.js - User login page
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
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
    
    // For registration, validate passwords match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Store the token in localStorage
      localStorage.setItem('authToken', data.token);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isLogin ? 'Login' : 'Register'}>
      <div className="auth-container">
        <h1>{isLogin ? 'Login' : 'Create an Account'}</h1>
        
        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="•••••••••"
              minLength={6}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="•••••••••"
                minLength={6}
              />
            </div>
          )}
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading
              ? (isLogin ? 'Logging in...' : 'Creating account...')
              : (isLogin ? 'Login' : 'Create Account')
            }
          </button>
        </form>
        
        <div className="auth-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={() => setIsLogin(false)}>Register</a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a href="#" onClick={() => setIsLogin(true)}>Login</a>
            </p>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .auth-tabs {
          display: flex;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #eaeaea;
        }
        
        .tab {
          flex: 1;
          background: none;
          border: none;
          padding: 0.75rem 0;
          font-size: 1rem;
          cursor: pointer;
          position: relative;
        }
        
        .tab.active {
          font-weight: bold;
          color: #0070f3;
        }
        
        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #0070f3;
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .error {
          color: #e00;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .auth-button {
          padding: 0.75rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .auth-button:hover {
          background-color: #0060df;
        }
        
        .auth-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
        }
        
        .auth-footer a {
          color: #0070f3;
          text-decoration: none;
        }
        
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
}