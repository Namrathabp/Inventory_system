import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  // If they aren't logged in at all, send to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in but have the wrong role, kick them out
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // If they pass the checks, let them in!
  return children;
}