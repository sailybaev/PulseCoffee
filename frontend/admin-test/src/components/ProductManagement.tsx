'use client'

import { useState } from 'react'
import { Product } from '@/types'
import api from '@/lib/api'

interface ProductManagementProps {
  products: Product[]
  loadProducts: () => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
  openImageModal: (url: string, title: string) => void
  openEditProductModal: (productId: string) => void
}

export const ProductManagement = ({ 
  products, 
  loadProducts, 
  showNotification, 
  openImageModal, 
  openEditProductModal 
}: ProductManagementProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    basePrice: 0,
    category: 'COFFEE' as 'COFFEE' | 'TEA' | 'DESSERT' | 'SNACK',
    imageFile: null as File | null
  })

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('description', newProduct.description)
      formData.append('basePrice', newProduct.basePrice.toString())
      formData.append('category', newProduct.category)
      
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile)
      }

      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      showNotification('Product created successfully!', 'success')
      setShowCreateForm(false)
      setNewProduct({
        name: '',
        description: '',
        basePrice: 0,
        category: 'COFFEE',
        imageFile: null
      })
      loadProducts()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to create product', 'error')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await api.delete(`/products/${productId}`)
      showNotification('Product deleted successfully!', 'success')
      loadProducts()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete product', 'error')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProduct(prev => ({ ...prev, imageFile: file }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Management</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-medium mb-4">Create New Product</h4>
          <form onSubmit={createProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value as any }))}
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
                  value={newProduct.basePrice}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
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
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded cursor-pointer mb-3"
                onClick={() => openImageModal(product.imageUrl!, product.name)}
              />
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{product.name}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">{product.basePrice} ₸</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {product.category}
                </span>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => openEditProductModal(product.id)}
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No products found. Create your first product to get started!</p>
        </div>
      )}
    </div>
  )
}
