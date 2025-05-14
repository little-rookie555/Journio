import { AuthRoute } from '@/components/AuthRoute';
import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// 使用 React.lazy() 懒加载组件
const Layout = React.lazy(() => import('@/pages/Layout'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const TravelPublish = React.lazy(() => import('@/pages/TravelPublish'));
const Following = React.lazy(() => import('@/pages/Following'));
const TravelDetail = React.lazy(() => import('@/pages/TravelDetail'));
const TravelList = React.lazy(() => import('@/pages/TravelList'));
const MyTravels = React.lazy(() => import('@/pages/MyTravels'));
const Profile = React.lazy(() => import('@/pages/Profile'));

// 创建加载中组件
const LoadingComponent = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    加载中...
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/profile/:userId',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/publish',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <AuthRoute>
          <TravelPublish />
        </AuthRoute>
      </Suspense>
    ),
  },
  {
    path: 'following/:id',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <AuthRoute>
          <Following />
        </AuthRoute>
      </Suspense>
    ),
  },
  {
    path: '/detail/:id',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <TravelDetail />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <TravelList />
          </Suspense>
        ),
      },
      {
        path: 'my-travels',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <AuthRoute>
              <MyTravels />
            </AuthRoute>
          </Suspense>
        ),
      },
    ],
  },
]);
