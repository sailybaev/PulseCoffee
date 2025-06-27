'use client';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          isConnected 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-red-500'
        }`}
        title={isConnected ? 'Connected to server' : 'Disconnected from server'}
      />
      <span className={`text-sm font-medium ${
        isConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
