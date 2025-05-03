import AuthRoute from '@/components/AuthRoute';
import MainLayout from '@/pages/Layout';
import AuditList from '@/pages/audit';
import Login from '@/pages/login';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthRoute>
        <MainLayout />
      </AuthRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <AuthRoute>
            <Navigate to="/audit" replace />
          </AuthRoute>
        ),
      },
      {
        path: 'audit',
        element: (
          <AuthRoute>
            <AuditList />
          </AuthRoute>
        ),
      },
    ],
  },
]);
