import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { AttackerPage } from './pages/AttackerPage';
import { DefenderPage } from './pages/DefenderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/attacker',
    element: <AttackerPage />,
  },
  {
    path: '/defender',
    element: <DefenderPage />,
  },
]);
