import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Order } from '@/types'

interface UseWebSocketProps {
  accessToken: string | null
  user: any
}

interface WebSocketEvent {
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: Date
}

export const useWebSocket = ({ accessToken, user }: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<WebSocketEvent[]>([])

  const addEvent = (message: string, type: 'success' | 'error' | 'info') => {
    setEvents(prev => [...prev, { message, type, timestamp: new Date() }])
  }

  const clearEvents = () => {
    setEvents([])
  }

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const newSocket = io('http://localhost:3000', {
      auth: {
        token: accessToken
      }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      addEvent('Connected to server', 'success')
      
      // If user is admin or barista, auto-join first branch for testing
      if (user && (user.role === 'ADMIN' || user.role === 'BARISTA')) {
        // This would typically be handled by loading available branches
        // For now, we'll handle it in the component
      }
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      addEvent('Disconnected from server', 'error')
    })

    newSocket.on('newOrder', (order: Order) => {
      addEvent(`New order received: #${order.id} for ${order.total} ₸`, 'info')
    })

    newSocket.on('orderStatusUpdate', (data: { orderId: string; status: string }) => {
      addEvent(`Order ${data.orderId} status: ${data.status}`, 'info')
    })

    newSocket.on('joinedBaristaRoom', (data: { branchId: string }) => {
      addEvent(`Successfully joined barista room for branch: ${data.branchId}`, 'success')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [accessToken, user])

  const joinBaristaRoom = (branchId: string) => {
    if (socket && branchId) {
      socket.emit('joinBaristaRoom', branchId)
      addEvent(`Attempting to join barista room for branch: ${branchId}`, 'info')
    } else {
      addEvent('Cannot join barista room: no branch ID provided or socket not connected', 'error')
    }
  }

  const leaveBaristaRoom = (branchId: string) => {
    if (socket && branchId) {
      socket.emit('leaveBaristaRoom', branchId)
      addEvent(`Left barista room for branch: ${branchId}`, 'info')
    } else {
      addEvent('Cannot leave barista room: no branch ID provided or socket not connected', 'error')
    }
  }

  const testConnection = () => {
    if (socket && isConnected) {
      addEvent('WebSocket connection test', 'info')
      return true
    } else {
      addEvent('WebSocket is not connected', 'error')
      return false
    }
  }

  return {
    socket,
    isConnected,
    events,
    addEvent,
    clearEvents,
    joinBaristaRoom,
    leaveBaristaRoom,
    testConnection
  }
}
