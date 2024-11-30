import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App'
import Layout from './layout/dashboard';
import AccountPage from './pages/AccountPage';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import CryptoPage from './pages/CryptoPage';


const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/dashboard',
            Component: CryptoPage,
          },
          {
            path: '/account',
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
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
