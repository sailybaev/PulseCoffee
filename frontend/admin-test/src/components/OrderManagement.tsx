'use client'

import { useState, useEffect } from 'react'
import { Order, Product, Branch } from '@/types'
import api from '@/lib/api'

interface OrderManagementProps {
  orders: Order[]
  products: Product[]
  branches: Branch[]
  loadOrders: () => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'PREPARING', label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  { value: 'READY', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export const OrderManagement = ({ 
  orders, 
  products, 
  branches, 
  loadOrders, 
  showNotification 
}: OrderManagementProps) => {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [branchFilter, setBranchFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState<string>('')
  const [newOrderData, setNewOrderData] = useState({
    branchId: '',
    items: [{ productId: '', quantity: 1 }]
  })

  // Filter orders based on search criteria
  useEffect(() => {
    let filtered = orders

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (branchFilter) {
      filtered = filtered.filter(order => order.branchId === branchFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phoneNumber?.includes(searchTerm) ||
        order.branch.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, branchFilter, searchTerm])

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ₸`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus })
      showNotification('Order status updated successfully!', 'success')
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update order status', 'error')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/orders/${orderId}`)
      showNotification('Order deleted successfully!', 'success')
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
        setShowDetailsModal(false)
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete order', 'error')
    }
  }

  const handleCreateOrder = async () => {
    try {
      const orderItems = newOrderData.items.filter(item => item.productId && item.quantity > 0)
      if (orderItems.length === 0) {
        showNotification('Please add at least one item to the order', 'error')
        return
      }

      await api.post('/orders', {
        branchId: newOrderData.branchId,
        items: orderItems
      })

      showNotification('Order created successfully!', 'success')
      setShowCreateModal(false)
      setNewOrderData({ branchId: '', items: [{ productId: '', quantity: 1 }] })
      loadOrders()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to create order', 'error')
    }
  }

  const addOrderItem = () => {
    setNewOrderData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }))
  }

  const removeOrderItem = (index: number) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setEditingStatus(order.status)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Management</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Order
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {ORDER_STATUSES.map(status => {
            const count = orders.filter(order => order.status === status.value).length
            return (
              <div key={status.value} className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                  {status.label}
                </div>
                <div className="text-2xl font-bold mt-1">{count}</div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Order ID, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('')
                setBranchFilter('')
                setSearchTerm('')
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium">Orders ({filteredOrders.length})</h4>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.user?.name || 'Guest'} • {order.branch.name} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-gray-900">
                        Total: {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      View Details
                    </button>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={newOrderData.branchId}
                  onChange={(e) => setNewOrderData(prev => ({ ...prev, branchId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Order Items</label>
                  <button
                    onClick={addOrderItem}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add Item
                  </button>
                </div>
                
                {newOrderData.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatPrice(product.basePrice)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                    />
                    {newOrderData.items.length > 1 && (
                      <button
                        onClick={() => removeOrderItem(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewOrderData({ branchId: '', items: [{ productId: '', quantity: 1 }] })
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono">#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch:</span>
                    <span>{selectedOrder.branch.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span>{selectedOrder.user?.name || 'Guest'}</span>
                  </div>
                  {selectedOrder.user?.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedOrder.user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>{formatDate(selectedOrder.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-600">Total:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">{item.product.category}</p>
                          {item.product.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.product.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          <div className="text-sm text-gray-600">Price: {formatPrice(item.price)}</div>
                          <div className="font-semibold">Total: {formatPrice(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
              <div className="flex items-center space-x-3">
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, editingStatus)}
                  disabled={editingStatus === selectedOrder.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Update Status
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Order
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
