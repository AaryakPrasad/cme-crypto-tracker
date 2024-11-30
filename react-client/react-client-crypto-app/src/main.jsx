import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import AccountPage from './pages/AccountPage';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import CryptoPage from './pages/CryptoPage';
import LandingPage from './pages/LandingPage';
import Layout from './layout/dashboard';
import NotFoundPage from './pages/NotFoundPage';


const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: LandingPage,
      },
      {
        path: '/app',
        Component: Layout,
        children: [
          {
            path: 'dashboard',
            Component: CryptoPage,
          },
          {
            path: 'account',
            Component: AccountPage,
          },
        ],
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/signup',
        Component: Signup,
      },
      {
        path: '*',
        Component: NotFoundPage
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
