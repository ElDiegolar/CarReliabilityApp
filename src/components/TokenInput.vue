<!-- src/components/TokenInput.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Enter Your Premium Token</h2>
        <p class="text-gray-600 mb-6">
            Enter the token you received after completing your payment to unlock premium features.
        </p>

        <div class="mb-4">
            <label for="token" class="block text-gray-700 mb-2">Token</label>
            <input type="text" id="token" v-model="tokenInput" placeholder="Enter your premium token"
                class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="verifying" />
        </div>

        <div v-if="error" class="mb-4 text-red-500">
            {{ error }}
        </div>

        <button @click="verifyToken"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 w-full"
            :disabled="verifying || !tokenInput">
            <span v-if="verifying" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                Verifying...
            </span>
            <span v-else>
                Unlock Premium Features
            </span>
        </button>

        <div class="mt-4 text-center">
            <button @click="$emit('cancel')" class="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Go back
            </button>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
    name: 'TokenInput',
    emits: ['token-verified', 'cancel'],

    setup(props, { emit }) {
        const tokenInput = ref('');
        const verifying = ref(false);
        const error = ref('');

        // For demonstration, we'll use a hardcoded token
        // In a real app, this would be verified by your backend
        const verifyToken = async () => {
            if (!tokenInput.value) return;

            verifying.value = true;
            error.value = '';

            try {
                // In a real implementation, verify with your backend
                const response = await axios.post('/verify-premium', {
                    token: tokenInput.value
                });

                if (response.data.isPremium) {
                    // Store token in localStorage
                    localStorage.setItem('premiumToken', tokenInput.value);

                    // Emit event with token
                    emit('token-verified', tokenInput.value);
                } else {
                    error.value = response.data.message || 'Invalid token. Please check and try again.';
                }
            } catch (err) {
                console.error('Token verification error:', err);
                error.value = 'An error occurred while verifying your token. Please try again.';
            } finally {
                verifying.value = false;
            }
        };

        return {
            tokenInput,
            verifying,
            error,
            verifyToken
        };
    }
}
</script>