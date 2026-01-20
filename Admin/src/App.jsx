import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServiceLeads from './pages/ServiceLeads';
import QuoteRequests from './pages/QuoteRequests';
import ExpertRequests from './pages/ExpertRequests';
import SupportRequests from './pages/SupportRequests';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<ServiceLeads />} />
        <Route path="quotes" element={<QuoteRequests />} />
        <Route path="expert" element={<ExpertRequests />} />
        <Route path="support" element={<SupportRequests />} />
        <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
