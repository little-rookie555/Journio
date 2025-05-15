import AuthRoute from '@/components/AuthRoute';
import MainLayout from '@/pages/Layout';
import AdminList from '@/pages/admin/admins';
import UserList from '@/pages/admin/users';
import Login from '@/pages/login';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PendingAudit from '@/pages/audit/pending';
import ApprovedAudit from '@/pages/audit/approved';
import RejectedAudit from '@/pages/audit/rejected';
import StatisticPage from '@/pages/statistic';

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
        path: 'statistic',
        element: (
          <AuthRoute>
            <StatisticPage />
          </AuthRoute>
        ),
      },
      {
        path: 'audit/pending',
        element: (
          <AuthRoute>
            <PendingAudit />
          </AuthRoute>
        ),
      },
      {
        path: 'audit/approved',
        element: (
          <AuthRoute>
            <ApprovedAudit />
          </AuthRoute>
        ),
      },
      {
        path: 'audit/rejected',
        element: (
          <AuthRoute>
            <RejectedAudit />
          </AuthRoute>
        ),
      },
      {
        path: 'admin/admins',
        element: (
          <AuthRoute>
            <AdminList />
          </AuthRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AuthRoute>
            <UserList />
          </AuthRoute>
        ),
      },
    ],
  },
]);
