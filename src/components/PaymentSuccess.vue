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
      
      <div class="flex flex-col items-center justify-center space-y-4">
        <button 
          @click="$emit('continue')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition duration-300"
        >
          View Your Report
        </button>
        
        <p class="text-gray-500 text-sm">
          A receipt has been sent to your email address.
          <br>Payment ID: {{ sessionId }}
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  
  export default {
    name: 'PaymentSuccess',
    emits: ['continue'],
    
    setup() {
      const sessionId = ref('');
      const paymentStatus = ref('');
      
      onMounted(async () => {
        // Get the session ID from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('session_id');
        
        if (id) {
          sessionId.value = id;
          
          try {
            // Verify payment status
            const response = await fetch(`/payment-status/${id}`);
            const data = await response.json();
            
            paymentStatus.value = data.status;
            
            // Store payment info in localStorage for the main app to use
            localStorage.setItem('paymentSessionId', id);
            localStorage.setItem('paymentStatus', data.status);
          } catch (error) {
            console.error('Error verifying payment:', error);
          }
        }
      });
      
      return {
        sessionId,
        paymentStatus
      };
    }
  };
  </script>