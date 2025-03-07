// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import axios from 'axios';

// Configure axios with base URL for API
// Replace with your actual API URL in production
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

// Check for stored token and set default auth header
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Create and mount the Vue application
createApp(App).mount('#app');