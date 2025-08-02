import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

interface FormData {
  amcType: string;
  make: string;
  model: string;
  serialNumber: string;
  assetNumber: string;
  warrantyStart: string;
  warrantyEnd: string;
  amcStart: string;
  amcEnd: string;
  location: string;
  vendor: string;
  department: string;
  ownerId?: string;
}

const ContractForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    amcType: 'Comprehensive',
    make: '',
    model: '',
    serialNumber: '',
    assetNumber: '',
    warrantyStart: '',
    warrantyEnd: '',
    amcStart: '',
    amcEnd: '',
    location: '',
    vendor: '',
    department: user?.department || 'IT',
    ownerId: user?.id,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchContract();
    }
    if (['MANAGER', 'ADMIN'].includes(user?.role || '')) {
      fetchUsers();
    }
  }, [id, isEditing, user?.role]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/contracts/${id}`);
      const contract = response.data;
      
      setFormData({
        amcType: contract.amcType,
        make: contract.make,
        model: contract.model,
        serialNumber: contract.serialNumber,
        assetNumber: contract.assetNumber,
        warrantyStart: contract.warrantyStart.split('T')[0],
        warrantyEnd: contract.warrantyEnd.split('T')[0],
        amcStart: contract.amcStart.split('T')[0],
        amcEnd: contract.amcEnd.split('T')[0],
        location: contract.location,
        vendor: contract.vendor,
        department: contract.department,
        ownerId: contract.ownerId,
      });
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('Failed to fetch contract details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      // Filter users based on current user's role
      let filteredUsers = response.data;
      if (user?.role === 'MANAGER') {
        // Managers can only assign to users in their department
        filteredUsers = response.data.filter((u: any) => u.department === user.department);
      }
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await axios.put(`/api/contracts/${id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/contracts', formData);
      }
      navigate('/contracts');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/contracts')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Contract' : 'Add New Contract'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update the contract details' : 'Create a new AMC contract'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Asset Information
            </h3>
            
            <div>
              <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Asset Number *
              </label>
              <input
                type="text"
                id="assetNumber"
                name="assetNumber"
                required
                value={formData.assetNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IGL-IT-001"
              />
            </div>

            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                Make *
              </label>
              <input
                type="text"
                id="make"
                name="make"
                required
                value={formData.make}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Dell, HP, Lenovo"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                id="model"
                name="model"
                required
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., OptiPlex 7090"
              />
            </div>

            <div>
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                required
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., DL001234"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Office - IT Department"
              />
            </div>
          </div>

          {/* Contract Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Contract Information
            </h3>

            <div>
              <label htmlFor="amcType" className="block text-sm font-medium text-gray-700 mb-2">
                AMC Type *
              </label>
              <select
                id="amcType"
                name="amcType"
                required
                value={formData.amcType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Non-comprehensive">Non-comprehensive</option>
              </select>
            </div>

            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
                AMC Vendor *
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                required
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Dell Technologies"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                disabled={user?.role === 'OWNER'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="IT">ERP & IT</option>
                <option value="CNG">CNG</option>
                <option value="PNG">PNG</option>
                <option value="HR">HR</option>
                <option value="FINANCE">Finance</option>
                <option value="OPERATIONS">Operations</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              {user?.role === 'OWNER' && (
                <p className="text-xs text-gray-500 mt-1">
                  Department is set based on your user profile.
                </p>
              )}
            </div>

            {['MANAGER', 'ADMIN'].includes(user?.role || '') && (
              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Owner *
                </label>
                <select
                  id="ownerId"
                  name="ownerId"
                  required
                  value={formData.ownerId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.department === 'IT' ? 'ERP & IT' : user.department}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="warrantyStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Start *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="warrantyStart"
                    name="warrantyStart"
                    required
                    value={formData.warrantyStart}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div>
                <label htmlFor="warrantyEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty End *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="warrantyEnd"
                    name="warrantyEnd"
                    required
                    value={formData.warrantyEnd}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amcStart" className="block text-sm font-medium text-gray-700 mb-2">
                  AMC Start *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="amcStart"
                    name="amcStart"
                    required
                    value={formData.amcStart}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div>
                <label htmlFor="amcEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  AMC End *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="amcEnd"
                    name="amcEnd"
                    required
                    value={formData.amcEnd}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
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
                <span>{isEditing ? 'Update Contract' : 'Create Contract'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
