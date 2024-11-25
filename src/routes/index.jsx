import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Contacts from '../pages/Contacts';
import Documents from '../pages/Documents';
import Profile from '../pages/Profile';
import Policies from '../pages/Policies';
import Activities from '../pages/Activities';
import Calendar from '../pages/Calendar';
import Tasks from '../pages/Tasks';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'contacts',
        element: <Contacts />,
      },
      {
        path: 'documents',
        element: <Documents />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'policies',
        element: <Policies />,
      },
      {
        path: 'activities',
        element: <Activities />,
      },
      {
        path: 'calendar',
        element: <Calendar />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
    ],
  },
]);
