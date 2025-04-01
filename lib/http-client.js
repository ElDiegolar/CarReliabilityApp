// lib/http-client.js - HTTP client utility
/**
 * A simple HTTP client with auth token handling
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Make a fetch request with authentication and error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {string} token - Authentication token
 * @returns {Promise} - The fetch response
 */
export async function fetchWithAuth(url, options = {}, token = null) {
  // Prepare headers with auth token if provided
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare the full request options
  const requestOptions = {
    ...options,
    headers,
  };

  // Make the request
  const response = await fetch(`${BASE_URL}${url}`, requestOptions);

  // Handle error responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred while fetching the data.',
    }));

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Return the response data
  return response.json();
}

/**
 * HTTP GET request with authentication
 * @param {string} url - The URL to fetch
 * @param {string} token - Authentication token
 * @returns {Promise} - The fetch response
 */
export function get(url, token = null) {
  return fetchWithAuth(url, { method: 'GET' }, token);
}

/**
 * HTTP POST request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send
 * @param {string} token - Authentication token
 * @returns {Promise} - The fetch response
 */
export function post(url, data, token = null) {
  return fetchWithAuth(
    url,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * HTTP PUT request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send
 * @param {string} token - Authentication token
 * @returns {Promise} - The fetch response
 */
export function put(url, data, token = null) {
  return fetchWithAuth(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * HTTP DELETE request with authentication
 * @param {string} url - The URL to fetch
 * @param {string} token - Authentication token
 * @returns {Promise} - The fetch response
 */
export function del(url, token = null) {
  return fetchWithAuth(url, { method: 'DELETE' }, token);
}

export default {
  get,
  post,
  put,
  del,
  fetchWithAuth,
};