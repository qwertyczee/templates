import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading, setIsProtectedRoute } = useAuth();

  useEffect(() => {
    setIsProtectedRoute(true);

    return () => {
      setIsProtectedRoute(false);
    };
  }, [setIsProtectedRoute]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner comming soon
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
