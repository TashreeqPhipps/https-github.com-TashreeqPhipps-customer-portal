import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    // Forbidden
    return <div style={{padding:20}}><h3>Access denied</h3><p>Your account does not have the required permissions.</p></div>;
  }

  return children;
}
