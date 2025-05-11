import { AuthRoute } from '@/components/AuthRoute';
import Following from '@/pages/Following';
import Layout from '@/pages/Layout';
import Login from '@/pages/Login';
import MyTravels from '@/pages/MyTravels';
import Register from '@/pages/Register';
import TravelDetail from '@/pages/TravelDetail';
import TravelList from '@/pages/TravelList';
import TravelPublish from '@/pages/TravelPublish';
import Profile from '@/pages/Profile';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/profile/:userId',
    element: <Profile />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/publish',
    element: (
      <AuthRoute>
        <TravelPublish />
      </AuthRoute>
    ),
  },
  {
    path: 'following',
    element: (
      <AuthRoute>
        <Following />
      </AuthRoute>
    ),
  },
  {
    path: '/detail/:id',
    element: <TravelDetail />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <TravelList />,
      },
      {
        path: 'my-travels',
        element: (
          <AuthRoute>
            <MyTravels />
          </AuthRoute>
        ),
      },
    ],
  },
]);
