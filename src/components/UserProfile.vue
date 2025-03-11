<!-- src/components/UserProfile.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">My Account</h2>
            <button @click="handleLogout"
                class="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition">
                Logout
            </button>
        </div>

        <div v-if="authStore.user" class="space-y-6">
            <!-- User Details -->
            <div>
                <h3 class="text-lg font-medium mb-2">User Information</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                    <p class="mb-1"><span class="font-medium">Email:</span> {{ authStore.user.email }}</p>
                    <p><span class="font-medium">Member since:</span> {{ formatDate(authStore.user.created_at) }}</p>
                </div>
            </div>

            <!-- Subscription Status -->
            <div>
                <h3 class="text-lg font-medium mb-2">Subscription Status</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                    <div v-if="authStore.isPremium" class="flex items-center">
                        <div class="rounded-full bg-green-100 p-1 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-green-800">Premium Account</p>
                            <p class="text-sm text-gray-600">You have access to all premium features</p>
                        </div>
                    </div>
                    <div v-else>
                        <p class="mb-2"><span class="font-medium">Status:</span> Free Account</p>
                        <button @click="$emit('upgrade')"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>

            <!-- Search History -->
            <div v-if="searches.length > 0">
                <h3 class="text-lg font-medium mb-2">Recent Searches</h3>
                <div class="bg-gray-50 p-4 rounded-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date</th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicle</th>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mileage</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="(search, index) in searches" :key="index" class="hover:bg-gray-50">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm">{{ formatDate(search.created_at) }}
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm">{{ search.year }} {{ search.make }}
                                        {{ search.model }}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm">{{ search.mileage }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import authStore from '../store/auth';

export default {
    name: 'UserProfile',
    emits: ['logout', 'upgrade'],

    setup(props, { emit }) {
        const searches = ref([]);

        // Format date for display
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString();
        };

        // Logout handler
        const handleLogout = () => {
            authStore.logout();
            emit('logout');
        };

        // Fetch user's search history
        const fetchSearchHistory = async () => {
            if (!authStore.isLoggedIn.value) return;

            try {
                const response = await axios.get('/user/searches', {
                    headers: {
                        'Authorization': `Bearer ${authStore.token.value}`
                    }
                });

                searches.value = response.data || [];
            } catch (error) {
                console.error('Error fetching search history:', error);
            }
        };

        onMounted(() => {
            fetchSearchHistory();
        });

        return {
            authStore,
            searches,
            formatDate,
            handleLogout
        };
    }
};
</script>