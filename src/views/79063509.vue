<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Admin User Management</h1>
            <p class="text-gray-600 mt-2">Secure user information management panel</p>
          </div>
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <span class="text-green-600 font-medium">✓ Admin Access Granted</span>
            <button @click="logout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Password Authentication -->
      <div v-if="!isAuthenticated" class="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-6 text-center">Admin Access Required</h2>
        <form @submit.prevent="authenticateAdmin" class="space-y-4">
          <div>
            <label class="block text-gray-700 mb-2" for="admin-password">Admin Password</label>
            <input
              type="password"
              id="admin-password"
              v-model="adminPassword"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50"
          >
            <span v-if="loading">Authenticating...</span>
            <span v-else>Access Admin Panel</span>
          </button>
        </form>
        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {{ error }}
        </div>
      </div>

      <!-- Admin Panel Content -->
      <div v-if="isAuthenticated" class="space-y-8">
        <!-- User Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800">Total Users</h3>
            <p class="text-3xl font-bold text-blue-600 mt-2">{{ users.length }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800">Active This Month</h3>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ activeUsersThisMonth }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800">Total Searches</h3>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ totalSearches }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800">Saved Vehicles</h3>
            <p class="text-3xl font-bold text-orange-600 mt-2">{{ totalSavedVehicles }}</p>
          </div>
        </div>

        <!-- User Management Table -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">User Management</h2>
            <button @click="refreshUsers" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Refresh Data
            </button>
          </div>

          <!-- Search and Filter -->
          <div class="mb-4">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search users by name or email..."
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Users Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border border-gray-300 px-4 py-3 text-left">ID</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Name</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Email</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Phone</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Joined</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Searches</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Saved Cars</th>
                  <th class="border border-gray-300 px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3">{{ user.id }}</td>
                  <td class="border border-gray-300 px-4 py-3">
                    <span v-if="!user.editing">{{ user.name || 'N/A' }}</span>
                    <input
                      v-else
                      v-model="user.editData.name"
                      class="w-full p-1 border rounded"
                      type="text"
                    />
                  </td>
                  <td class="border border-gray-300 px-4 py-3">
                    <span v-if="!user.editing">{{ user.email }}</span>
                    <input
                      v-else
                      v-model="user.editData.email"
                      class="w-full p-1 border rounded"
                      type="email"
                    />
                  </td>
                  <td class="border border-gray-300 px-4 py-3">
                    <span v-if="!user.editing">{{ user.phone || 'N/A' }}</span>
                    <input
                      v-else
                      v-model="user.editData.phone"
                      class="w-full p-1 border rounded"
                      type="tel"
                    />
                  </td>
                  <td class="border border-gray-300 px-4 py-3">{{ formatDate(user.created_at) }}</td>
                  <td class="border border-gray-300 px-4 py-3 text-center">{{ user.searches_count || 0 }}</td>
                  <td class="border border-gray-300 px-4 py-3 text-center">{{ user.saved_vehicles_count || 0 }}</td>
                  <td class="border border-gray-300 px-4 py-3">
                    <div class="flex space-x-2">
                      <button
                        v-if="!user.editing"
                        @click="startEditing(user)"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        v-if="user.editing"
                        @click="saveUser(user)"
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        v-if="user.editing"
                        @click="cancelEditing(user)"
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        @click="viewUserActivity(user)"
                        class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Activity
                      </button>
                      <button
                        @click="confirmDeleteUser(user)"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- User Activity Modal -->
      <div v-if="showActivityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
          <div class="p-6 border-b">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-semibold">User Activity: {{ selectedUser?.name || selectedUser?.email }}</h3>
              <button @click="closeActivityModal" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Saved Vehicles -->
              <div>
                <h4 class="text-lg font-semibold mb-3">Saved Vehicles ({{ userActivity?.savedVehicles?.length || 0 }})</h4>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="vehicle in userActivity?.savedVehicles"
                    :key="vehicle.id"
                    class="p-3 border rounded-md"
                  >
                    <p class="font-medium">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</p>
                    <p class="text-sm text-gray-600">Saved: {{ formatDate(vehicle.saved_at) }}</p>
                  </div>
                  <div v-if="!userActivity?.savedVehicles?.length" class="text-gray-500 text-center py-4">
                    No saved vehicles
                  </div>
                </div>
              </div>

              <!-- Search History -->
              <div>
                <h4 class="text-lg font-semibold mb-3">Search History ({{ userActivity?.searches?.length || 0 }})</h4>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="search in userActivity?.searches"
                    :key="search.id"
                    class="p-3 border rounded-md"
                  >
                    <p class="font-medium">{{ search.year }} {{ search.make }} {{ search.model }}</p>
                    <p class="text-sm text-gray-600">Mileage: {{ search.mileage }}</p>
                    <p class="text-sm text-gray-600">Searched: {{ formatDate(search.search_date) }}</p>
                  </div>
                  <div v-if="!userActivity?.searches?.length" class="text-gray-500 text-center py-4">
                    No search history
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full m-4">
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-4">Confirm Delete User</h3>
            <p class="text-gray-700 mb-6">
              Are you sure you want to delete user <strong>{{ userToDelete?.name || userToDelete?.email }}</strong>?
              This action cannot be undone and will remove all their data.
            </p>
            <div class="flex justify-end space-x-4">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="deleteUser"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import adminService from '@/services/adminService';

export default {
  name: 'AdminReportPage',
  setup() {
    const isAuthenticated = ref(false);
    const adminPassword = ref('');
    const loading = ref(false);
    const error = ref('');
    const users = ref([]);
    const searchTerm = ref('');
    const showActivityModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedUser = ref(null);
    const userToDelete = ref(null);
    const userActivity = ref(null);

    // Computed properties
    const filteredUsers = computed(() => {
      if (!searchTerm.value) return users.value;
      
      return users.value.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });

    const activeUsersThisMonth = computed(() => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      return users.value.filter(user => {
        const createdDate = new Date(user.created_at);
        return createdDate >= oneMonthAgo;
      }).length;
    });

    const totalSearches = computed(() => {
      return users.value.reduce((total, user) => total + (parseInt(user.searches_count) || 0), 0);
    });

    const totalSavedVehicles = computed(() => {
      return users.value.reduce((total, user) => total + (parseInt(user.saved_vehicles_count) || 0), 0);
    });

    // Methods
    const authenticateAdmin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        await adminService.authenticateAdmin(adminPassword.value);
        isAuthenticated.value = true;
        await loadUsers();
      } catch (err) {
        error.value = err.response?.data?.error || 'Invalid admin password';
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      adminService.clearAdminToken();
      isAuthenticated.value = false;
      users.value = [];
      adminPassword.value = '';
    };

    const loadUsers = async () => {
      try {
        const userData = await adminService.getAllUsers(adminPassword.value);
        users.value = userData.map(user => ({
          ...user,
          editing: false,
          editData: null
        }));
      } catch (err) {
        error.value = 'Failed to load users';
        console.error('Error loading users:', err);
      }
    };

    const refreshUsers = () => {
      loadUsers();
    };

    const startEditing = (user) => {
      user.editing = true;
      user.editData = {
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        preferences: {
          newCarAlerts: user.new_car_alerts,
          recallAlerts: user.recall_alerts,
          marketingEmails: user.marketing_emails
        }
      };
    };

    const cancelEditing = (user) => {
      user.editing = false;
      user.editData = null;
    };

    const saveUser = async (user) => {
      try {
        loading.value = true;
        await adminService.updateUser(user.id, user.editData, adminPassword.value);
        
        // Update user data in the list
        Object.assign(user, {
          name: user.editData.name,
          email: user.editData.email,
          phone: user.editData.phone,
          editing: false,
          editData: null
        });
      } catch (err) {
        error.value = 'Failed to update user';
        console.error('Error updating user:', err);
      } finally {
        loading.value = false;
      }
    };

    const viewUserActivity = async (user) => {
      try {
        loading.value = true;
        selectedUser.value = user;
        userActivity.value = await adminService.getUserActivity(user.id, adminPassword.value);
        showActivityModal.value = true;
      } catch (err) {
        error.value = 'Failed to load user activity';
        console.error('Error loading user activity:', err);
      } finally {
        loading.value = false;
      }
    };

    const closeActivityModal = () => {
      showActivityModal.value = false;
      selectedUser.value = null;
      userActivity.value = null;
    };

    const confirmDeleteUser = (user) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      userToDelete.value = null;
    };

    const deleteUser = async () => {
      try {
        loading.value = true;
        await adminService.deleteUser(userToDelete.value.id, adminPassword.value);
        
        // Remove user from the list
        const index = users.value.findIndex(u => u.id === userToDelete.value.id);
        if (index > -1) {
          users.value.splice(index, 1);
        }
        
        closeDeleteModal();
      } catch (err) {
        error.value = 'Failed to delete user';
        console.error('Error deleting user:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Check if already authenticated on mount
    onMounted(() => {
      if (adminService.isAdminAuthenticated()) {
        isAuthenticated.value = true;
      }
    });

    return {
      isAuthenticated,
      adminPassword,
      loading,
      error,
      users,
      searchTerm,
      filteredUsers,
      activeUsersThisMonth,
      totalSearches,
      totalSavedVehicles,
      showActivityModal,
      showDeleteModal,
      selectedUser,
      userToDelete,
      userActivity,
      authenticateAdmin,
      logout,
      refreshUsers,
      startEditing,
      cancelEditing,
      saveUser,
      viewUserActivity,
      closeActivityModal,
      confirmDeleteUser,
      closeDeleteModal,
      deleteUser,
      formatDate
    };
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>