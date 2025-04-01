<!-- src/views/ProfilePage.vue -->
<template>
    <div class="bg-gray-100 min-h-screen">
        <!-- Header with user info -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p class="mt-1 text-gray-500">Manage your account settings and preferences</p>
                    </div>
                    <div>
                        <button @click="logout"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.5a.5.5 0 01-.5.5h-7a.5.5 0 010-1h7a.5.5 0 01.5.5zm0 4a.5.5 0 01-.5.5h-7a.5.5 0 010-1h7a.5.5 0 01.5.5zM5.5 15a.5.5 0 000 1h9a.5.5 0 000-1h-9z"
                                    clip-rule="evenodd" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <!-- Loading skeleton -->
            <div v-if="loading" class="bg-white shadow sm:rounded-lg p-6">
                <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div class="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-2/4 mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="bg-white shadow sm:rounded-lg p-6">
                <div class="bg-red-50 border-l-4 border-red-500 p-4">
                    <div class="flex items-center">
                        <svg class="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <p class="text-sm text-red-700">{{ error }}</p>
                            <button @click="loadProfile"
                                class="mt-2 text-sm font-medium text-red-700 hover:text-red-600">
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User profile content -->
            <div v-else-if="user" class="space-y-6">
                <!-- Personal Information -->
                <div class="bg-white shadow sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Personal Information
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            Your account details
                        </p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Full name</dt>
                                <dd class="mt-1 text-lg text-gray-900">{{ user.name || 'Not provided' }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Email address</dt>
                                <dd class="mt-1 text-lg text-gray-900">{{ user.email }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Phone number</dt>
                                <dd class="mt-1 text-lg text-gray-900">{{ user.phone || 'Not provided' }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Member since</dt>
                                <dd class="mt-1 text-lg text-gray-900">{{ formatDate(user.created_at) }}</dd>
                            </div>
                        </dl>
                        <div class="mt-6">
                            <button
                                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Edit profile
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Notification Preferences -->
                <div class="bg-white shadow sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Notification Preferences
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            Manage how you receive alerts and communications
                        </p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <form @submit.prevent="savePreferences">
                            <div v-if="prefsUpdated" class="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                                <div class="flex items-center">
                                    <svg class="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <p class="text-sm text-green-700">Your preferences have been updated successfully.
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="flex items-start">
                                    <div class="flex items-center h-5">
                                        <input id="new-car-alerts" v-model="preferences.newCarAlerts" type="checkbox"
                                            class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div class="ml-3 text-sm">
                                        <label for="new-car-alerts" class="font-medium text-gray-700">New car
                                            alerts</label>
                                        <p class="text-gray-500">Receive notifications when new cars matching your saved
                                            searches are available</p>
                                    </div>
                                </div>
                                <div class="flex items-start">
                                    <div class="flex items-center h-5">
                                        <input id="recall-alerts" v-model="preferences.recallAlerts" type="checkbox"
                                            class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div class="ml-3 text-sm">
                                        <label for="recall-alerts" class="font-medium text-gray-700">Recall
                                            alerts</label>
                                        <p class="text-gray-500">Get notified about recall information for your saved
                                            vehicles</p>
                                    </div>
                                </div>
                                <div class="flex items-start">
                                    <div class="flex items-center h-5">
                                        <input id="marketing-emails" v-model="preferences.marketingEmails"
                                            type="checkbox"
                                            class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div class="ml-3 text-sm">
                                        <label for="marketing-emails" class="font-medium text-gray-700">Marketing
                                            emails</label>
                                        <p class="text-gray-500">Receive marketing communications about features, tips,
                                            and special offers</p>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-6">
                                <button type="submit" :disabled="savingPrefs"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <svg v-if="savingPrefs" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    {{ savingPrefs ? 'Saving...' : 'Save preferences' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Saved Vehicles -->
                <div class="bg-white shadow sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Saved Vehicles
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            Vehicles you've saved for reference
                        </p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div v-if="savedVehicles.length === 0" class="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">No saved vehicles</h3>
                            <p class="mt-1 text-sm text-gray-500">
                                You haven't saved any vehicles yet. Search for a car and save it to see it here.
                            </p>
                            <div class="mt-6">
                                <router-link to="/"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Search for vehicles
                                </router-link>
                            </div>
                        </div>

                        <div v-else class="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Vehicle</th>
                                        <th scope="col"
                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Reliability Score</th>
                                        <th scope="col"
                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Saved
                                        </th>
                                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span class="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    <tr v-for="vehicle in savedVehicles" :key="vehicle.id">
                                        <td
                                            class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <div class="flex items-center">
                                                <div class="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div class="h-2.5 rounded-full"
                                                        :class="getScoreColorClass(vehicle.reliability_data?.overallScore || 0)"
                                                        :style="`width: ${vehicle.reliability_data?.overallScore || 0}%`">
                                                    </div>
                                                </div>
                                                <span>{{ vehicle.reliability_data?.overallScore || 'N/A' }}</span>
                                            </div>
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {{ formatDate(vehicle.saved_at) }}
                                        </td>
                                        <td
                                            class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <router-link :to="`/vehicles/${vehicle.id}`"
                                                class="text-blue-600 hover:text-blue-900 mr-4">
                                                View
                                            </router-link>
                                            <button @click="deleteSavedVehicle(vehicle.id)"
                                                class="text-red-600 hover:text-red-900">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Recent Searches -->
                <div class="bg-white shadow sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Recent Searches
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            Your recent vehicle searches
                        </p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div v-if="searchHistory.length === 0" class="text-center py-6">
                            <p class="text-gray-500">No recent searches</p>
                        </div>

                        <ul v-else class="divide-y divide-gray-200">
                            <li v-for="search in searchHistory" :key="search.id" class="py-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">
                                            {{ search.year }} {{ search.make }} {{ search.model }}
                                        </p>
                                        <p class="text-sm text-gray-500">Mileage: {{ search.mileage || 'Not specified'
                                            }}</p>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="text-xs text-gray-500">{{ formatDate(search.search_date) }}</span>
                                        <button @click="repeatSearch(search)"
                                            class="ml-4 text-sm text-blue-600 hover:text-blue-800">
                                            Search again
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import axios from 'axios';

export default {
    name: 'ProfilePage',

    setup() {
        const router = useRouter();

        // User data
        const user = ref(null);
        const preferences = reactive({
            newCarAlerts: true,
            recallAlerts: true,
            marketingEmails: false
        });

        // UI state
        const loading = ref(true);
        const error = ref('');
        const prefsUpdated = ref(false);
        const savingPrefs = ref(false);

        // Saved vehicles and searches
        const savedVehicles = ref([]);
        const searchHistory = ref([]);

        // Load user profile data
        const loadProfile = async () => {
            loading.value = true;
            error.value = '';

            try {
                // Check if user is authenticated
                if (!authService.isAuthenticated()) {
                    router.push('/login');
                    return;
                }

                // Fetch profile data
                const response = await authService.getProfile();
                user.value = response.user;

                // Set preferences
                if (response.preferences) {
                    preferences.newCarAlerts = !!response.preferences.new_car_alerts;
                    preferences.recallAlerts = !!response.preferences.recall_alerts;
                    preferences.marketingEmails = !!response.preferences.marketing_emails;
                }

                // Fetch saved vehicles and search history
                await Promise.all([
                    loadSavedVehicles(),
                    loadSearchHistory()
                ]);
            } catch (err) {
                console.error('Error loading profile:', err);
                error.value = 'Failed to load your profile data. Please try again.';
            } finally {
                loading.value = false;
            }
        };

        // Load saved vehicles
        const loadSavedVehicles = async () => {
            try {
                const response = await axios.get('/api/saved-vehicles', {
                    headers: authService.getAuthHeader()
                });

                savedVehicles.value = response.data;
            } catch (err) {
                console.error('Error loading saved vehicles:', err);
            }
        };

        // Load search history
        const loadSearchHistory = async () => {
            try {
                const response = await axios.get('/api/searches', {
                    headers: authService.getAuthHeader()
                });

                searchHistory.value = response.data;
            } catch (err) {
                console.error('Error loading search history:', err);
            }
        };

        // Save user preferences
        const savePreferences = async () => {
            prefsUpdated.value = false;
            savingPrefs.value = true;

            try {
                await authService.updatePreferences({
                    newCarAlerts: preferences.newCarAlerts,
                    recallAlerts: preferences.recallAlerts,
                    marketingEmails: preferences.marketingEmails
                });

                prefsUpdated.value = true;

                // Hide success message after 5 seconds
                setTimeout(() => {
                    prefsUpdated.value = false;
                }, 5000);
            } catch (err) {
                console.error('Error saving preferences:', err);
                error.value = 'Failed to save preferences. Please try again.';
            } finally {
                savingPrefs.value = false;
            }
        };

        // Delete a saved vehicle
        const deleteSavedVehicle = async (vehicleId) => {
            if (!confirm('Are you sure you want to delete this saved vehicle?')) {
                return;
            }

            try {
                await axios.delete(`/api/saved-vehicles/${vehicleId}`, {
                    headers: authService.getAuthHeader()
                });

                // Remove from the list
                savedVehicles.value = savedVehicles.value.filter(v => v.id !== vehicleId);
            } catch (err) {
                console.error('Error deleting vehicle:', err);
                alert('Failed to delete the vehicle. Please try again.');
            }
        };

        // Repeat a previous search
        const repeatSearch = (search) => {
            router.push({
                path: '/',
                query: {
                    year: search.year,
                    make: search.make,
                    model: search.model,
                    mileage: search.mileage
                }
            });
        };

        // Format date for display
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';

            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);
        };

        // Get color class based on score
        const getScoreColorClass = (score) => {
            if (score >= 80) return 'bg-green-500';
            if (score >= 60) return 'bg-yellow-500';
            return 'bg-red-500';
        };

        // Log out user
        const logout = () => {
            authService.logout();
        };

        // Load profile data on component mount
        onMounted(() => {
            loadProfile();
        });

        return {
            user,
            preferences,
            loading,
            error,
            prefsUpdated,
            savingPrefs,
            savedVehicles,
            searchHistory,
            loadProfile,
            savePreferences,
            deleteSavedVehicle,
            repeatSearch,
            formatDate,
            getScoreColorClass,
            logout
        };
    }
};
</script>