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

        <div v-if="userDetails" class="space-y-6">
            <!-- User Details -->
            <div>
                <h3 class="text-lg font-medium mb-2">User Information</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                    <p class="mb-1"><span class="font-medium">Email:</span> {{ userDetails.email }}</p>
                    <p><span class="font-medium">Member since:</span> {{ formatDate(userDetails.created_at) }}</p>
                </div>
            </div>

            <!-- Subscription Status -->
            <div>
                <h3 class="text-lg font-medium mb-2">Subscription Status</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                    <div v-if="userPremiumStatus" class="flex items-center">
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

            <!-- Debug Status (Remove in production) -->
            <div class="bg-gray-100 p-3 text-sm rounded-md border border-gray-300">
                <p>Debug Info (Remove in production):</p>
                <p>authStore.isPremium: {{ authStore.isPremium }}</p>
                <p>localStorage.isPremium: {{ localStorage.getItem('isPremium') === 'true' }}</p>
                <p>userPremiumStatus: {{ userPremiumStatus }}</p>
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
            
            <!-- No Search History Message -->
            <div v-else-if="!searchesLoading" class="bg-gray-50 p-4 rounded-md text-center">
                <p class="text-gray-600">No search history available</p>
            </div>
            
            <!-- Loading Search History -->
            <div v-else class="bg-gray-50 p-4 rounded-md text-center">
                <p class="text-gray-600">Loading search history...</p>
            </div>
        </div>
        
        <!-- Loading User Data -->
        <div v-else class="py-8 text-center">
            <svg class="animate-spin h-10 w-10 mx-auto text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading user profile...</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import axios from 'axios';
import authStore from '../store/auth';

export default {
    name: 'UserProfile',
    emits: ['logout', 'upgrade'],

    setup(props, { emit }) {
        const userDetails = ref(null);
        const searches = ref([]);
        const searchesLoading = ref(true);
        const baseApiUrl = process.env.VUE_APP_API_BASE_URL || 'https://car-reliability-app.vercel.app';
        
        // Get localStorage directly for debugging
        const localStorage = window.localStorage;
        
        // Computed property for premium status that checks multiple sources
        const userPremiumStatus = computed(() => {
            // Check multiple sources to ensure we catch the premium status
            return (
                authStore.isPremium.value === true || 
                localStorage.getItem('isPremium') === 'true' ||
                (userDetails.value && userDetails.value.subscription && 
                 userDetails.value.subscription.status === 'active')
            );
        });

        // Format date for display
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString();
            } catch (e) {
                console.error('Error formatting date:', e);
                return 'N/A';
            }
        };

        // Logout handler
        const handleLogout = () => {
            authStore.logout();
            emit('logout');
        };

        // Fetch user profile data
        const fetchUserProfile = async () => {
            if (!authStore.isLoggedIn.value || !authStore.token.value) {
                // If not logged in, use local storage data
                userDetails.value = authStore.user.value;
                return;
            }

            try {
                const response = await axios.get(`${baseApiUrl}/api/profile`, {
                    headers: {
                        'Authorization': `Bearer ${authStore.token.value}`
                    }
                });

                console.log('Profile API response:', response.data);

                if (response.data && response.data.user) {
                    userDetails.value = response.data.user;
                    
                    // Update auth store with the latest data
                    authStore.user.value = response.data.user;
                    
                    // Very important: update the premium status
                    if (response.data.isPremium) {
                        authStore.isPremium.value = true;
                        localStorage.setItem('isPremium', 'true');
                        console.log('Setting premium status to true from API');
                    }
                    
                    // Update localStorage
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    // Fallback to stored user data
                    userDetails.value = authStore.user.value;
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Fallback to stored user data
                userDetails.value = authStore.user.value;
            }
        };

        // Fetch user's search history
        const fetchSearchHistory = async () => {
            if (!authStore.isLoggedIn.value || !authStore.token.value) {
                searchesLoading.value = false;
                return;
            }

            try {
                const response = await axios.get(`${baseApiUrl}/api/user/searches`, {
                    headers: {
                        'Authorization': `Bearer ${authStore.token.value}`
                    }
                });

                console.log('Search history API response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    searches.value = response.data;
                }
            } catch (error) {
                console.error('Error fetching search history:', error);
            } finally {
                searchesLoading.value = false;
            }
        };

        onMounted(() => {
            console.log('UserProfile mounted');
            console.log('Current auth store state:', {
                user: authStore.user.value,
                isLoggedIn: authStore.isLoggedIn.value,
                isPremium: authStore.isPremium.value
            });
            console.log('localStorage isPremium:', localStorage.getItem('isPremium'));
            
            // Initialize with data from auth store
            userDetails.value = authStore.user.value;
            
            // Fetch the latest data from the server
            fetchUserProfile();
            fetchSearchHistory();
        });

        return {
            userDetails,
            searches,
            searchesLoading,
            userPremiumStatus,
            formatDate,
            handleLogout,
            authStore,
            localStorage // For debugging only, remove in production
        };
    }
};
</script>