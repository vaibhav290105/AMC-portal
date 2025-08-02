import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Save, Building } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department,
    emailPreference: user?.emailPreference ?? false,
    poEmailPreference: user?.poEmailPreference ?? false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/users/profile', formData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user?.role?.toLowerCase()}
                </span>
                {user?.role !== "ADMIN" && (
                  <>
                    <Building className="w-4 h-4 text-green-600" />
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {user?.department === 'IT' ? 'ERP & IT' : user?.department}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled={user?.role !== "ADMIN"}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg 
        ${user?.role !== "ADMIN" ? "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" : "border-gray-400 bg-white text-black"}`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {user?.role !== "ADMIN" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed. Contact your administrator if needed.
                  </p>
                )}
              </div>


              {user?.role !== 'ADMIN' && (
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      name="department"
                      disabled
                      value={formData.department}
                      onChange={handleSelectChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="IT">ERP & IT</option>
                      <option value="CNG">CNG</option>
                      <option value="PNG">PNG</option>
                      <option value="HR">HR</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OPERATIONS">Operations</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only administrators can change their department.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={user?.role?.toLowerCase() || ''}
                    disabled={user?.role !== "ADMIN"}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${user?.role !== "ADMIN"
                        ? "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "border-gray-400 bg-white text-black"
                      }`}
                  />
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

                {user?.role !== "ADMIN" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your role is assigned by the system administrator.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="emailPreference"
                  name="emailPreference"
                  checked={formData.emailPreference}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor="emailPreference" className="text-sm font-medium text-gray-900">
                    Receive AMC Reminder Emails
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Get email notifications when your AMC contracts are about to expire (sent every Monday).
                  </p>
                </div>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
               <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="poEmailPreference"
                  name="poEmailPreference"
                  checked={formData.poEmailPreference}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor="poEmailPreference" className="text-sm font-medium text-gray-900">
                    Receive Purchase Order Reminder Emails
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Get email notifications when your Purchase Orders are expiring within 6 months (sent every Monday).
                  </p>
                </div>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user?.role === 'ADMIN' ? 'All' : user?.role === 'MANAGER' ? 'Department' : 'Your'}
            </div>
            <div className="text-sm text-gray-600">Contract Access</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formData.emailPreference ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600">Email Notifications</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
