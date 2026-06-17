import { createBrowserRouter, Navigate } from 'react-router';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { AttackerPage } from './pages/AttackerPage';
import { DefenderPage } from './pages/DefenderPage';
import { QuantumLabPage } from './pages/QuantumLabPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CommandCenterPage />,
  },
  {
    path: '/command-center',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/attacker',
    element: <AttackerPage />,
  },
  {
    path: '/defender',
    element: <DefenderPage />,
  },
  {
    path: '/quantum-lab',
    element: <QuantumLabPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
