<!-- src/components/PaymentForm.vue -->
<template>
    <div class="payment-container bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-6">Premium Reliability Report</h2>
      
      <div class="mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h3 class="text-xl font-medium text-blue-800">Get the Full Analysis</h3>
            <p class="text-gray-600 mb-2">Unlock comprehensive insights about your vehicle's reliability</p>
          </div>
          <div class="text-2xl font-bold text-blue-800">$9.95</div>
        </div>
  
        <div class="bg-blue-50 p-4 rounded-md mb-4">
          <h4 class="font-medium mb-2">What You'll Get:</h4>
          <ul class="space-y-2">
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Complete reliability breakdown for all vehicle systems</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Detailed list of common issues with repair costs</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>AI-powered analysis comparing to similar vehicles</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Important recall information and ownership tips</span>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Payment Options -->
      <div class="mb-6">
        <h4 class="font-medium mb-3">Payment Method:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button 
            @click="paymentMethod = 'card'"
            class="p-3 border rounded-md flex items-center justify-center transition-colors"
            :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'"
          >
            <span class="font-medium">Credit Card</span>
          </button>
          <button 
            @click="useCheckout"
            class="p-3 border rounded-md flex items-center justify-center transition-colors border-gray-300 hover:border-blue-300"
          >
            <span class="font-medium">Stripe Checkout</span>
          </button>
        </div>
      </div>
  
      <!-- Card Payment Form -->
      <div v-if="paymentMethod === 'card' && !paymentProcessing && !paymentSuccess">
        <div v-if="!clientSecret" class="text-center p-4">
          <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Initializing payment form...</p>
        </div>
        
        <div v-else>
          <div id="card-element" class="border border-gray-300 p-4 rounded-md mb-4"></div>
          <div id="card-errors" class="text-red-500 mb-4" role="alert"></div>
          
          <button 
            @click="handleSubmit"
            :disabled="!stripe || !elements || submitDisabled"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
            :class="{ 'opacity-70 cursor-not-allowed': !stripe || !elements || submitDisabled }"
          >
            <span v-if="submitDisabled" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>
              Pay $9.95
            </span>
          </button>
        </div>
      </div>
  
      <!-- Success Message -->
      <div v-if="paymentSuccess" class="text-center p-6">
        <div class="bg-green-100 rounded-full p-3 inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
        <p class="text-gray-600 mb-6">Your premium reliability report has been unlocked.</p>
        <button 
          @click="$emit('payment-complete', paymentIntentId)"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300"
        >
          View Your Report
        </button>
      </div>
  
      <!-- Stripe Error -->
      <div v-if="paymentError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600">{{ paymentError }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { loadStripe } from '@stripe/stripe-js';
  const stripePublishableKey =  'pk_test_51NsR7aHLwqMTlbjZEFhDdSZSpGfy3eHESYBksq2F8C26PkDM5b0smhjPNJw2Qi3oJdwEt1eKiaDKvIpUXCG7R8er00DKqRGL7J'
  export default {
    name: 'PaymentForm',
    emits: ['payment-complete'],
    
    setup(props, { emit }) {
      const stripe = ref(null);
      const elements = ref(null);
      const cardElement = ref(null);
      const clientSecret = ref('');
      const paymentMethod = ref('card');
      const paymentProcessing = ref(false);
      const paymentSuccess = ref(false);
      const paymentError = ref('');
      const submitDisabled = ref(false);
      const paymentIntentId = ref('');
     
      onMounted(async () => {
        // Initialize Stripe
        stripe.value = await loadStripe(stripePublishableKey);
        
        // Create a payment intent
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency: 'usd' })
          });
          
          const data = await response.json();
          clientSecret.value = data.clientSecret;
          
          // Create card element
          elements.value = stripe.value.elements();
          cardElement.value = elements.value.create('card', {
            style: {
              base: {
                color: '#32325d',
                fontFamily: '"Inter", sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            }
          });
          
          // Mount the card element
          cardElement.value.mount('#card-element');
          
          // Handle validation errors
          cardElement.value.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
              displayError.textContent = event.error.message;
            } else {
              displayError.textContent = '';
            }
          });
        } catch (error) {
          console.error('Error initializing payment:', error);
          paymentError.value = 'Could not initialize payment form. Please try again.';
        }
      });
  
      // Handle card submission
      const handleSubmit = async () => {
        if (!stripe.value || !elements.value) {
          return;
        }
        
        submitDisabled.value = true;
        paymentProcessing.value = true;
        paymentError.value = '';
        
        try {
          const result = await stripe.value.confirmCardPayment(clientSecret.value, {
            payment_method: {
              card: cardElement.value,
              billing_details: {
                // You can collect billing details here if needed
              }
            }
          });
          
          if (result.error) {
            // Show error to customer
            paymentError.value = result.error.message;
            submitDisabled.value = false;
            paymentProcessing.value = false;
          } else {
            // Payment succeeded
            if (result.paymentIntent.status === 'succeeded') {
              paymentSuccess.value = true;
              paymentProcessing.value = false;
              paymentIntentId.value = result.paymentIntent.id;
            }
          }
        } catch (error) {
          console.error('Payment error:', error);
          paymentError.value = 'An unexpected error occurred. Please try again.';
          submitDisabled.value = false;
          paymentProcessing.value = false;
        }
      };
  
      // Handle Stripe Checkout
      const useCheckout = async () => {
        try {
          paymentProcessing.value = true;
          
          const response = await fetch('/api/subscriptions/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId: process.env.VUE_APP_STRIPE_PRICE_ID })
          });
          
          const { url } = await response.json();
          
          // Redirect to Stripe Checkout
          window.location.href = url;
        } catch (error) {
          console.error('Checkout error:', error);
          paymentError.value = 'Could not initialize checkout. Please try again.';
          paymentProcessing.value = false;
        }
      };
  
      return {
        stripe,
        elements,
        clientSecret,
        paymentMethod,
        paymentProcessing,
        paymentSuccess,
        paymentError,
        submitDisabled,
        paymentIntentId,
        handleSubmit,
        useCheckout
      };
    }
  };
  </script>