// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import axios from 'axios';
import authService from './services/authService';

// Configure axios with base URL for API
const apiBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://car-reliability-app.vercel.app/api'
  : 'http://localhost:3000/api';

axios.defaults.baseURL = apiBaseUrl;

// Add authorization header to requests when token is available
axios.interceptors.request.use(config => {
  const token = authService.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Create and mount the Vue application
createApp(App)
  .use(router)
  .mount('#app');