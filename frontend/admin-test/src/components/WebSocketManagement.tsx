'use client'

import { useState, useEffect } from 'react'
import { Branch, User } from '@/types'

interface WebSocketEvent {
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: Date
}

interface WebSocketManagementProps {
  branches: Branch[]
  currentUser: User | null
  isConnected: boolean
  events: WebSocketEvent[]
  joinBaristaRoom: (branchId: string) => void
  leaveBaristaRoom: (branchId: string) => void
  testConnection: () => boolean
  clearEvents: () => void
}

export const WebSocketManagement = ({ 
  branches, 
  currentUser, 
  isConnected, 
  events, 
  joinBaristaRoom, 
  leaveBaristaRoom, 
  testConnection, 
  clearEvents 
}: WebSocketManagementProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set())

  const handleJoinRoom = () => {
    if (!selectedBranchId) {
      return
    }
    joinBaristaRoom(selectedBranchId)
    setJoinedRooms(prev => {
      const newSet = new Set(prev)
      newSet.add(selectedBranchId)
      return newSet
    })
  }

  const handleLeaveRoom = (branchId: string) => {
    leaveBaristaRoom(branchId)
    setJoinedRooms(prev => {
      const newSet = new Set(prev)
      newSet.delete(branchId)
      return newSet
    })
  }

  const handleTestConnection = () => {
    const result = testConnection()
    return result
  }

  useEffect(() => {
    // Auto-select first branch if available and user is admin/barista
    if (branches.length > 0 && !selectedBranchId && currentUser && 
        (currentUser.role === 'ADMIN' || currentUser.role === 'BARISTA')) {
      setSelectedBranchId(branches[0].id)
    }
  }, [branches, selectedBranchId, currentUser])

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={handleTestConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Connection
          </button>
        </div>
        
        {currentUser && (
          <div className="mt-2 text-sm text-gray-600">
            Connected as: {currentUser.name} ({currentUser.role})
          </div>
        )}
      </div>

      {/* Room Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Join Room Controls */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-4">Barista Room Management</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleJoinRoom}
                disabled={!selectedBranchId || !isConnected}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
              <button
                onClick={() => selectedBranchId && handleLeaveRoom(selectedBranchId)}
                disabled={!selectedBranchId || !isConnected || !joinedRooms.has(selectedBranchId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Currently Joined Rooms */}
          {joinedRooms.size > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Joined Rooms:</h5>
              <div className="space-y-1">
                {branches.filter(b => joinedRooms.has(b.id)).map(branch => (
                  <div key={branch.id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                    <span className="text-sm">{branch.name}</span>
                    <button
                      onClick={() => handleLeaveRoom(branch.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Leave
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Statistics */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-4">Event Statistics</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Events:</span>
              <span className="font-medium">{events.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Events:</span>
              <span className="font-medium text-green-600">
                {events.filter(e => e.type === 'success').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Events:</span>
              <span className="font-medium text-red-600">
                {events.filter(e => e.type === 'error').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Info Events:</span>
              <span className="font-medium text-blue-600">
                {events.filter(e => e.type === 'info').length}
              </span>
            </div>
          </div>

          <button
            onClick={clearEvents}
            className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear All Events
          </button>
        </div>
      </div>

      {/* Events Log */}
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h4 className="font-medium">Events Log</h4>
          <div className="text-sm text-gray-500">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="p-4">
          <div className="h-64 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No events yet. WebSocket events will appear here...</p>
              </div>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 bg-gray-50 rounded text-sm"
                >
                  <span className="text-gray-500 font-mono text-xs">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className={`font-medium ${getEventColor(event.type)}`}>
                    [{event.type.toUpperCase()}]
                  </span>
                  <span className="flex-1">{event.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => {
              // Simulate order creation
              if (isConnected) {
                console.log('Simulating order creation...')
              }
            }}
            disabled={!isConnected}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
          >
            Simulate Order
          </button>
          
          <button
            onClick={() => {
              // Simulate status update
              if (isConnected) {
                console.log('Simulating status update...')
              }
            }}
            disabled={!isConnected}
            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            Simulate Update
          </button>
          
          <button
            onClick={handleTestConnection}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Ping Server
          </button>
          
          <button
            onClick={clearEvents}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Clear Log
          </button>
        </div>
      </div>
    </div>
  )
}
