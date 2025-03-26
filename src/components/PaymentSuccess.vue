<!-- src/components/PaymentSuccess.vue -->
<template>
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
    <div class="mb-6">
      <div class="bg-green-100 rounded-full p-4 inline-block">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    
    <h1 class="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
    <p class="text-gray-600 text-lg mb-6">Your premium reliability report has been unlocked.</p>
    
    <div v-if="loading" class="flex justify-center mb-6">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center space-y-4">
      <button 
        @click="$emit('continue')"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition duration-300"
      >
        View Your Report
      </button>
      
      <p class="text-gray-500 text-sm">
        A receipt has been sent to your email address.
        <br v-if="sessionId">
        <span v-if="sessionId">Payment ID: {{ sessionId }}</span>
      </p>
    </div>
    
    <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600">{{ error }}</p>
      <button 
        @click="$emit('continue')"
        class="mt-3 text-blue-600 hover:text-blue-800 font-medium"
      >
        Continue Anyway
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'PaymentSuccess',
  emits: ['continue'],
  
  setup(props, { emit }) {
    const sessionId = ref('');
    const paymentStatus = ref('');
    const loading = ref(true);
    const error = ref('');
    const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://car-reliability-app.vercel.app';
    
    onMounted(async () => {
      try {
        // Get the session ID from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('session_id');
        
        if (id) {
          sessionId.value = id;
          
          // Authenticate request if user is logged in
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          
          // Verify payment status
          const response = await axios.post(`${apiBaseUrl}/api/payment/verify`, {
            sessionId: id,
            plan: 'premium'
          }, { headers });
          
          if (response.data && response.data.accessToken) {
            // Store the access token for premium features
            localStorage.setItem('premiumToken', response.data.accessToken);
            localStorage.setItem('isPremium', 'true');
            
            // Set payment status
            paymentStatus.value = 'success';
          } else {
            throw new Error('Invalid payment verification response');
          }
        } else {
          // Alternative: Check if the payment was made through direct payment
          const paymentIntent = localStorage.getItem('lastPaymentIntentId');
          
          if (paymentIntent) {
            // Try to verify the payment intent directly
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await axios.post(`${apiBaseUrl}/api/check-payment-status`, {
              paymentIntentId: paymentIntent
            }, { headers });
            
            if (response.data && response.data.success) {
              // Store the access token for premium features
              if (response.data.subscription?.accessToken) {
                localStorage.setItem('premiumToken', response.data.subscription.accessToken);
                localStorage.setItem('isPremium', 'true');
              }
              
              // Set payment ID and status
              sessionId.value = paymentIntent;
              paymentStatus.value = 'success';
            } else {
              throw new Error('Payment verification failed');
            }
            
            // Clear the stored payment intent
            localStorage.removeItem('lastPaymentIntentId');
          } else {
            // No session ID or payment intent found
            error.value = 'Payment session information not found. Please contact support if you were charged.';
          }
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        error.value = 'Failed to verify payment status. Please contact support if you were charged.';
      } finally {
        loading.value = false;
      }
    });
    
    return {
      sessionId,
      paymentStatus,
      loading,
      error
    };
  }
};
</script>