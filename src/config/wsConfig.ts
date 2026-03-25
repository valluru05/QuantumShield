// Determine WebSocket URL based on the current connection environment
export const getWSUrl = (): string => {
  // Get the current hostname
  const hostname = window.location.hostname;

  // If accessing from localhost or 127.0.0.1, use localhost (same machine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3001';
  }

  // If accessing from a different IP (multi-laptop setup), use that IP
  // This automatically detects when you're connecting from another machine
  return `ws://${hostname}:3001`;
};
