// main.js
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import axios from 'axios'

// Configure axios with base URL for API
// Replace with your actual API URL in production
axios.defaults.baseURL = 'http://localhost:3000'

// Create and mount the Vue application
createApp(App).mount('#app')