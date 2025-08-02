import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

interface FormData {
  vendorCode: string;
  vendorName: string;
  vendorInfo: string;
  poNumber: string;
  poDate: string;
  validityStart: string;
  validityEnd: string;
  department: string;
  ownerId?: string;
}

const PurchaseOrderForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    vendorCode: '',
    vendorName: '',
    vendorInfo: '',
    poNumber: '',
    poDate: '',
    validityStart: '',
    validityEnd: '',
    department: user?.department || 'IT',
    ownerId: user?.id,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchPurchaseOrder();
    }
    if (['MANAGER', 'ADMIN'].includes(user?.role || '')) {
      fetchUsers();
    }
  }, [id, isEditing, user?.role]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/purchase-orders/${id}`);
      const po = response.data;
      
      setFormData({
        vendorCode: po.vendorCode,
        vendorName: po.vendorName,
        vendorInfo: po.vendorInfo,
        poNumber: po.poNumber,
        poDate: po.poDate.split('T')[0],
        validityStart: po.validityStart.split('T')[0],
        validityEnd: po.validityEnd.split('T')[0],
        department: po.department,
        ownerId: po.ownerId,
      });
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      setError('Failed to fetch purchase order details');
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
        await axios.put(`/api/purchase-orders/${id}`, formData);
      } else {
        await axios.post('/api/purchase-orders', formData);
      }
      navigate('/purchase-orders');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save purchase order');
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
          onClick={() => navigate('/purchase-orders')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Purchase Order' : 'Add New Purchase Order'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update the purchase order details' : 'Create a new purchase order'}
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
          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Vendor Information
            </h3>
            
            <div>
              <label htmlFor="vendorCode" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Code *
              </label>
              <input
                type="text"
                id="vendorCode"
                name="vendorCode"
                required
                value={formData.vendorCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., VEN001"
              />
            </div>

            <div>
              <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                required
                value={formData.vendorName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., ABC Technologies Pvt Ltd address 123, City, State, ZIP"
              />
            </div>

            <div>
              <label htmlFor="vendorInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <textarea
                id="vendorInfo"
                name="vendorInfo"
                rows={4}
                required
                value={formData.vendorInfo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the subject and other relevant information"
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
                  Purchase Order Owner *
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
          </div>

          {/* Purchase Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Purchase Order Information
            </h3>

            <div>
              <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order Number *
              </label>
              <input
                type="text"
                id="poNumber"
                name="poNumber"
                required
                value={formData.poNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., PO-2024-001"
              />
            </div>

            <div>
              <label htmlFor="poDate" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="poDate"
                  name="poDate"
                  required
                  value={formData.poDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="validityStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Validity Start *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="validityStart"
                    name="validityStart"
                    required
                    value={formData.validityStart}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div>
                <label htmlFor="validityEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  Validity End *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="validityEnd"
                    name="validityEnd"
                    required
                    value={formData.validityEnd}
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
            onClick={() => navigate('/purchase-orders')}
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
                <span>{isEditing ? 'Update Purchase Order' : 'Create Purchase Order'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
