<!-- src/components/LoginForm.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4">Log In</h2>

        <form @submit.prevent="handleLogin">
            <!-- Email field -->
            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" v-model="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required placeholder="Enter your email" />
            </div>

            <!-- Password field -->
            <div class="mb-6">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="password" v-model="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required placeholder="Enter your password" />
            </div>

            <!-- Error message -->
            <div v-if="error" class="mb-4 p-3 text-sm bg-red-50 text-red-500 rounded-md">
                {{ error }}
            </div>

            <!-- Submit button -->
            <button type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                :disabled="loading">
                <span v-if="loading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Logging in...
                </span>
                <span v-else>Log In</span>
            </button>

            <!-- Register link -->
            <div class="mt-4 text-center text-sm">
                <p class="text-gray-600">
                    Don't have an account?
                    <button type="button" @click="$emit('switch-to-register')"
                        class="text-blue-600 hover:text-blue-700 font-medium">
                        Register
                    </button>
                </p>
            </div>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import authStore from '../store/auth';

export default {
    name: 'LoginForm',
    emits: ['login-success', 'switch-to-register'],

    setup(props, { emit }) {
        const email = ref('');
        const password = ref('');
        const loading = ref(false);
        const error = ref('');

        const handleLogin = async () => {
            if (!email.value || !password.value) {
                error.value = 'Please enter both email and password';
                return;
            }

            loading.value = true;
            error.value = '';

            try {
                const result = await authStore.login(email.value, password.value);
                emit('login-success', result);
            } catch (err) {
                error.value = err.response?.data?.error || 'Login failed. Please check your credentials.';
            } finally {
                loading.value = false;
            }
        };

        return {
            email,
            password,
            loading,
            error,
            handleLogin
        };
    }
};
</script>