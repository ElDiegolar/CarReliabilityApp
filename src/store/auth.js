// src/store/auth.js
import { ref, computed } from 'vue';
import axios from 'axios';

// Create a reactive state
const user = ref(JSON.parse(localStorage.getItem('user')) || null);
const token = ref(localStorage.getItem('token') || null);
const isPremium = ref(localStorage.getItem('isPremium') === 'true');
const loading = ref(false);
const error = ref(null);

// Computed properties

const isLoggedIn = computed(() => !!token.value);

// Login function
const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.post('/api/login', { email, password });
    
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
    const response = await axios.post('/api/register', { email, password });
    
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
    const response = await axios.get('/api/profile');
    
    // Update user data
    user.value = response.data.user;
    isPremium.value = response.data.isPremium;
    
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

// Initialize: check auth on page load
checkAuth();

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
  checkAuth
};