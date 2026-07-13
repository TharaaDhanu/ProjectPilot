/**
 * routes/AppRoutes.js
 * -------------------
 * Centralised React Router v6 route definitions.
 *
 * Public routes   : /login, /register
 * Protected routes: / and /dashboard → DashboardPage
 * Catch-all       : → /login
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage     from '../pages/auth/LoginPage';
import RegisterPage  from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectsPage  from '../pages/projects/ProjectsPage';
import TasksPage     from '../pages/tasks/TasksPage';
import TeamPage      from '../pages/team/TeamPage';
import CalendarPage  from '../pages/calendar/CalendarPage';
import ReportsPage   from '../pages/reports/ReportsPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Module routes */}
      <Route path="/projects"      element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/tasks"         element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/team"          element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="/calendar"      element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/reports"       element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      {/* Catch-all: redirect unknown paths to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
