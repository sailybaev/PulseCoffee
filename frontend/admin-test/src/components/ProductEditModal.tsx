'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import api from '@/lib/api'

interface ProductEditModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export const ProductEditModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave, 
  showNotification 
}: ProductEditModalProps) => {
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    category: 'COFFEE' as 'COFFEE' | 'TEA' | 'DESSERT' | 'SNACK',
    imageFile: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setEditData({
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice,
        category: product.category,
        imageFile: null
      })
    }
  }, [product])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', editData.name)
      formData.append('description', editData.description)
      formData.append('basePrice', editData.basePrice.toString())
      formData.append('category', editData.category)
      
      if (editData.imageFile) {
        formData.append('image', editData.imageFile)
      }

      await api.put(`/products/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      showNotification('Product updated successfully!', 'success')
      onSave()
      onClose()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update product', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditData(prev => ({ ...prev, imageFile: file }))
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="COFFEE">Coffee</option>
                <option value="TEA">Tea</option>
                <option value="DESSERT">Dessert</option>
                <option value="SNACK">Snack</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₸)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editData.basePrice}
                onChange={(e) => setEditData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {product.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
