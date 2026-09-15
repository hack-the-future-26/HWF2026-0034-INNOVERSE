import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { LocationsPage } from './pages/customer/LocationsPage';
import { LocationDetailPage } from './pages/customer/LocationDetailPage';
import { JoinQueuePage } from './pages/customer/JoinQueuePage';
import { LiveQueuePage } from './pages/customer/LiveQueuePage';
import { HistoryPage } from './pages/customer/HistoryPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffQueuesPage } from './pages/staff/StaffQueuesPage';
import { StaffQueueControlPage } from './pages/staff/StaffQueueControlPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLocationsPage } from './pages/admin/AdminLocationsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

import { ToastProvider } from './contexts/ToastContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>

        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/locations"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <LocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/location/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <LocationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/join"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <JoinQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/queue/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <LiveQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/history"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/notifications"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/queues"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffQueuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/queue/:id"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffQueueControlPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/locations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </ToastProvider>
  </AuthProvider>
);
};


export default App;
