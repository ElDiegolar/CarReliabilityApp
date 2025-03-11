<!-- src/components/PaymentOptions.vue -->
<template>
    <div class="payment-container bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-6">Premium Reliability Report</h2>

        <div class="mb-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 class="text-xl font-medium text-blue-800">Get the Full Analysis</h3>
                    <p class="text-gray-600 mb-2">Unlock comprehensive insights about your vehicle's reliability</p>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-md mb-6">
                <h4 class="font-medium mb-2">What You'll Get:</h4>
                <ul class="space-y-2">
                    <li class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span>Complete reliability breakdown for all vehicle systems</span>
                    </li>
                    <li class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span>Detailed list of common issues with repair costs</span>
                    </li>
                    <li class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span>AI-powered analysis comparing to similar vehicles</span>
                    </li>
                    <li class="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            viewBox="0 0 20 20" fill="currentColor">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="border border-gray-200 rounded-lg p-4 flex flex-col">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold mb-2 text-blue-800">Basic Report</h3>
                    <p class="text-gray-500 mb-2">Single vehicle report with standard features</p>
                    <div class="text-2xl font-bold text-blue-800 mb-4">$4.99</div>
                    <ul class="space-y-1 mb-6">
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Single report access</span>
                        </li>
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Common issues & fixes</span>
                        </li>
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Basic reliability score</span>
                        </li>
                    </ul>
                </div>
                <a :href="basicPaymentLink" target="_blank"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center">
                    Get Basic Report
                </a>
            </div>

            <div class="border border-blue-200 rounded-lg p-4 bg-blue-50 flex flex-col">
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold mb-2 text-blue-800">Premium Report</h3>
                        <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded">RECOMMENDED</span>
                    </div>
                    <p class="text-gray-500 mb-2">Full analysis with detailed insights</p>
                    <div class="text-2xl font-bold text-blue-800 mb-4">$9.99</div>
                    <ul class="space-y-1 mb-6">
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span><strong>Everything in Basic</strong></span>
                        </li>
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Detailed AI analysis</span>
                        </li>
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Repair cost estimates</span>
                        </li>
                        <li class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>All system reliability scores</span>
                        </li>
                    </ul>
                </div>
                <a :href="premiumPaymentLink" target="_blank"
                    class="bg-blue-800 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center">
                    Get Premium Report
                </a>
            </div>
        </div>

        <div class="text-center text-gray-500 text-sm">
            <p>After payment, you'll receive a token to unlock your premium report</p>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'PaymentOptions',
  emits: ['payment-complete'],
  
  setup() {
    const loading = ref(false);
    const error = ref('');
    
    const handlePayment = async (plan) => {
      loading.value = true;
      error.value = '';
      
      try {
        // Store selected plan for later verification
        localStorage.setItem('selectedPlan', plan);
        
        // Determine price ID based on plan
        const priceId = plan === 'premium' 
          ? 'price_premium_id' 
          : 'price_basic_id';
        
        // Create checkout session
        const response = await axios.post('/api/create-checkout-session', {
          priceId,
          plan
        });
        
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } catch (err) {
        console.error('Payment error:', err);
        error.value = 'Failed to initialize payment. Please try again.';
        loading.value = false;
      }
    };
    
    return {
      loading,
      error,
      handlePayment
    };
  }
};

</script>