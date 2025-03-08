<!-- src/components/PaymentCancel.vue -->
<template>
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
    <div class="mb-6">
      <div class="bg-yellow-100 rounded-full p-4 inline-block">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    </div>
    
    <h1 class="text-3xl font-bold text-gray-800 mb-3">Payment Cancelled</h1>
    <p class="text-gray-600 text-lg mb-6">Your payment was not completed.</p>
    
    <div class="flex flex-col items-center justify-center space-y-4">
      <button 
        @click="$emit('try-again')"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition duration-300"
      >
        Try Again
      </button>
      
      <button 
        @click="$emit('continue-free')"
        class="text-blue-600 hover:text-blue-800 font-medium transition duration-300"
      >
        Continue with Free Report
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentCancel',
  emits: ['try-again', 'continue-free']
};
</script>