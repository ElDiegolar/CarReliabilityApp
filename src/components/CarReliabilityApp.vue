<!-- src/components/CarReliabilityApp.vue with Premium Status Fix -->
<script>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

export default {
    name: 'CarReliabilityApp',
    props: {
        isPremiumUser: {
            type: Boolean,
            default: false
        },
        premiumToken: {
            type: String,
            default: ''
        }
    },
    emits: ['show-premium'],

    setup(props, { emit }) {
        // Form data
        const year = ref('');
        const make = ref('');
        const model = ref('');
        const mileage = ref('');
        const loading = ref(false);
        const reliability = ref(null);
        const searchPerformed = ref(false);
        
        // Track effective premium status
        const effectivePremiumStatus = computed(() => {
            // User is premium if either:
            // 1. isPremiumUser prop is true
            // 2. The reliability data indicates premium status
            return props.isPremiumUser || (reliability.value && reliability.value.isPremium) || false;
        });

        // Generate years from current year back 30 years
        const currentYear = new Date().getFullYear();
        const years = ref([...Array(30)].map((_, i) => currentYear - i));

        // Get API base URL - same origin for both production and development
        const apiBaseUrl = 'https://car-reliability-app.vercel.app';

        // Data store (would connect to API in production)
        const carData = {
            makes: {
                '2025': [
                    'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac',
                    'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda',
                    'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
                    'Lincoln', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
                    'Porsche', 'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
                ],
                '2024': [
                    'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac',
                    'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda',
                    'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
                    'Lincoln', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
                    'Porsche', 'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
                ],
                '2023': [
                    'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac',
                    'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda',
                    'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
                    'Lincoln', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
                    'Porsche', 'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
                ]
            },
            models: {
                'Acura': ['ILX', 'MDX', 'RDX', 'TLX'],
                'Alfa Romeo': ['Giulia', 'Stelvio'],
                'Aston Martin': ['DB11', 'Vantage'],
                'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
                'Bentley': ['Bentayga', 'Continental GT'],
                'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
                'Buick': ['Enclave', 'Encore', 'Envision'],
                'Cadillac': ['CT4', 'CT5', 'Escalade'],
                'Chevrolet': ['Blazer', 'Camaro', 'Equinox', 'Silverado'],
                'Chrysler': ['300', 'Pacifica'],
                'Dodge': ['Challenger', 'Charger', 'Durango'],
                'Ferrari': ['488', 'Roma'],
                'Fiat': ['500X'],
                'Ford': ['Bronco', 'Edge', 'Escape', 'F-150', 'Mustang'],
                'Genesis': ['G70', 'G80', 'GV80'],
                'GMC': ['Acadia', 'Sierra', 'Yukon'],
                'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
                'Hyundai': ['Elantra', 'Kona', 'Santa Fe', 'Tucson'],
                'Infiniti': ['Q50', 'QX60'],
                'Jaguar': ['E-PACE', 'F-PACE'],
                'Jeep': ['Cherokee', 'Grand Cherokee', 'Wrangler'],
                'Kia': ['Forte', 'Sorento', 'Sportage', 'Telluride'],
                'Lamborghini': ['Aventador', 'Huracan'],
                'Land Rover': ['Defender', 'Discovery', 'Range Rover'],
                'Lexus': ['ES', 'RX'],
                'Lincoln': ['Aviator', 'Navigator'],
                'Maserati': ['Ghibli', 'Levante'],
                'Mazda': ['CX-30', 'CX-5', 'Mazda3'],
                'McLaren': ['720S', 'Artura'],
                'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE'],
                'Mini': ['Cooper', 'Countryman'],
                'Mitsubishi': ['Outlander', 'Pajero'],
                'Nissan': ['Altima', 'Rogue', 'Sentra'],
                'Porsche': ['911', 'Cayenne', 'Macan'],
                'Ram': ['1500'],
                'Rolls-Royce': ['Ghost', 'Phantom'],
                'Subaru': ['Forester', 'Impreza', 'Outback'],
                'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
                'Toyota': ['Camry', 'Corolla', 'Highlander', 'RAV4'],
                'Volkswagen': ['Atlas', 'Golf', 'Jetta', 'Tiguan'],
                'Volvo': ['S60', 'XC40', 'XC90']
            },
            mileageOptions: [
                'Under 10,000 miles',
                '10,000 - 50,000 miles',
                '50,000 - 100,000 miles',
                'Over 100,000 miles'
            ]
        };

        // Computed properties
        const makes = computed(() => {
            if (!year.value) return [];
            return carData.makes[year.value] || Object.values(carData.makes)[0] || [];
        });

        const models = computed(() => {
            if (!make.value) return [];
            return carData.models[make.value] || [];
        });

        const isFormValid = computed(() => {
            return year.value && make.value && model.value;
        });

        const reliabilityColorClass = computed(() => {
            const score = reliability.value?.overallScore || 0;
            if (score >= 80) return 'bg-green-500';
            if (score >= 60) return 'bg-yellow-500';
            return 'bg-red-500';
        });

        // Check if we should show upgrade prompt
        const showUpgradePrompt = computed(() => {
            return reliability.value && !reliability.value.isPremium && !props.isPremiumUser;
        });

        // Watchers to reset dependent fields
        watch(year, () => {
            make.value = '';
            model.value = '';
            mileage.value = '';
        });

        watch(make, () => {
            model.value = '';
            mileage.value = '';
        });

        // Debug premium status on mount and when it changes
        watch(() => props.isPremiumUser, (newValue) => {
            console.log('isPremiumUser prop changed:', newValue);
        });

        // Methods
        const getReliabilityData = async () => {
            if (!isFormValid.value) return;

            loading.value = true;
            searchPerformed.value = true;

            try {
                // Include premium token if available
                const requestBody = {
                    year: year.value,
                    make: make.value,
                    model: model.value,
                    mileage: mileage.value || 'Not specified'
                };

                // Add token if the user is premium
                if (props.isPremiumUser && props.premiumToken) {
                    requestBody.premiumToken = props.premiumToken;
                    console.log('Using premium token:', props.premiumToken);
                }

                console.log('Sending request:', requestBody);

                const response = await axios.post(`${apiBaseUrl}/api/car-reliability`, requestBody, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Reliability data:', response.data);
                reliability.value = response.data;
            } catch (error) {
                console.error('Error fetching reliability data:', error);
                // Add more detailed error logging
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                } else if (error.request) {
                    console.error('Request was made but no response:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                // Handle error state
                reliability.value = null;
            } finally {
                loading.value = false;
            }
        };

        const formatCategory = (category) => {
            // Convert camelCase to Title Case with spaces
            return category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
        };

        const getCategoryColorClass = (score) => {
            if (score >= 80) return 'bg-green-500';
            if (score >= 60) return 'bg-yellow-500';
            return 'bg-red-500';
        };

        const handleUpgradeClick = () => {
            emit('show-premium');
        };

        onMounted(() => {
            console.log('CarReliabilityApp mounted');
            console.log('isPremiumUser:', props.isPremiumUser);
            console.log('premiumToken:', props.premiumToken);
            console.log('localStorage isPremium:', localStorage.getItem('isPremium'));
        });

        return {
            year,
            make,
            model,
            mileage,
            years,
            makes,
            models,
            mileageOptions: carData.mileageOptions,
            loading,
            reliability,
            searchPerformed,
            isFormValid,
            reliabilityColorClass,
            showUpgradePrompt,
            getReliabilityData,
            formatCategory,
            getCategoryColorClass,
            handleUpgradeClick,
            effectivePremiumStatus
        };
    },

    mounted() {
        // Focus the year input when component is mounted
        document.getElementById('year')?.focus();
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto px-4 py-8">
        <!-- Debug Banner - Remove in production -->
        <div class="bg-gray-100 border border-gray-300 rounded-md p-3 mb-4 text-sm">
            <p>Debug Info:</p>
            <p>isPremiumUser prop: {{ isPremiumUser }}</p>
            <p>effectivePremiumStatus: {{ effectivePremiumStatus }}</p>
            <p v-if="reliability">reliability.isPremium: {{ reliability.isPremium }}</p>
        </div>

        <!-- Header -->
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-blue-800">Vehicle Reliability Checker</h1>
            <p class="text-gray-600 mt-2">Find out how reliable your Vehicle is with AI-powered insights</p>
        </header>

        <!-- Search Form -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">Search for a Vehicle</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Year Selection -->
                <div>
                    <label class="block text-gray-700 mb-2" for="year">Year</label>
                    <div class="relative">
                        <input list="year-options" id="year" v-model="year" placeholder="Select or type year"
                            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <datalist id="year-options">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </datalist>
                    </div>
                </div>

                <!-- Make Selection -->
                <div>
                    <label class="block text-gray-700 mb-2" for="make">Make</label>
                    <div class="relative">
                        <input list="make-options" id="make" v-model="make" placeholder="Select or type make"
                            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :disabled="!year" />
                        <datalist id="make-options">
                            <option v-for="m in makes" :key="m" :value="m">{{ m }}</option>
                        </datalist>
                    </div>
                </div>

                <!-- Model Selection -->
                <div>
                    <label class="block text-gray-700 mb-2" for="model">Model</label>
                    <div class="relative">
                        <input list="model-options" id="model" v-model="model" placeholder="Select or type model"
                            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :disabled="!make" />
                        <datalist id="model-options">
                            <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
                        </datalist>
                    </div>
                </div>

                <!-- Mileage Selection -->
                <div>
                    <label class="block text-gray-700 mb-2" for="mileage">Current Mileage</label>
                    <div class="relative">
                        <input list="mileage-options" id="mileage" v-model="mileage"
                            placeholder="Select or type mileage"
                            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :disabled="!model" />
                        <datalist id="mileage-options">
                            <option v-for="m in mileageOptions" :key="m" :value="m">{{ m }}</option>
                        </datalist>
                    </div>
                </div>
            </div>

            <button @click="getReliabilityData"
                class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 w-full md:w-auto"
                :disabled="!isFormValid || loading">
                <span v-if="loading" class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Getting reliability data...
                </span>
                <span v-else>Check Reliability</span>
            </button>
        </div>

        <!-- Premium Upgrade Banner (shown when results come back and user isn't premium) -->
        <div v-if="showUpgradePrompt" class="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <h3 class="text-xl font-semibold text-blue-800 mb-2">Unlock Premium Reliability Report</h3>
                    <p class="text-gray-600">Get detailed insights, common issues, repair costs, and expert analysis.
                    </p>
                </div>
                <button @click="handleUpgradeClick"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300">
                    Upgrade for $9.95
                </button>
            </div>
        </div>

        <!-- Results Section -->
        <div v-if="reliability" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-4">{{ year }} {{ make }} {{ model }} Reliability</h2>
            <p class="text-gray-600 mb-4">Mileage: {{ mileage || 'Not specified' }}</p>

            <!-- Premium Badge -->
            <div v-if="effectivePremiumStatus" class="mb-6">
                <span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Premium Report
                </span>
            </div>

            <!-- Overall Rating -->
            <div class="mb-6">
                <h3 class="text-lg font-medium mb-2">Overall Reliability Score</h3>
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-5">
                        <div class="h-5 rounded-full" :class="reliabilityColorClass"
                            :style="`width: ${reliability.overallScore}%`"></div>
                    </div>
                    <span class="ml-4 font-bold text-lg">{{ reliability.overallScore }}/100</span>
                </div>
            </div>

            <!-- Reliability Details -->
            <div class="mb-6">
                <h3 class="text-lg font-medium mb-3">Reliability Breakdown</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(score, category) in reliability.categories" :key="category"
                        class="border border-gray-200 rounded-md p-4">
                        <h4 class="font-medium mb-2">{{ formatCategory(category) }}</h4>
                        <div class="flex items-center">
                            <div class="w-full bg-gray-200 rounded-full h-4">
                                <div v-if="score !== null" class="h-4 rounded-full"
                                    :class="getCategoryColorClass(score)" :style="`width: ${score}%`"></div>
                                <div v-else
                                    class="h-4 bg-gray-300 rounded-full w-full flex items-center justify-center">
                                    <span class="text-xs text-gray-600">Premium Feature</span>
                                </div>
                            </div>
                            <span v-if="score !== null" class="ml-2 font-semibold">{{ score }}/100</span>
                            <span v-else class="ml-2 font-semibold text-gray-400">—</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Common Issues (Premium Feature) -->
            <div v-if="effectivePremiumStatus && reliability.commonIssues && reliability.commonIssues.length > 0"
                class="w-full mb-6">
                <h3 class="text-lg font-medium mb-3">Common Issues</h3>
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300 min-w-[600px]">
                        <thead class="bg-gray-200">
                            <tr>
                                <th class="border border-gray-300 px-4 py-2 text-sm md:text-base">Issue</th>
                                <th class="border border-gray-300 px-4 py-2 text-sm md:text-base">Estimated Cost</th>
                                <th class="border border-gray-300 px-4 py-2 text-sm md:text-base">Occurrences</th>
                                <th class="border border-gray-300 px-4 py-2 text-sm md:text-base">Mileage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(issue, index) in reliability.commonIssues" :key="index"
                                class="text-gray-700 text-sm md:text-base">
                                <td class="border border-gray-300 px-3 py-2">{{ issue.description }}</td>
                                <td class="border border-gray-300 px-3 py-2">{{ issue.costToFix }}</td>
                                <td class="border border-gray-300 px-3 py-2">{{ issue.occurrence }}</td>
                                <td class="border border-gray-300 px-3 py-2">{{ issue.mileage }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Premium Upgrade Prompt (inline) -->
            <div v-else-if="!effectivePremiumStatus" class="w-full mb-6">
                <div class="border border-blue-200 rounded-md p-4 bg-blue-50">
                    <h3 class="text-lg font-medium mb-2 flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        Common Issues Data
                    </h3>
                    <p class="text-gray-600 mb-3">
                        Upgrade to premium to see detailed information about common issues, repair costs, and when they
                        typically occur.
                    </p>
                    <button @click="handleUpgradeClick"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
                        Unlock Premium Features
                    </button>
                </div>
            </div>

            <!-- AI Analysis -->
            <div class="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 class="text-lg font-medium mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                            clip-rule="evenodd" />
                    </svg>
                    AI Analysis
                </h3>
                <div v-if="effectivePremiumStatus">
                    <p class="text-gray-700">{{ reliability.aiAnalysis }}</p>
                </div>
                <div v-else class="flex flex-col md:flex-row justify-between items-center">
                    <p class="text-gray-600 mb-3 md:mb-0 md:mr-4">Unlock the full AI-powered analysis with a premium
                        subscription.</p>
                    <button @click="handleUpgradeClick"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
                        Get Premium Analysis
                    </button>
                </div>
            </div>

        </div>

        <!-- Empty State / No Results -->
        <div v-else-if="searchPerformed && !loading" class="bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-700 mb-2">No reliability data found</h3>
            <p class="text-gray-500">We couldn't find reliability information for the selected vehicle. Please try a
                different combination.</p>
        </div>
    </div>
</template>