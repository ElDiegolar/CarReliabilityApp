// pages/79063509.js - Admin User Management Page for Next.js

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import adminService from '../utils/adminService';

export default function AdminReportPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userActivity, setUserActivity] = useState(null);

  // Computed values using useMemo
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const activeUsersThisMonth = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return users.filter(user => {
      const createdDate = new Date(user.created_at);
      return createdDate >= oneMonthAgo;
    }).length;
  }, [users]);

  const totalSearches = useMemo(() => {
    return users.reduce((total, user) => total + (parseInt(user.searches_count) || 0), 0);
  }, [users]);

  const totalSavedVehicles = useMemo(() => {
    return users.reduce((total, user) => total + (parseInt(user.saved_vehicles_count) || 0), 0);
  }, [users]);

  // Check authentication on mount
  useEffect(() => {
    if (adminService.isAdminAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  // Methods
  const authenticateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await adminService.authenticateAdmin(adminPassword);
      setIsAuthenticated(true);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    adminService.clearAdminToken();
    setIsAuthenticated(false);
    setUsers([]);
    setAdminPassword('');
  };

  const loadUsers = async () => {
    try {
      const userData = await adminService.getAllUsers(adminPassword);
      setUsers(userData.map(user => ({
        ...user,
        editing: false,
        editData: null
      })));
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    }
  };

  const refreshUsers = () => {
    loadUsers();
  };

  const startEditing = (user) => {
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          editing: true,
          editData: {
            name: u.name || '',
            email: u.email,
            phone: u.phone || '',
            preferences: {
              newCarAlerts: u.new_car_alerts,
              recallAlerts: u.recall_alerts,
              marketingEmails: u.marketing_emails
            }
          }
        };
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  const cancelEditing = (user) => {
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          editing: false,
          editData: null
        };
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  const saveUser = async (user) => {
    try {
      setLoading(true);
      await adminService.updateUser(user.id, user.editData, adminPassword);
      
      // Update user data in the list
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            name: user.editData.name,
            email: user.editData.email,
            phone: user.editData.phone,
            editing: false,
            editData: null
          };
        }
        return u;
      });
      setUsers(updatedUsers);
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewUserActivity = async (user) => {
    try {
      setLoading(true);
      setSelectedUser(user);
      const activity = await adminService.getUserActivity(user.id, adminPassword);
      setUserActivity(activity);
      setShowActivityModal(true);
    } catch (err) {
      setError('Failed to load user activity');
      console.error('Error loading user activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeActivityModal = () => {
    setShowActivityModal(false);
    setSelectedUser(null);
    setUserActivity(null);
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const deleteUser = async () => {
    try {
      setLoading(true);
      await adminService.deleteUser(userToDelete.id, adminPassword);
      
      // Remove user from the list
      setUsers(users.filter(u => u.id !== userToDelete.id));
      closeDeleteModal();
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
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

  const updateUserEditData = (userId, field, value) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          editData: {
            ...u.editData,
            [field]: value
          }
        };
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin User Management</h1>
              <p className="text-gray-600 mt-2">Secure user information management panel</p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-medium">✓ Admin Access Granted</span>
                <button 
                  onClick={logout} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin Password Authentication */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Admin Access Required</h2>
            <form onSubmit={authenticateAdmin} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="admin-password">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="admin-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Access Admin Panel'}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Admin Panel Content */}
        {isAuthenticated && (
          <div className="space-y-8">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800">Active This Month</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeUsersThisMonth}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800">Total Searches</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{totalSearches}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800">Saved Vehicles</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{totalSavedVehicles}</p>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
                <button 
                  onClick={refreshUsers} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Refresh Data
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-4">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left">ID</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Email</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Phone</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Joined</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Searches</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Saved Cars</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{user.id}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          {!user.editing ? (
                            <span>{user.name || 'N/A'}</span>
                          ) : (
                            <input
                              value={user.editData.name}
                              onChange={(e) => updateUserEditData(user.id, 'name', e.target.value)}
                              className="w-full p-1 border rounded"
                              type="text"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {!user.editing ? (
                            <span>{user.email}</span>
                          ) : (
                            <input
                              value={user.editData.email}
                              onChange={(e) => updateUserEditData(user.id, 'email', e.target.value)}
                              className="w-full p-1 border rounded"
                              type="email"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {!user.editing ? (
                            <span>{user.phone || 'N/A'}</span>
                          ) : (
                            <input
                              value={user.editData.phone}
                              onChange={(e) => updateUserEditData(user.id, 'phone', e.target.value)}
                              className="w-full p-1 border rounded"
                              type="tel"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">{formatDate(user.created_at)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">{user.searches_count || 0}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">{user.saved_vehicles_count || 0}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex space-x-2">
                            {!user.editing ? (
                              <button
                                onClick={() => startEditing(user)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                              >
                                Edit
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => saveUser(user)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => cancelEditing(user)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => viewUserActivity(user)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                            >
                              Activity
                            </button>
                            <button
                              onClick={() => confirmDeleteUser(user)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold">
                    User Activity: {selectedUser?.name || selectedUser?.email}
                  </h3>
                  <button 
                    onClick={closeActivityModal} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Saved Vehicles */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Saved Vehicles ({userActivity?.savedVehicles?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userActivity?.savedVehicles?.map(vehicle => (
                        <div key={vehicle.id} className="p-3 border rounded-md">
                          <p className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">Saved: {formatDate(vehicle.saved_at)}</p>
                        </div>
                      ))}
                      {!userActivity?.savedVehicles?.length && (
                        <div className="text-gray-500 text-center py-4">No saved vehicles</div>
                      )}
                    </div>
                  </div>

                  {/* Search History */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Search History ({userActivity?.searches?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userActivity?.searches?.map(search => (
                        <div key={search.id} className="p-3 border rounded-md">
                          <p className="font-medium">
                            {search.year} {search.make} {search.model}
                          </p>
                          <p className="text-sm text-gray-600">Mileage: {search.mileage}</p>
                          <p className="text-sm text-gray-600">Searched: {formatDate(search.search_date)}</p>
                        </div>
                      ))}
                      {!userActivity?.searches?.length && (
                        <div className="text-gray-500 text-center py-4">No search history</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirm Delete User</h3>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete user{' '}
                  <strong>{userToDelete?.name || userToDelete?.email}</strong>?
                  This action cannot be undone and will remove all their data.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteUser}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}