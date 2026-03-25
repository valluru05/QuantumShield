import { RouterProvider } from 'react-router';
import { SystemProvider } from './context/SystemContext';
import { router } from './routes';

export default function App() {
  return (
    <SystemProvider>
      <RouterProvider router={router} />
    </SystemProvider>
  );
}
