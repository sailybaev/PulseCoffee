'use client'

import { useState } from 'react'
import { ProductBranchAssignment, Product, Branch } from '@/types'
import api from '@/lib/api'

interface ProductBranchAssignmentProps {
  assignments: ProductBranchAssignment[]
  products: Product[]
  branches: Branch[]
  loadAssignments: () => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export const ProductBranchAssignmentManagement = ({ 
  assignments, 
  products, 
  branches, 
  loadAssignments, 
  showNotification 
}: ProductBranchAssignmentProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ProductBranchAssignment | null>(null)
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '',
    quantity: 0
  })

  const resetForm = () => {
    setFormData({ productId: '', branchId: '', quantity: 0 })
    setEditingAssignment(null)
    setShowCreateForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAssignment) {
        await api.put(`/products/branch-assignments/${editingAssignment.id}`, {
          quantity: formData.quantity
        })
        showNotification('Assignment updated successfully!', 'success')
      } else {
        await api.post('/products/branch-assignments', formData)
        showNotification('Assignment created successfully!', 'success')
      }
      
      resetForm()
      loadAssignments()
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 
        `Failed to ${editingAssignment ? 'update' : 'create'} assignment`, 
        'error'
      )
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    
    try {
      await api.delete(`/products/branch-assignments/${assignmentId}`)
      showNotification('Assignment deleted successfully!', 'success')
      loadAssignments()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete assignment', 'error')
    }
  }

  const startEdit = (assignment: ProductBranchAssignment) => {
    setEditingAssignment(assignment)
    setFormData({
      productId: assignment.productId,
      branchId: assignment.branchId,
      quantity: assignment.quantity
    })
    setShowCreateForm(true)
  }

  const bulkAssign = async () => {
    if (!formData.productId) {
      showNotification('Please select a product for bulk assignment', 'error')
      return
    }

    try {
      const requests = branches.map(branch => 
        api.post('/products/branch-assignments', {
          productId: formData.productId,
          branchId: branch.id,
          quantity: formData.quantity || 10
        })
      )

      await Promise.all(requests)
      showNotification('Bulk assignment completed successfully!', 'success')
      loadAssignments()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Bulk assignment failed', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product-Branch Assignments</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Add Assignment'}
        </button>
      </div>

      {/* Create/Edit Assignment Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-medium mb-4">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={!!editingAssignment}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={!!editingAssignment}
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Available quantity"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                {!editingAssignment && formData.productId && (
                  <button
                    type="button"
                    onClick={bulkAssign}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Assign to All Branches
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map(assignment => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.product.category} - {assignment.product.basePrice} ₸
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{assignment.branch.name}</div>
                  {assignment.branch.address && (
                    <div className="text-sm text-gray-500">{assignment.branch.address}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    assignment.quantity > 10 
                      ? 'bg-green-100 text-green-800' 
                      : assignment.quantity > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {assignment.quantity} available
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => startEdit(assignment)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No product assignments found. Create your first assignment to get started!</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900">Total Assignments</h4>
          <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900">Products Assigned</h4>
          <p className="text-2xl font-bold text-green-600">
            {new Set(assignments.map(a => a.productId)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900">Branches with Products</h4>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(assignments.map(a => a.branchId)).size}
          </p>
        </div>
      </div>
    </div>
  )
}
