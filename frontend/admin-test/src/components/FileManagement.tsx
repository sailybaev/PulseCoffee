'use client'

import { useState } from 'react'
import api from '@/lib/api'

interface FileManagementProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export const FileManagement = ({ showNotification }: FileManagementProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const uploadFile = async () => {
    if (!selectedFile) {
      showNotification('Please select a file to upload', 'error')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        }
      })

      showNotification('File uploaded successfully!', 'success')
      setSelectedFile(null)
      setUploadProgress(0)
      
      // Add to uploaded files list
      setUploadedFiles(prev => [response.data, ...prev])
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'File upload failed', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const loadUploadedFiles = async () => {
    try {
      const response = await api.get('/upload/files')
      setUploadedFiles(response.data)
      showNotification('Files loaded successfully', 'success')
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to load files', 'error')
    }
  }

  const deleteFile = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await api.delete(`/upload/${filename}`)
      showNotification('File deleted successfully!', 'success')
      setUploadedFiles(prev => prev.filter(file => file.filename !== filename))
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete file', 'error')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️'
    if (mimetype.startsWith('video/')) return '🎥'
    if (mimetype.startsWith('audio/')) return '🎵'
    if (mimetype.includes('pdf')) return '📄'
    if (mimetype.includes('text')) return '📝'
    return '📎'
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium mb-4">Upload Files</h4>
        
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="space-y-3">
              <div className="text-lg">{getFileTypeIcon(selectedFile.type)}</div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              <div className="flex justify-center space-x-2">
                <button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports images, documents, and other file types
                </p>
              </div>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files Section */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h4 className="font-medium">Uploaded Files</h4>
          <button
            onClick={loadUploadedFiles}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Refresh
          </button>
        </div>
        
        <div className="p-6">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No files uploaded yet. Upload your first file to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{getFileTypeIcon(file.mimetype || '')}</div>
                    <button
                      onClick={() => deleteFile(file.filename)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="font-medium text-sm truncate" title={file.originalName || file.filename}>
                      {file.originalName || file.filename}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.mimetype}
                    </p>
                    {file.uploadDate && (
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {file.url && (
                    <div className="mt-3">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View File
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Operations */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium mb-4">File Operations</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h5 className="font-medium">Total Files</h5>
            <p className="text-lg font-bold text-blue-600">{uploadedFiles.length}</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">💾</div>
            <h5 className="font-medium">Total Size</h5>
            <p className="text-lg font-bold text-green-600">
              {formatFileSize(uploadedFiles.reduce((total, file) => total + (file.size || 0), 0))}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <h5 className="font-medium">Images</h5>
            <p className="text-lg font-bold text-purple-600">
              {uploadedFiles.filter(file => file.mimetype?.startsWith('image/')).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
