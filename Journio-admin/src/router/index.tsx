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
    element: <MainLayout />,
    children: [
      {
        index: true, //默认加载
        element: <Navigate to="/audit" replace />,
      },
      {
        path: 'audit',
        element: <AuditList />,
      },
    ],
  },
]);
