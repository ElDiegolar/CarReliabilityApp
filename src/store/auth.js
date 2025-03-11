// src/store/auth.js
import { ref, computed } from 'vue';
import axios from 'axios';

// Define API base URL
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://car-reliability-app.vercel.app';

// Create a reactive state with proper parsing of localStorage data
const user = ref(null);
const token = ref(localStorage.getItem('token') || null);

// Check multiple sources for premium status at initialization
const isPremiumFromStorage = localStorage.getItem('isPremium') === 'true';
const hasAccessToken = !!localStorage.getItem('accessToken');
const isPremium = ref(isPremiumFromStorage || hasAccessToken);

// If we detect premium status from any source, synchronize it
if (isPremium.value) {
  localStorage.setItem('isPremium', 'true');
  console.log('Initial premium status set to true');
}

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

// Add a new synchronize function to check all sources of premium status
const synchronizePremiumStatus = () => {
  const sources = {
    isPremiumValue: isPremium.value,
    isPremiumFromStorage: localStorage.getItem('isPremium') === 'true',
    hasAccessToken: !!localStorage.getItem('accessToken'),
    userHasActiveSubscription: user.value && 
                              user.value.subscription && 
                              user.value.subscription.status === 'active'
  };
  
  console.log('Synchronizing premium status from sources:', sources);
  
  // If any source indicates premium, set all to premium
  const shouldBePremium = Object.values(sources).some(source => source === true);
  
  if (shouldBePremium) {
    isPremium.value = true;
    localStorage.setItem('isPremium', 'true');
    console.log('Premium status synchronized to true');
  }
  
  return shouldBePremium;
};

// Call this after initialization
synchronizePremiumStatus();

// Computed properties
const isLoggedIn = computed(() => !!token.value);

// Login function
const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.post(`${apiBaseUrl}/api/login`, { 
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
    
    // Synchronize premium status
    synchronizePremiumStatus();
    
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
    const response = await axios.post(`${apiBaseUrl}/api/register`, { 
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
    const response = await axios.get(`${apiBaseUrl}/api/profile`);
    
    // Update user data
    user.value = response.data.user;
    isPremium.value = response.data.isPremium;
    
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('isPremium', String(response.data.isPremium));
    
    // Synchronize premium status across all sources
    synchronizePremiumStatus();
    
    return true;
  } catch (err) {
    console.error('Auth check failed:', err);
    
    // If token is invalid, logout
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      logout();
    } else {
      // Still check if we should be premium from other sources
      synchronizePremiumStatus();
    }
    
    return false;
  }
};

// Update premium status (useful when premium token is verified)
const updatePremiumStatus = (status) => {
  isPremium.value = status;
  localStorage.setItem('isPremium', String(status));
  console.log('Premium status explicitly set to:', status);
  
  if (status) {
    // If setting to premium, make sure we synchronize
    synchronizePremiumStatus();
  }
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
  updatePremiumStatus,
  synchronizePremiumStatus
};