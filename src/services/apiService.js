// src/services/apiService.js

import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Service for interacting with the car reliability API
 */
export const carReliabilityService = {
  /**
   * Get reliability data for a specific car
   * @param {string} year - The year of the car
   * @param {string} make - The make of the car
   * @param {string} model - The model of the car
   * @returns {Promise<Object>} - The reliability data
   */
  async getReliabilityData(year, make, model) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/car-reliability`, {
        year,
        make,
        model
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching reliability data:', error);
      
      // If the main API fails, try the fallback
      if (error.response && error.response.status >= 500) {
        return this.getFallbackReliabilityData(year, make, model);
      }
      
      throw error;
    }
  },
  
  /**
   * Get fallback reliability data when the ChatGPT API is unavailable
   * @param {string} year - The year of the car
   * @param {string} make - The make of the car
   * @param {string} model - The model of the car
   * @returns {Promise<Object>} - Fallback reliability data
   */
  async getFallbackReliabilityData(year, make, model) {
    const response = await axios.post(`${API_BASE_URL}/api/fallback-reliability`, {
      year,
      make,
      model
    });
    
    return response.data;
  },
  
  /**
   * Get available car makes for a specific year
   * @param {string} year - The year to get makes for
   * @returns {Promise<Array>} - Array of available makes
   */
  async getCarMakes(year) {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    return [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 
      'Mercedes-Benz', 'Audi', 'Tesla', 'Hyundai', 'Kia'
    ];
  },
  
  /**
   * Get available car models for a specific make and year
   * @param {string} make - The make to get models for
   * @param {string} year - The year to get models for
   * @returns {Promise<Array>} - Array of available models
   */
  async getCarModels(make, year) {
    // In a real app, this would be an API call
    // For now, we'll return mock data based on make
    const modelsByMake = {
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
      'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge'],
      'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Corvette'],
      'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
      'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
      'Audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
      'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
      'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
      'Kia': ['Forte', 'K5', 'Sportage', 'Sorento', 'Telluride']
    };
    
    return modelsByMake[make] || [];
  }
};