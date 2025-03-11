// src/store/auth.js
import { ref, computed } from 'vue';
import axios from 'axios';

// Create a reactive state with proper parsing of localStorage data
const user = ref(null);
const token = ref(localStorage.getItem('token') || null);
const isPremium = ref(localStorage.getItem('isPremium') === 'true');
const loading = ref(false);
const error = ref(null);

// Try to parse user from localStorage
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
} catch (e) {
  console.error('Error parsing user from localStorage:', e);
  // Clear potentially corrupted data
  localStorage.removeItem('user');
}

// Define API base URL
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://car-reliability-app.vercel.app';

// Computed properties
const isLoggedIn = computed(() => !!token.value);

// Login function
const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.post(`${apiBaseUrl}/login`, { 
      email, 
      password 
    });
    
    // Store auth data
    user.value = response.data.user;
    token.value = response.data.token;
    isPremium.value = response.data.isPremium;
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('isPremium', String(response.data.isPremium));
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    return response.data;
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.error || 'Login failed';
    throw err;
  } finally {
    loading.value = false;
  }
};

// Register function
const register = async (email, password) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.post(`${apiBaseUrl}/register`, { 
      email, 
      password 
    });
    
    // Store auth data
    user.value = response.data.user;
    token.value = response.data.token;
    isPremium.value = false;
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('isPremium', 'false');
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    return response.data;
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.error || 'Registration failed';
    throw err;
  } finally {
    loading.value = false;
  }
};

// Logout function
const logout = () => {
  console.log("Logging out user...");
  // Clear auth data
  user.value = null;
  token.value = null;
  isPremium.value = false;
  
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('isPremium');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('premiumToken');
  
  // Clear auth header
  delete axios.defaults.headers.common['Authorization'];
  
  console.log("Logout complete - Auth state:", { user: user.value, token: token.value, isPremium: isPremium.value });
};

// Check authentication status
const checkAuth = async () => {
  if (!token.value) return false;
  
  try {
    // Set auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    
    // Get user profile
    const response = await axios.get(`${apiBaseUrl}/profile`);
    
    // Update user data
    user.value = response.data.user;
    isPremium.value = response.data.isPremium;
    
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('isPremium', String(response.data.isPremium));
    
    return true;
  } catch (err) {
    console.error('Auth check failed:', err);
    
    // If token is invalid, logout
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      logout();
    }
    
    return false;
  }
};

// Update premium status (useful when premium token is verified)
const updatePremiumStatus = (status) => {
  isPremium.value = status;
  localStorage.setItem('isPremium', String(status));
};

// Initialize: check auth on page load if token exists
if (token.value) {
  checkAuth().catch(console.error);
}

export default {
  user,
  token,
  isPremium,
  loading,
  error,
  isLoggedIn,
  login,
  register,
  logout,
  checkAuth,
  updatePremiumStatus
};