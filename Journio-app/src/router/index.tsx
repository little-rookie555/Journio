import Layout from '@/pages/Layout';
import Login from '@/pages/Login';
import MyTravels from '@/pages/MyTravels';
import Register from '@/pages/Register';
import TravelDetail from '@/pages/TravelDetail';
import TravelList from '@/pages/TravelList';
import TravelPublish from '@/pages/TravelPublish';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
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
        element: <MyTravels />,
      },
      {
        path: 'publish',
        element: <TravelPublish />,
      },
      {
        path: 'detail/:id',
        element: <TravelDetail />,
      },
    ],
  },
]);
