import MainLayout from '@/pages/Layout';
import AuditList from '@/pages/audit';
import Login from '@/pages/login';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'audit',
        element: <AuditList />,
      },
    ],
  },
]);
