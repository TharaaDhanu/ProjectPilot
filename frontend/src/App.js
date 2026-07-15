/**
 * App.js
 * ------
 * Root application component.
 *
 * Responsibilities:
 *   - Wraps everything in <BrowserRouter> for React Router
 *   - Wraps everything in <AuthProvider> for auth state
 *   - Wraps everything in <SidebarProvider> for sidebar state
 *   - Renders <ToastContainer> (global toast notifications)
 *   - Renders <AppRoutes> (all page routing)
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          {/* Global toast container — positioned top-right, max 3 toasts */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={3}
            theme="dark"
          />

          <AppRoutes />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;