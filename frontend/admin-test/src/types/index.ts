export interface User {
  id: string
  name: string
  phoneNumber: string
  role: 'ADMIN' | 'BARISTA' | 'CUSTOMER'
}

export interface Product {
  id: string
  name: string
  description?: string
  basePrice: number
  category: 'COFFEE' | 'TEA' | 'DESSERT' | 'SNACK'
  imageUrl?: string
}

export interface Branch {
  id: string
  name: string
  address?: string
}

export interface Order {
  id: string
  userId?: string
  branchId: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  branch: Branch
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface ProductBranchAssignment {
  id: string
  productId: string
  branchId: string
  quantity: number
  product: Product
  branch: Branch
}

export interface UploadedImage {
  filename: string
  originalName: string
  mimetype: string
  size: number
  uploadDate: string
  url: string
}
