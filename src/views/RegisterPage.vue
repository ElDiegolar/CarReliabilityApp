<!-- src/views/RegisterPage.vue -->
<template>
    <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <div class="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-800" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path
                        d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 00-1-1H3V4zM13 15h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-1a1 1 0 00-1-1h-6v3z" />
                    <path d="M15 4a1 1 0 00-1 1v3a1 1 0 001 1h5a1 1 0 001-1V5a1 1 0 00-1-1h-5z" />
                </svg>
            </div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create your account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Or
                <router-link :to="{ name: 'Login' }" class="font-medium text-blue-600 hover:text-blue-500">
                    sign in to your existing account
                </router-link>
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div v-if="error" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                    <div class="flex items-center">
                        <svg class="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-sm text-red-700">{{ error }}</p>
                    </div>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                            Full name
                        </label>
                        <div class="mt-1">
                            <input id="name" v-model="name" name="name" type="text" autocomplete="name" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <div class="mt-1">
                            <input id="email" v-model="email" name="email" type="email" autocomplete="email" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700">
                            Phone number (optional)
                        </label>
                        <div class="mt-1">
                            <input id="phone" v-model="phone" name="phone" type="tel" autocomplete="tel"
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div class="mt-1">
                            <input id="password" v-model="password" name="password" type="password"
                                autocomplete="new-password" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                            Confirm password
                        </label>
                        <div class="mt-1">
                            <input id="confirmPassword" v-model="confirmPassword" name="confirmPassword" type="password"
                                autocomplete="new-password" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>

                    <div class="flex items-center">
                        <input id="marketing-emails" name="marketing-emails" type="checkbox" v-model="marketingEmails"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label for="marketing-emails" class="ml-2 block text-sm text-gray-900">
                            I agree to receive marketing emails about new features and offers
                        </label>
                    </div>

                    <div>
                        <button type="submit" :disabled="loading"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            {{ loading ? 'Creating account...' : 'Create account' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

export default {
    name: 'RegisterPage',

    setup() {
        const router = useRouter();

        // Form fields
        const name = ref('');
        const email = ref('');
        const phone = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const marketingEmails = ref(true);

        // UI state
        const loading = ref(false);
        const error = ref('');

        // Handle form submission
        const handleRegister = async () => {
            // Clear previous errors
            error.value = '';

            // Validate form
            if (!name.value || !email.value || !password.value) {
                error.value = 'Please fill in all required fields';
                return;
            }

            if (password.value !== confirmPassword.value) {
                error.value = 'Passwords do not match';
                return;
            }

            if (password.value.length < 8) {
                error.value = 'Password must be at least 8 characters long';
                return;
            }

            // Submit registration request
            loading.value = true;

            try {
                const userData = {
                    name: name.value,
                    email: email.value,
                    phone: phone.value,
                    password: password.value
                };

                const response = await authService.register(userData);
                console.log('Registration successful:', response);

                // Redirect to home page or profile setup
                router.push('/');
            } catch (err) {
                console.error('Registration error:', err);
                error.value = err.response?.data?.error ||
                    'Failed to create account. Please try again.';
            } finally {
                loading.value = false;
            }
        };

        return {
            name,
            email,
            phone,
            password,
            confirmPassword,
            marketingEmails,
            loading,
            error,
            handleRegister
        };
    }
};
</script>