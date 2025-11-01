// src/services/adminService.js

import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://car-reliability-app.vercel.app/api'
  : 'http://localhost:3000/api';

const ADMIN_TOKEN_KEY = 'admin_token';

/**
 * Admin service for managing users and accessing admin functionality
 */
const adminService = {
  /**
   * Authenticate with admin password
   * @param {string} password - Admin password
   * @returns {Promise<Object>} - Authentication response
   */
  async authenticateAdmin(password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/auth`, { password });
      
      if (response.data.token) {
        this.setAdminToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Admin authentication error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get all users with their statistics
   * @param {string} adminPassword - Admin password for verification
   * @returns {Promise<Array>} - Array of users with statistics
   */
  async getAllUsers(adminPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users`, { 
        adminPassword 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Update user information
   * @param {number} userId - User ID to update
   * @param {Object} userData - Updated user data
   * @param {string} adminPassword - Admin password for verification
   * @returns {Promise<Object>} - Update response
   */
  async updateUser(userId, userData, adminPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/update`, {
        ...userData,
        adminPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Delete a user
   * @param {number} userId - User ID to delete
   * @param {string} adminPassword - Admin password for verification
   * @returns {Promise<Object>} - Delete response
   */
  async deleteUser(userId, adminPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/delete`, {
        adminPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get user activity details
   * @param {number} userId - User ID
   * @param {string} adminPassword - Admin password for verification
   * @returns {Promise<Object>} - User activity data
   */
  async getUserActivity(userId, adminPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/activity`, {
        adminPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Set admin token in localStorage
   * @param {string} token - Admin JWT token
   */
  setAdminToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  
  /**
   * Get the current admin token
   * @returns {string|null} - Admin token or null
   */
  getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  /**
   * Clear admin token (logout)
   */
  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  
  /**
   * Check if admin is authenticated
   * @returns {boolean} - True if admin token exists
   */
  isAdminAuthenticated() {
    return !!this.getAdminToken();
  }
};

export default adminService;