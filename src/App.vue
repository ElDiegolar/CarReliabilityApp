<!-- src/App.vue -->
<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Navigation Bar -->
        <AppNavbar :key="authStore.isLoggedIn" @login="showAuth = true; authMode = 'login'"
            @register="showAuth = true; authMode = 'register'" @view-profile="showProfile = true"
            @upgrade="showPaymentOptions = true" @logout="handleLogout" />

        <!-- Main Content -->
        <main class="py-8">
            <!-- Auth Modal -->
            <div v-if="showAuth" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                <div class="max-w-md w-full">
                    <div class="bg-white rounded-lg shadow-xl p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">{{ authMode === 'login' ? 'Login' : 'Register' }}</h2>
                            <button @click="showAuth = false" class="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <LoginForm v-if="authMode === 'login'" @login-success="handleAuthSuccess"
                            @switch-to-register="authMode = 'register'" />
                        <RegisterForm v-else @register-success="handleAuthSuccess"
                            @switch-to-login="authMode = 'login'" />
                    </div>
                </div>
            </div>

            <!-- Profile Modal -->
            <div v-if="showProfile"
                class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                <div class="max-w-2xl w-full">
                    <div class="bg-white rounded-lg shadow-xl p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">My Profile</h2>
                            <button @click="showProfile = false" class="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <UserProfile @logout="showProfile = false"
                            @upgrade="showProfile = false; showPaymentOptions = true" />
                    </div>
                </div>
            </div>

            <!-- Car Reliability App -->
            <div v-if="!showPaymentOptions && !showTokenInput" class="container mx-auto px-4">
                <CarReliabilityApp @show-premium="showPaymentOptions = true" :isPremiumUser="authStore.isPremium"
                    :premiumToken="premiumToken" />
            </div>

            <!-- Payment Options -->
            <div v-if="showPaymentOptions" class="container mx-auto px-4">
                <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-semibold">Upgrade to Premium</h2>
                        <button @click="showPaymentOptions = false" class="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <!-- Payment options content would go here -->
                    <div class="mb-6">
                        <h3 class="text-lg font-medium mb-4">Choose a Payment Option</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Basic Plan -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="mb-4">
                                    <h4 class="text-xl font-medium">Basic Plan</h4>
                                    <p class="text-gray-600 mb-2">Access to expanded vehicle data</p>
                                    <p class="text-2xl font-bold text-blue-600">$4.99</p>
                                </div>
                                <button @click="handlePayment('basic')"
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                                    Purchase Basic
                                </button>
                            </div>

                            <!-- Premium Plan -->
                            <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <div class="mb-4">
                                    <div class="flex justify-between items-start">
                                        <h4 class="text-xl font-medium">Premium Plan</h4>
                                        <span
                                            class="bg-blue-600 text-white text-xs px-2 py-1 rounded">RECOMMENDED</span>
                                    </div>
                                    <p class="text-gray-600 mb-2">Full access to all premium features</p>
                                    <p class="text-2xl font-bold text-blue-600">$9.99</p>
                                </div>
                                <button @click="handlePayment('premium')"
                                    class="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md">
                                    Purchase Premium
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-md">
                        <h3 class="text-lg font-medium mb-2">Already have a token?</h3>
                        <button @click="showPaymentOptions = false; showTokenInput = true"
                            class="text-blue-600 hover:text-blue-800 font-medium">
                            Enter your access token
                        </button>
                    </div>
                </div>
            </div>

            <!-- Token Input -->
            <div v-if="showTokenInput" class="container mx-auto px-4">
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-semibold">Enter Access Token</h2>
                        <button @click="showTokenInput = false" class="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="mb-4">
                        <label for="access-token" class="block text-sm font-medium text-gray-700 mb-1">Access
                            Token</label>
                        <input type="text" id="access-token" v-model="tokenInput"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your access token" />
                    </div>

                    <div v-if="tokenError" class="mb-4 p-3 text-sm bg-red-50 text-red-500 rounded-md">
                        {{ tokenError }}
                    </div>

                    <button @click="verifyToken"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-4"
                        :disabled="!tokenInput || tokenLoading">
                        <span v-if="tokenLoading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Verifying...
                        </span>
                        <span v-else>Verify Token</span>
                    </button>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white mt-12 py-6 border-t">
            <div class="max-w-6xl mx-auto px-4">
                <p class="text-center text-gray-500 text-sm">
                    © {{ new Date().getFullYear() }} Vehicle Reliability AI. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import AppNavbar from './components/AppNavbar.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import UserProfile from './components/UserProfile.vue';
import CarReliabilityApp from './components/CarReliabilityApp.vue';
import authStore from './store/auth';

export default {
    name: 'App',
    components: {
        AppNavbar,
        LoginForm,
        RegisterForm,
        UserProfile,
        CarReliabilityApp
    },

    setup() {
        // Auth state
        const showAuth = ref(false);
        const authMode = ref('login');
        const showProfile = ref(false);

        // Payment state
        const showPaymentOptions = ref(false);
        const showTokenInput = ref(false);
        const tokenInput = ref('');
        const tokenError = ref('');
        const tokenLoading = ref(false);
        const premiumToken = ref(localStorage.getItem('accessToken') || '');

        // Handle successful login/registration
        const handleAuthSuccess = (userData) => {
            showAuth.value = false;
        };

        // Handle payment selection
        const handlePayment = (plan) => {
            // In a real app, this would redirect to Stripe or another payment processor
            alert(`Selected plan: ${plan}. In a real app, this would redirect to a payment page.`);

            // For demo purposes, we'll simulate a successful payment
            setTimeout(() => {
                const demoToken = `demo-${plan}-${Date.now()}`;
                premiumToken.value = demoToken;
                localStorage.setItem('accessToken', demoToken);
                localStorage.setItem('isPremium', 'true');
                authStore.isPremium.value = true;

                showPaymentOptions.value = false;
                alert('Demo payment successful! Premium features unlocked.');
            }, 1500);
        };

        const handleLogout = () => {
            console.log("App received logout event");
            // Show the login form
            showAuth.value = true;
            authMode.value = 'login';

            // Close any open modals
            showProfile.value = false;
            showPaymentOptions.value = false;
            showTokenInput.value = false;
            // Force page refresh to clear UI state
            window.location.reload();
        };
        // Verify token
        const verifyToken = async () => {
            if (!tokenInput.value) return;

            tokenLoading.value = true;
            tokenError.value = '';

            try {
                const response = await axios.post('/verify-token', {
                    token: tokenInput.value
                });

                if (response.data.isPremium) {
                    // Store token
                    premiumToken.value = tokenInput.value;
                    localStorage.setItem('accessToken', tokenInput.value);
                    localStorage.setItem('isPremium', 'true');
                    authStore.isPremium.value = true;

                    showTokenInput.value = false;
                    alert('Token verified successfully! Premium features unlocked.');
                } else {
                    tokenError.value = 'Invalid or expired token';
                }
            } catch (error) {
                console.error('Token verification error:', error);
                tokenError.value = error.response?.data?.error || 'Failed to verify token';
            } finally {
                tokenLoading.value = false;
            }
        };

        // Check for token on mount
        onMounted(() => {
            // Check if user has premium token
            if (premiumToken.value) {
                authStore.isPremium.value = true;
            }
        });

        return {
            authStore,
            showAuth,
            authMode,
            showProfile,
            showPaymentOptions,
            showTokenInput,
            tokenInput,
            tokenError,
            tokenLoading,
            premiumToken,
            handleAuthSuccess,
            handlePayment,
            verifyToken
        };
    }
};
</script>