'use client'

import { useState } from 'react'
import { Branch } from '@/types'
import api from '@/lib/api'

interface BranchManagementProps {
  branches: Branch[]
  loadBranches: () => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export const BranchManagement = ({ 
  branches, 
  loadBranches, 
  showNotification 
}: BranchManagementProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  const resetForm = () => {
    setFormData({ name: '', address: '' })
    setEditingBranch(null)
    setShowCreateForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, formData)
        showNotification('Branch updated successfully!', 'success')
      } else {
        await api.post('/branches', formData)
        showNotification('Branch created successfully!', 'success')
      }
      
      resetForm()
      loadBranches()
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 
        `Failed to ${editingBranch ? 'update' : 'create'} branch`, 
        'error'
      )
    }
  }

  const deleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    
    try {
      await api.delete(`/branches/${branchId}`)
      showNotification('Branch deleted successfully!', 'success')
      loadBranches()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete branch', 'error')
    }
  }

  const startEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address || ''
    })
    setShowCreateForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Branch Management</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Add Branch'}
        </button>
      </div>

      {/* Create/Edit Branch Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-medium mb-4">
            {editingBranch ? 'Edit Branch' : 'Create New Branch'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Branch Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Branch Address (optional)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
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
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{branch.name}</h4>
              {branch.address && (
                <p className="text-sm text-gray-600">{branch.address}</p>
              )}
              <div className="text-xs text-gray-500">
                ID: {branch.id}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => startEdit(branch)}
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBranch(branch.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No branches found. Create your first branch to get started!</p>
        </div>
      )}
    </div>
  )
}
