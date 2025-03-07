<!-- src/components/AppNavbar.vue -->
<template>
    <nav class="bg-white shadow-sm">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <!-- Logo and Brand -->
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold text-blue-800">
                            Vehicle Reliability AI
                        </h1>
                    </div>
                </div>

                <!-- Navigation Links -->
                <div class="flex items-center space-x-4">
                    <!-- Show when logged in -->
                    <template v-if="isLoggedIn">
                        <div class="relative" ref="userMenuContainer">
                            <button @click.stop="toggleUserMenu"
                                class="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ user?.email || 'Account' }}
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-if="showUserMenu"
                                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                                <a href="#" @click.prevent="$emit('view-profile')"
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    My Profile
                                </a>
                                <a v-if="isPremium" href="#"
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <div class="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-green-600"
                                            viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Premium Active
                                    </div>
                                </a>
                                <a v-else href="#" @click.prevent="$emit('upgrade')"
                                    class="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">
                                    Upgrade to Premium
                                </a>
                                <hr class="my-1 border-gray-200" />
                                <a href="#" @click.prevent="handleLogout"
                                    class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    Logout
                                </a>
                            </div>
                        </div>
                    </template>

                    <!-- Show when logged out -->
                    <template v-else>
                        <button @click="$emit('login')"
                            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                            Login
                        </button>
                        <button @click="$emit('register')"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition">
                            Register
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import authStore from '../store/auth';

export default {
    name: 'AppNavbar',
    emits: ['login', 'register', 'view-profile', 'upgrade', 'logout'],

    setup(props, { emit }) {
        const showUserMenu = ref(false);
        const userMenuContainer = ref(null);

        // Create reactive references to the auth state
        const isLoggedIn = computed(() => authStore.isLoggedIn.value);
        const user = computed(() => authStore.user.value);
        const isPremium = computed(() => authStore.isPremium.value);

        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value;
        };

        const handleLogout = () => {
            console.log("Handling logout in navbar");
            // First close the menu
            showUserMenu.value = false;

            // Clear auth state through the store
            authStore.logout();

            // Emit logout event to parent component
            emit('logout');
        };

        // Close menu when clicking outside
        const closeMenuOnClickOutside = (e) => {
            // Only close if menu is open and click is outside the menu container
            if (showUserMenu.value && userMenuContainer.value && !userMenuContainer.value.contains(e.target)) {
                showUserMenu.value = false;
            }
        };

        // Watch isLoggedIn state and close menu if user logs out
        watch(isLoggedIn, (newIsLoggedIn) => {
            if (!newIsLoggedIn) {
                showUserMenu.value = false;
            }
        });

        onMounted(() => {
            // Use capture phase to ensure we get the event
            document.addEventListener('click', closeMenuOnClickOutside, true);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', closeMenuOnClickOutside, true);
        });

        return {
            isLoggedIn,
            user,
            isPremium,
            showUserMenu,
            userMenuContainer,
            toggleUserMenu,
            handleLogout
        };
    }
};
</script>