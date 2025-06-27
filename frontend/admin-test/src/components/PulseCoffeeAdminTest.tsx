'use client'

import { useState, useEffect } from 'react'
import { User, Product, Branch, Order, ProductBranchAssignment, UploadedImage } from '@/types'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Notification } from './Notification'
import { ProductManagement } from './ProductManagement'
import { ProductEditModal } from './ProductEditModal'
import { BranchManagement } from './BranchManagement'
import { OrderManagement } from './OrderManagement'
import { ProductBranchAssignmentManagement } from './ProductBranchAssignmentManagement'
import { WebSocketManagement } from './WebSocketManagement'
import { FileManagement } from './FileManagement'
import { ImageGallery } from './ImageGallery'
import api from '@/lib/api'

interface NotificationState {
  message: string
  type: 'success' | 'error' | 'info'
  id: string
}

export const PulseCoffeeAdminTest = () => {
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationState[]>([])
  const [activeTab, setActiveTab] = useState<string>('login')
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('products')
  
  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [productBranchAssignments, setProductBranchAssignments] = useState<ProductBranchAssignment[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  
  // Modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImage, setModalImage] = useState({ url: '', title: '' })

  // WebSocket hook
  const { isConnected, events, clearEvents, joinBaristaRoom, leaveBaristaRoom, testConnection } = useWebSocket({
    accessToken,
    user: currentUser
  })

  // Notification helpers
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = {
      message,
      type,
      id: Date.now().toString()
    }
    setNotifications(prev => [...prev, notification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Auth functions
  const checkAuthStatus = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const token = response.data.accessToken
      setAccessToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token)
      }
      setCurrentUser(response.data.user)
      setActiveTab('dashboard')
    } catch (error) {
      // Clear any existing token and show login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
      }
      setAccessToken(null)
      setCurrentUser(null)
      setActiveTab('login')
    }
  }

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { phoneNumber, password })
      const token = response.data.accessToken
      setAccessToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token)
      }
      setCurrentUser(response.data.user)
      showNotification('Login successful!', 'success')
      setActiveTab('dashboard')
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Login failed', 'error')
    }
  }

  const register = async (name: string, phoneNumber: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, phoneNumber, password })
      const token = response.data.accessToken
      setAccessToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token)
      }
      setCurrentUser(response.data.user)
      showNotification('Registration successful!', 'success')
      setActiveTab('dashboard')
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Registration failed', 'error')
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
      }
      setCurrentUser(null)
      setActiveTab('login')
      showNotification('Logged out successfully', 'info')
    }
  }

  // Data loading functions
  const loadProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load products', 'error')
    }
  }

  const loadBranches = async () => {
    try {
      const response = await api.get('/branches')
      setBranches(response.data)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load branches', 'error')
    }
  }

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load orders', 'error')
    }
  }

  const loadProductBranchAssignments = async () => {
    try {
      const response = await api.get('/products/branch-assignments')
      setProductBranchAssignments(response.data)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load assignments', 'error')
    }
  }

  const loadUploadedImages = async () => {
    try {
      const response = await api.get('/upload/images')
      setUploadedImages(response.data)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load images', 'error')
    }
  }

  // Effect hooks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        setAccessToken(token)
        checkAuthStatus()
      } else {
        setActiveTab('login')
      }
    } else {
      setActiveTab('login')
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadProducts()
      loadBranches()
      loadOrders()
      loadProductBranchAssignments()
      loadUploadedImages()
    }
  }, [activeTab])

  // Modal functions
  const openImageModal = (url: string, title: string) => {
    setModalImage({ url, title })
    setShowImageModal(true)
  }

  const openEditProductModal = async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}`)
      setEditingProduct(response.data)
      setShowEditProductModal(true)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load product', 'error')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Product Edit Modal */}
      {showEditProductModal && editingProduct && (
        <ProductEditModal
          product={editingProduct}
          isOpen={showEditProductModal}
          onClose={() => {
            setShowEditProductModal(false)
            setEditingProduct(null)
          }}
          onSave={loadProducts}
          showNotification={showNotification}
        />
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute -top-2 -right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"
            >
              ×
            </button>
            <img 
              src={modalImage.url} 
              alt={modalImage.title}
              className="max-w-full max-h-full object-contain rounded"
            />
            <p className="text-white text-center mt-2 font-medium">{modalImage.title}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-pulse-primary">Pulse Coffee - Admin Test</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <span className="text-sm text-gray-700">
                    {currentUser.name} ({currentUser.role})
                  </span>
                  <span className="flex items-center text-sm">
                    <span className={`socket-status ${isConnected ? 'connected' : 'disconnected'}`}></span>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'login' ? (
          <AuthSection 
            onLogin={login}
            onRegister={register}
            showNotification={showNotification}
          />
        ) : (
          <DashboardSection
            activeDashboardTab={activeDashboardTab}
            setActiveDashboardTab={setActiveDashboardTab}
            products={products}
            branches={branches}
            orders={orders}
            productBranchAssignments={productBranchAssignments}
            uploadedImages={uploadedImages}
            currentUser={currentUser}
            isConnected={isConnected}
            events={events}
            showNotification={showNotification}
            openImageModal={openImageModal}
            openEditProductModal={openEditProductModal}
            loadProducts={loadProducts}
            loadBranches={loadBranches}
            loadOrders={loadOrders}
            loadProductBranchAssignments={loadProductBranchAssignments}
            loadUploadedImages={loadUploadedImages}
            joinBaristaRoom={joinBaristaRoom}
            leaveBaristaRoom={leaveBaristaRoom}
            testConnection={testConnection}
            clearEvents={clearEvents}
          />
        )}
      </div>
    </div>
  )
}

// Auth Section Component
interface AuthSectionProps {
  onLogin: (phoneNumber: string, password: string) => void
  onRegister: (name: string, phoneNumber: string, password: string) => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

const AuthSection = ({ onLogin, onRegister, showNotification }: AuthSectionProps) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'adminLogin'>('login')
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (authTab === 'register') {
      if (!formData.name || !formData.phoneNumber || !formData.password) {
        showNotification('All fields are required', 'error')
        return
      }
      onRegister(formData.name, formData.phoneNumber, formData.password)
    } else {
      if (!formData.phoneNumber || !formData.password) {
        showNotification('Phone number and password are required', 'error')
        return
      }
      onLogin(formData.phoneNumber, formData.password)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${authTab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setAuthTab('login')}
        >
          Login
        </button>
        <button
          className={`px-4 py-2 rounded ${authTab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setAuthTab('register')}
        >
          Register
        </button>
        <button
          className={`px-4 py-2 rounded ${authTab === 'adminLogin' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setAuthTab('adminLogin')}
        >
          Admin Login
        </button>
      </div>

      {/* Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {authTab === 'register' ? 'Register' : authTab === 'adminLogin' ? 'Admin Login' : 'Login'}
        </h2>
        
        {authTab === 'adminLogin' && (
          <div className="bg-purple-50 border border-purple-200 rounded p-4 mb-4">
            <p className="text-sm text-purple-700">
              Use admin credentials to access management features. Default admin: +77777777777 / admin123
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={authTab === 'register'}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="+77777777777"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {authTab === 'register' ? 'Register' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Dashboard Section Component
interface DashboardSectionProps {
  activeDashboardTab: string
  setActiveDashboardTab: (tab: string) => void
  products: Product[]
  branches: Branch[]
  orders: Order[]
  productBranchAssignments: ProductBranchAssignment[]
  uploadedImages: UploadedImage[]
  currentUser: User | null
  isConnected: boolean
  events: any[]
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
  openImageModal: (url: string, title: string) => void
  openEditProductModal: (productId: string) => void
  loadProducts: () => void
  loadBranches: () => void
  loadOrders: () => void
  loadProductBranchAssignments: () => void
  loadUploadedImages: () => void
  joinBaristaRoom: (branchId: string) => void
  leaveBaristaRoom: (branchId: string) => void
  testConnection: () => boolean
  clearEvents: () => void
}

const DashboardSection = ({ 
  activeDashboardTab, 
  setActiveDashboardTab,
  products,
  branches,
  orders,
  productBranchAssignments,
  uploadedImages,
  currentUser,
  isConnected,
  events,
  showNotification,
  openImageModal,
  openEditProductModal,
  loadProducts,
  loadBranches,
  loadOrders,
  loadProductBranchAssignments,
  loadUploadedImages,
  joinBaristaRoom,
  leaveBaristaRoom,
  testConnection,
  clearEvents
}: DashboardSectionProps) => {
  const tabs = [
    { id: 'products', label: 'Products' },
    { id: 'branches', label: 'Branches' },
    { id: 'orders', label: 'Orders' },
    { id: 'product-branches', label: 'Product-Branches' },
    { id: 'websocket', label: 'WebSocket' },
    { id: 'files', label: 'Files' },
    { id: 'images', label: 'Images' },
  ]

  const renderTabContent = () => {
    switch (activeDashboardTab) {
      case 'products':
        return (
          <ProductManagement
            products={products}
            loadProducts={loadProducts}
            showNotification={showNotification}
            openImageModal={openImageModal}
            openEditProductModal={openEditProductModal}
          />
        )
      
      case 'branches':
        return (
          <BranchManagement
            branches={branches}
            loadBranches={loadBranches}
            showNotification={showNotification}
          />
        )
      
      case 'orders':
        return (
          <OrderManagement
            orders={orders}
            products={products}
            branches={branches}
            loadOrders={loadOrders}
            showNotification={showNotification}
          />
        )
      
      case 'product-branches':
        return (
          <ProductBranchAssignmentManagement
            assignments={productBranchAssignments}
            products={products}
            branches={branches}
            loadAssignments={loadProductBranchAssignments}
            showNotification={showNotification}
          />
        )
      
      case 'websocket':
        return (
          <WebSocketManagement
            branches={branches}
            currentUser={currentUser}
            isConnected={isConnected}
            events={events}
            joinBaristaRoom={joinBaristaRoom}
            leaveBaristaRoom={leaveBaristaRoom}
            testConnection={testConnection}
            clearEvents={clearEvents}
          />
        )
      
      case 'files':
        return (
          <FileManagement
            showNotification={showNotification}
          />
        )
      
      case 'images':
        return (
          <ImageGallery
            images={uploadedImages}
            loadImages={loadUploadedImages}
            openImageModal={openImageModal}
            showNotification={showNotification}
          />
        )
      
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Select a tab to view content.</p>
          </div>
        )
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDashboardTab(tab.id)}
                className={`dashboard-tab py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeDashboardTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}
