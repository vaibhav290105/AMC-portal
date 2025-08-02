import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Building,
  User,
  AlertTriangle,
  ShoppingCart,
  Grid3X3,
  List
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PurchaseOrder {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorInfo: string;
  poNumber: string;
  poDate: string;
  validityStart: string;
  validityEnd: string;
  department: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const PurchaseOrderList: React.FC = () => {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get('/api/purchase-orders');
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`/api/purchase-orders/${id}`);
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('Failed to delete purchase order');
      }
    }
  };

  const isExpiringSoon = (validityEnd: string) => {
    const endDate = new Date(validityEnd);
    const today = new Date();
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return endDate <= oneMonthFromNow && endDate >= today;
  };

  const isExpired = (validityEnd: string) => {
    const endDate = new Date(validityEnd);
    const today = new Date();
    return endDate < today;
  };

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorInfo.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'expiring') return matchesSearch && isExpiringSoon(po.validityEnd);
    if (filterType === 'expired') return matchesSearch && isExpired(po.validityEnd);
    if (filterType === 'active') return matchesSearch && !isExpired(po.validityEnd);
    
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage your Purchase Orders and vendor contracts
          </p>
        </div>
        <Link
          to="/purchase-orders/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Purchase Order</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Purchase Orders</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
                      {/* Toggle buttons */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>
            
            <div className="text-sm text-gray-600">
              {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Grid */}
      {filteredPurchaseOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first purchase order'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <Link
              to="/purchase-orders/new"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 mt-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Purchase Order</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchaseOrders.map((po) => (
            <div
              key={po.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {po.poNumber}
                    </h3>
                    <p className="text-gray-600">{po.vendorName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpired(po.validityEnd) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Expired
                      </span>
                    )}
                    {isExpiringSoon(po.validityEnd) && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Expiring Soon
                      </span>
                    )}
                    {!isExpiringSoon(po.validityEnd) && !isExpired(po.validityEnd) &&  (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Validity: {new Date(po.validityStart).toLocaleDateString()} - {new Date(po.validityEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">Vendor Code: {po.vendorCode}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="truncate">PO Date: {new Date(po.poDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span className="truncate">{po.department === 'IT' ? 'ERP & IT' : po.department}</span>
                  </div>
                  {['MANAGER', 'ADMIN'].includes(user?.role || '') && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="truncate">Owner: {po.owner.name}</span>
                    </div>
                  )}
                </div>

                {isExpiringSoon(po.validityEnd) && !isExpired(po.validityEnd) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-800 text-sm font-medium">
                        Expires in {Math.ceil((new Date(po.validityEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Created {new Date(po.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/purchase-orders/${po.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(po.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  {['MANAGER', 'ADMIN'].includes(user?.role || '') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{po.vendorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(po.validityStart).toLocaleDateString()} - {new Date(po.validityEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {po.department === 'IT' ? 'ERP & IT' : po.department}
                    </td>
                    {['MANAGER', 'ADMIN'].includes(user?.role || '') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="text-sm text-gray-900">
                          {po.owner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {po.owner.email}
                        </div>
                    </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isExpired(po.validityEnd) ? (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Expired</span>
                      ) : isExpiringSoon(po.validityEnd) ? (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Expiring Soon</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex items-center space-x-2">
                        <Link to={`/purchase-orders/${po.id}/edit`} className="text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(po.id)} className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
