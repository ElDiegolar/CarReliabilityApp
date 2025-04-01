// lib/openai.js - OpenAI client with rate limiting and error handling
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Simple in-memory rate limiter
// For production, use Redis or a database-backed solution
const rateLimiter = {
  requests: {},
  maxRequests: 50, // Max requests per window
  windowMs: 60 * 1000, // 1 minute window
  
  // Check if an IP has exceeded the rate limit
  isRateLimited(ip) {
    const now = Date.now();
    
    // Clean up old entries
    Object.keys(this.requests).forEach(key => {
      if (this.requests[key].timestamp < now - this.windowMs) {
        delete this.requests[key];
      }
    });
    
    // Check if IP exists and count
    if (!this.requests[ip]) {
      this.requests[ip] = {
        count: 0,
        timestamp: now
      };
    }
    
    // Increment count
    this.requests[ip].count++;
    
    // Check if over limit
    return this.requests[ip].count > this.maxRequests;
  }
};

/**
 * Create a chat completion with rate limiting and error handling
 * @param {Object} options - OpenAI API options
 * @param {String} ip - Client IP for rate limiting
 * @returns {Promise} - OpenAI API response
 */
export async function createChatCompletion(options, ip = 'unknown') {
  // Check rate limit
  if (rateLimiter.isRateLimited(ip)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  try {
    // Default settings for more reliable responses
    const defaultOptions = {
      temperature: 0.2,
      max_tokens: 2000,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
    
    // Merge options with defaults
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Call OpenAI API
    const completion = await openai.createChatCompletion(mergedOptions);
    
    return completion;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Map OpenAI errors to more user-friendly messages
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        throw new Error('API key is invalid or expired');
      } else if (status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      }
    }
    
    throw new Error('Failed to generate completion. Please try again.');
  }
}

export default openai;