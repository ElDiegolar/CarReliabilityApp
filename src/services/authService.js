// src/services/authService.js

import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://car-reliability-app.vercel.app/api'
  : 'http://localhost:3000/api';

const TOKEN_KEY = 'car_reliability_auth_token';
const USER_KEY = 'car_reliability_user';

/**
 * Authentication service for handling user registration, login, and session management
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response with user and token
   */
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Log in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login response with user and token
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Reload the page to clear any stateful data
    window.location.href = '/';
  },
  
  /**
   * Get user profile information
   * @returns {Promise<Object>} - User profile and preferences
   */
  async getProfile() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: this.getAuthHeader()
      });
      
      // Update the stored user data
      this.setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error.message);
      
      // If token is invalid, log the user out
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.logout();
      }
      
      throw error;
    }
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences - User preferences to update
   * @returns {Promise<Object>} - Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/preferences`, preferences, {
        headers: this.getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      console.error('Preferences update error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Set authentication token in localStorage
   * @param {string} token - JWT authentication token
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  /**
   * Get the current authentication token
   * @returns {string|null} - JWT token or null if not logged in
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Set user data in localStorage
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  /**
   * Get the current user data
   * @returns {Object|null} - User data or null if not logged in
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  /**
   * Check if a user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },
  
  /**
   * Get authorization header for API requests
   * @returns {Object} - Headers object with authorization token
   */
  getAuthHeader() {
    const token = this.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : ''
    };
  },
  
  /**
   * Get axios instance with auth headers
   * @returns {Object} - Axios instance with authorization header
   */
  getAuthAxios() {
    const token = this.getToken();
    
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
  }
};

export default authService;