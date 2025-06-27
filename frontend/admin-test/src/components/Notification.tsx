import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : 
                 type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div className={`notification ${bgColor} text-white p-4 rounded-lg shadow-lg flex justify-between items-center`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  )
}
