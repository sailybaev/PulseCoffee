'use client'

import { useState } from 'react'
import { UploadedImage } from '@/types'

interface ImageGalleryProps {
  images: UploadedImage[]
  loadImages: () => void
  openImageModal: (url: string, title: string) => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export const ImageGallery = ({ 
  images, 
  loadImages, 
  openImageModal, 
  showNotification 
}: ImageGalleryProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredImages = images
    .filter(image => {
      // Filter by type
      if (filterType !== 'all' && !image.mimetype.includes(filterType)) {
        return false
      }
      
      // Filter by search term
      if (searchTerm && !image.originalName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName)
        case 'size':
          return b.size - a.size
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getImageTypes = () => {
    const types = new Set(images.map(img => img.mimetype.split('/')[1]))
    return Array.from(types)
  }

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Image URL copied to clipboard!', 'success')
    }).catch(() => {
      showNotification('Failed to copy URL', 'error')
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h3 className="text-lg font-semibold">Image Gallery</h3>
        <button
          onClick={loadImages}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Images
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by filename..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filter by type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {getImageTypes().map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="date">Upload Date</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
            </select>
          </div>

          {/* View mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 text-sm rounded ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 text-sm rounded ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredImages.length}</div>
          <div className="text-sm text-gray-600">
            {filteredImages.length === images.length ? 'Total Images' : 'Filtered Images'}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatFileSize(filteredImages.reduce((total, img) => total + img.size, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {getImageTypes().length}
          </div>
          <div className="text-sm text-gray-600">File Types</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {filteredImages.filter(img => img.size > 1024 * 1024).length}
          </div>
          <div className="text-sm text-gray-600">Large Files (&gt;1MB)</div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white border rounded-lg">
        <div className="p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🖼️</div>
              <p className="text-lg font-medium">No images found</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Upload some images to get started!'
                }
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredImages.map(image => (
                <div key={image.filename} className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                    onClick={() => openImageModal(image.url, image.originalName)}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
                    <div className="w-full p-2 bg-gradient-to-t from-black to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="truncate font-medium">{image.originalName}</p>
                      <p className="text-gray-300">{formatFileSize(image.size)}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyImageUrl(image.url)
                      }}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 p-1 rounded text-xs"
                      title="Copy URL"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map(image => (
                <div key={image.filename} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => openImageModal(image.url, image.originalName)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{image.originalName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.mimetype}</span>
                      <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyImageUrl(image.url)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => openImageModal(image.url, image.originalName)}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
