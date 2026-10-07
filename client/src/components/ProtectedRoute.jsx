import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-500">Checking secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the dashboard appropriate for user's role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'pharmacy') return <Navigate to="/pharmacy" replace />;
    return <Navigate to="/patient" replace />;
  }

  return children;
}
