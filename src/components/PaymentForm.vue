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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <span>Complete reliability breakdown for all vehicle systems</span>
          </li>
          <li class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <span>Detailed list of common issues with repair costs</span>
          </li>
          <li class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <span>AI-powered analysis comparing to similar vehicles</span>
          </li>
          <li class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
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
        <button @click="paymentMethod = 'card'"
          class="p-3 border rounded-md flex items-center justify-center transition-colors"
          :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'">
          <span class="font-medium">Credit Card</span>
        </button>
        <button @click="paymentMethod = 'direct'"
          class="p-3 border rounded-md flex items-center justify-center transition-colors"
          :class="paymentMethod === 'direct' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'">
          <span class="font-medium">Direct Payment</span>
        </button>
      </div>
    </div>

    <!-- Card Payment Form via Stripe Elements-->
    <div v-if="paymentMethod === 'card' && !paymentProcessing && !paymentSuccess">
      <div v-if="!clientSecret" class="text-center p-4">
        <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="mt-2 text-gray-600">Initializing payment form...</p>
      </div>

      <div v-else>
        <div id="card-element" class="border border-gray-300 p-4 rounded-md mb-4"></div>
        <div id="card-errors" class="text-red-500 mb-4" role="alert"></div>

        <button @click="handleSubmit" :disabled="!stripe || !elements || submitDisabled"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
          :class="{ 'opacity-70 cursor-not-allowed': !stripe || !elements || submitDisabled }">
          <span v-if="submitDisabled" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            Processing...
          </span>
          <span v-else>
            Pay $9.95
          </span>
        </button>
      </div>
    </div>

    <!-- Direct Card Form -->
    <div v-if="paymentMethod === 'direct' && !paymentProcessing && !paymentSuccess">
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Card Number</label>
        <input type="text" v-model="cardNumber" placeholder="1234 5678 9012 3456"
          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="16" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-2">Expiry Date</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" v-model="expMonth" placeholder="MM"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxlength="2" />
            <input type="text" v-model="expYear" placeholder="YY"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxlength="2" />
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-2">CVC</label>
          <input type="text" v-model="cvc" placeholder="123"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="3" />
        </div>
      </div>

      <div v-if="directPaymentError" class="text-red-500 mb-4">{{ directPaymentError }}</div>

      <button @click="handleDirectPayment" :disabled="directProcessing || !isDirectFormValid"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
        :class="{ 'opacity-70 cursor-not-allowed': directProcessing || !isDirectFormValid }">
        <span v-if="directProcessing" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          Processing...
        </span>
        <span v-else>
          Pay $9.95
        </span>
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="paymentSuccess" class="text-center p-6">
      <div class="bg-green-100 rounded-full p-3 inline-block mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
      <p class="text-gray-600 mb-6">Your premium reliability report has been unlocked.</p>
      <button @click="$emit('payment-complete', paymentIntentId)"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300">
        View Your Report
      </button>
    </div>

    <!-- Payment Error -->
    <div v-if="paymentError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600">{{ paymentError }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePublishableKey = 'pk_test_51NsR7aHLwqMTlbjZEFhDdSZSpGfy3eHESYBksq2F8C26PkDM5b0smhjPNJw2Qi3oJdwEt1eKiaDKvIpUXCG7R8er00DKqRGL7J';
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://car-reliability-app.vercel.app';

export default {
  name: 'PaymentForm',
  emits: ['payment-complete'],

  setup(props, { emit }) {
    // Stripe Elements
    const stripe = ref(null);
    const elements = ref(null);
    const cardElement = ref(null);
    const clientSecret = ref('');
    const submitDisabled = ref(false);

    // Direct card form
    const cardNumber = ref('');
    const expMonth = ref('');
    const expYear = ref('');
    const cvc = ref('');
    const directProcessing = ref(false);
    const directPaymentError = ref('');

    // Shared state
    const paymentMethod = ref('card');
    const paymentProcessing = ref(false);
    const paymentSuccess = ref(false);
    const paymentError = ref('');
    const paymentIntentId = ref('');

    // Check if direct form is valid
    const isDirectFormValid = computed(() => {
      return cardNumber.value?.length === 16 &&
        expMonth.value?.length === 2 &&
        expYear.value?.length === 2 &&
        cvc.value?.length === 3;
    });

    // Initialize Stripe on mount
    onMounted(async () => {
      stripe.value = await loadStripe(stripePublishableKey);
      await initializePaymentIntent();
    });

    // Create a payment intent
    const initializePaymentIntent = async () => {
      try {
        // Authenticate request if user is logged in
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await axios.post(`${apiBaseUrl}/api/create-payment-intent`, {
          plan: 'premium'
        }, { headers });

        clientSecret.value = response.data.clientSecret;
        paymentIntentId.value = response.data.paymentIntentId;

        // Initialize Stripe Elements
        if (stripe.value) {
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

          // Mount card element with a small delay to ensure the DOM is ready
          setTimeout(() => {
            const cardElementContainer = document.getElementById('card-element');
            if (cardElementContainer) {
              cardElement.value.mount('#card-element');

              // Handle validation errors
              cardElement.value.on('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (displayError) {
                  if (event.error) {
                    displayError.textContent = event.error.message;
                  } else {
                    displayError.textContent = '';
                  }
                }
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error initializing payment:', error);
        paymentError.value = 'Could not initialize payment form. Please try again.';
      }
    };

    // Process payment with Stripe Elements
    const handleSubmit = async () => {
      if (!stripe.value || !elements.value || !cardElement.value) {
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
              // Optional billing details can be added here
            }
          }
        });

        if (result.error) {
          paymentError.value = result.error.message;
          submitDisabled.value = false;
          paymentProcessing.value = false;
        } else {
          await verifyPayment(paymentIntentId.value);
        }
      } catch (error) {
        console.error('Payment error:', error);
        paymentError.value = 'An unexpected error occurred. Please try again.';
        submitDisabled.value = false;
        paymentProcessing.value = false;
      }
    };

    // Process direct card payment
    const handleDirectPayment = async () => {
      if (!isDirectFormValid.value) {
        return;
      }

      directProcessing.value = true;
      paymentProcessing.value = true;
      directPaymentError.value = '';
      paymentError.value = '';

      try {
        // Authenticate request if user is logged in
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await axios.post(`${apiBaseUrl}/api/process-card-payment`, {
          cardNumber: cardNumber.value,
          expMonth: parseInt(expMonth.value),
          expYear: parseInt(`20${expYear.value}`), // Convert to full year
          cvc: cvc.value,
          plan: 'premium'
        }, { headers });

        if (response.data.success) {
          // Payment succeeded directly
          paymentSuccess.value = true;

          // Store access token for premium features
          if (response.data.subscription?.accessToken) {
            localStorage.setItem('premiumToken', response.data.subscription.accessToken);
            localStorage.setItem('isPremium', 'true');
          }

          // Store payment ID if available
          if (response.data.paymentIntentId) {
            paymentIntentId.value = response.data.paymentIntentId;
          }
        } else if (response.data.requires_action) {
          // Handle 3D Secure authentication if needed
          handleRequiresAction(response.data.payment_intent_client_secret);
        } else {
          // Payment failed
          directPaymentError.value = response.data.message || 'Payment failed. Please try again.';
        }
      } catch (error) {
        console.error('Direct payment error:', error);
        directPaymentError.value = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
      } finally {
        directProcessing.value = false;
        paymentProcessing.value = false;
      }
    };

    // Handle 3D Secure authentication
    const handleRequiresAction = async (clientSecret) => {
      if (!stripe.value) return;

      paymentProcessing.value = true;

      try {
        const result = await stripe.value.handleCardAction(clientSecret);

        if (result.error) {
          // 3D Secure authentication failed
          directPaymentError.value = result.error.message;
          paymentProcessing.value = false;
        } else {
          // Verify the payment status after 3D Secure
          await verifyPayment(result.paymentIntent.id);
        }
      } catch (error) {
        console.error('3D Secure error:', error);
        directPaymentError.value = 'Authentication failed. Please try again.';
        paymentProcessing.value = false;
      }
    };

    // Verify payment status via API
    const verifyPayment = async (paymentId) => {
      try {
        // Authenticate request if user is logged in
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await axios.post(`${apiBaseUrl}/api/check-payment-status`, {
          paymentIntentId: paymentId
        }, { headers });

        if (response.data.success) {
          paymentSuccess.value = true;
          paymentIntentId.value = paymentId;

          // Store access token for premium features
          if (response.data.subscription?.accessToken) {
            localStorage.setItem('premiumToken', response.data.subscription.accessToken);
            localStorage.setItem('isPremium', 'true');
          }
        } else {
          paymentError.value = response.data.message || 'Payment verification failed. Please contact support.';
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        paymentError.value = 'Failed to verify payment status. Please contact support.';
      } finally {
        paymentProcessing.value = false;
        submitDisabled.value = false;
      }
    };

    return {
      // Stripe Elements
      stripe,
      elements,
      clientSecret,
      submitDisabled,

      // Direct card form
      cardNumber,
      expMonth,
      expYear,
      cvc,
      directProcessing,
      directPaymentError,
      isDirectFormValid,

      // Shared state
      paymentMethod,
      paymentProcessing,
      paymentSuccess,
      paymentError,
      paymentIntentId,

      // Methods
      handleSubmit,
      handleDirectPayment
    };
  }
};
</script>