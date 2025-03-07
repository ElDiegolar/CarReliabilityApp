<!-- src/components/RegisterForm.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4">Create Account</h2>

        <form @submit.prevent="handleRegister">
            <!-- Email field -->
            <div class="mb-4">
                <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="reg-email" v-model="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required placeholder="Enter your email" />
            </div>

            <!-- Password field -->
            <div class="mb-4">
                <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="reg-password" v-model="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required placeholder="Create a password" minlength="8" />
                <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
            </div>

            <!-- Confirm Password field -->
            <div class="mb-6">
                <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm
                    Password</label>
                <input type="password" id="confirm-password" v-model="confirmPassword"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required placeholder="Confirm your password" />
                <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
                    Passwords don't match
                </p>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mb-4 p-3 text-sm bg-red-50 text-red-500 rounded-md">
                {{ error }}
            </div>

            <!-- Submit button -->
            <button type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                :disabled="loading || passwordMismatch">
                <span v-if="loading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Creating Account...
                </span>
                <span v-else>Register</span>
            </button>

            <!-- Login link -->
            <div class="mt-4 text-center text-sm">
                <p class="text-gray-600">
                    Already have an account?
                    <button type="button" @click="$emit('switch-to-login')"
                        class="text-blue-600 hover:text-blue-700 font-medium">
                        Log In
                    </button>
                </p>
            </div>
        </form>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import authStore from '../store/auth';

export default {
    name: 'RegisterForm',
    emits: ['register-success', 'switch-to-login'],

    setup(props, { emit }) {
        const email = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const loading = ref(false);
        const error = ref('');

        const passwordMismatch = computed(() => {
            return confirmPassword.value && password.value !== confirmPassword.value;
        });

        const handleRegister = async () => {
            if (!email.value || !password.value) {
                error.value = 'Please fill in all fields';
                return;
            }

            if (password.value.length < 8) {
                error.value = 'Password must be at least 8 characters';
                return;
            }

            if (password.value !== confirmPassword.value) {
                error.value = 'Passwords do not match';
                return;
            }

            loading.value = true;
            error.value = '';

            try {
                const result = await authStore.register(email.value, password.value);
                emit('register-success', result);
            } catch (err) {
                error.value = err.response?.data?.error || 'Registration failed. Please try again.';
            } finally {
                loading.value = false;
            }
        };

        // Clear password mismatch error when user types in confirm password field
        watch(confirmPassword, () => {
            if (error.value === 'Passwords do not match') {
                error.value = '';
            }
        });

        return {
            email,
            password,
            confirmPassword,
            loading,
            error,
            passwordMismatch,
            handleRegister
        };
    }
};
</script>