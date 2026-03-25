import { useSystem } from '../context/SystemContext';

export function ConnectionStatus() {
  const { isConnected, clientId } = useSystem();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      ></div>
      <span className="text-xs font-medium text-gray-300">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      {clientId && <span className="text-xs text-gray-500">({clientId.slice(0, 5)}...)</span>}
    </div>
  );
}
