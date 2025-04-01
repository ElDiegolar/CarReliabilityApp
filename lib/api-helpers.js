// lib/api-helpers.js - Utility functions for API routes

/**
 * Validate request method against allowed methods
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Array} allowedMethods - Array of allowed HTTP methods
 * @returns {Boolean} - False if method is not allowed and response has been sent
 */
export function validateMethod(req, res, allowedMethods) {
    if (!allowedMethods.includes(req.method)) {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
      return false;
    }
    return true;
  }
  
  /**
   * Validate required fields in request body
   * @param {Object} req - Next.js request object
   * @param {Object} res - Next.js response object
   * @param {Array} requiredFields - Array of required field names
   * @returns {Boolean} - False if validation fails and response has been sent
   */
  export function validateFields(req, res, requiredFields) {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
      return false;
    }
    return true;
  }
  
  /**
   * Handle API errors consistently
   * @param {Object} res - Next.js response object
   * @param {Error} error - Error object
   * @param {String} message - Custom error message
   * @param {Number} statusCode - HTTP status code
   */
  export function handleError(res, error, message = 'An error occurred', statusCode = 500) {
    console.error(`API Error: ${message}`, error);
    res.status(statusCode).json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  /**
   * Success response helper
   * @param {Object} res - Next.js response object
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code
   */
  export function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }
  
  /**
   * Create API handler with common error handling
   * @param {Function} handler - Handler function
   * @returns {Function} - Wrapped handler function
   */
  export function createApiHandler(handler) {
    return async (req, res) => {
      try {
        await handler(req, res);
      } catch (error) {
        handleError(res, error);
      }
    };
  }