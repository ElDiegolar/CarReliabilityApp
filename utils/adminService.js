// utils/adminService.js - Admin service for Next.js/React

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.lemnaed.com/api'
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
      const response = await fetch(`${API_BASE_URL}/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      if (data.token) {
        this.setAdminToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Admin authentication error:', error.message);
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
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching users:', error.message);
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
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          adminPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error.message);
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
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting user:', error.message);
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
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user activity');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user activity:', error.message);
      throw error;
    }
  },
  
  /**
   * Set admin token in localStorage (client-side only)
   * @param {string} token - Admin JWT token
   */
  setAdminToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  },
  
  /**
   * Get the current admin token (client-side only)
   * @returns {string|null} - Admin token or null
   */
  getAdminToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  },
  
  /**
   * Clear admin token (logout)
   */
  clearAdminToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },
  
  /**
   * Check if admin is authenticated (client-side only)
   * @returns {boolean} - True if admin token exists
   */
  isAdminAuthenticated() {
    return !!this.getAdminToken();
  }
};

export default adminService;